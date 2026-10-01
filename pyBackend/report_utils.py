import base64
import io
import json
import time

import fitz
from pypdf import PdfReader

from prompts import (
    get_medical_report_text_prompt,
    get_medical_report_vision_prompt,
)


REPORT_VISION_MODEL = "qwen/qwen3.8-27b"
MAX_FILE_SIZE = 20 * 1024 * 1024


def clean_json_response(content: str) -> dict:
    clean_json = content.strip()

    if clean_json.startswith("```"):
        lines = clean_json.split("\n")

        if len(lines) >= 3:
            clean_json = "\n".join(lines[1:-1])

    return json.loads(clean_json)


def extract_pdf_text(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []

    for page in reader.pages:
        text = page.extract_text() or ""

        if text.strip():
            pages.append(text.strip())

    return "\n\n".join(pages).strip()


def render_pdf_pages(file_bytes: bytes, max_pages: int = 3) -> list[str]:
    document = fitz.open(stream=file_bytes, filetype="pdf")
    images = []

    try:
        page_count = min(len(document), max_pages)

        for index in range(page_count):
            page = document.load_page(index)

            pixmap = page.get_pixmap(
                matrix=fitz.Matrix(1.5, 1.5),
                alpha=False,
            )

            image_bytes = pixmap.tobytes("jpeg")
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")

            images.append(
                f"data:image/jpeg;base64,{image_base64}"
            )

    finally:
        document.close()

    return images


async def analyze_report_image(
    client,
    image_data_url: str,
    model_name: str,
) -> tuple[dict, int, int, int]:
    response = await client.chat.completions.create(
        model=model_name,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": get_medical_report_vision_prompt(),
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_data_url,
                        },
                    },
                ],
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
        max_completion_tokens=3000,
    )

    usage = getattr(response, "usage", None)

    tokens_prompt = getattr(usage, "prompt_tokens", 0) if usage else 0
    tokens_completion = getattr(usage, "completion_tokens", 0) if usage else 0
    tokens_total = (
        getattr(usage, "total_tokens", 0)
        if usage
        else tokens_prompt + tokens_completion
    )

    content = response.choices[0].message.content or "{}"

    return (
        clean_json_response(content),
        tokens_prompt,
        tokens_completion,
        tokens_total,
    )


async def process_medical_report(
    client,
    file_name: str,
    content_type: str,
    file_bytes: bytes,
    ai_model_override: str | None = None,
) -> dict:
    allowed_types = {
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if content_type not in allowed_types:
        raise ValueError("Unsupported medical report format.")

    if not file_bytes:
        raise ValueError("Uploaded report is empty.")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError("The report must be smaller than 20 MB.")

    start_time = time.perf_counter()

    text_model = ai_model_override or "openai/gpt-oss-120b"

    total_prompt_tokens = 0
    total_completion_tokens = 0
    total_tokens = 0

    if content_type == "application/pdf":
        report_text = extract_pdf_text(file_bytes)

        if report_text.strip():
            prompt = get_medical_report_text_prompt(report_text)

            response = await client.chat.completions.create(
                model=text_model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_completion_tokens=3000,
            )

            usage = getattr(response, "usage", None)

            total_prompt_tokens = (
                getattr(usage, "prompt_tokens", 0)
                if usage
                else 0
            )

            total_completion_tokens = (
                getattr(usage, "completion_tokens", 0)
                if usage
                else 0
            )

            total_tokens = (
                getattr(usage, "total_tokens", 0)
                if usage
                else total_prompt_tokens + total_completion_tokens
            )

            analysis = clean_json_response(
                response.choices[0].message.content or "{}"
            )

            ai_model = text_model

        else:
            page_images = render_pdf_pages(
                file_bytes,
                max_pages=3,
            )

            if not page_images:
                raise ValueError(
                    "Could not read any pages from the PDF."
                )

            page_results = []

            for image_data_url in page_images:
                result = await analyze_report_image(
                    client,
                    image_data_url,
                    REPORT_VISION_MODEL,
                )

                page_results.append(result[0])
                total_prompt_tokens += result[1]
                total_completion_tokens += result[2]
                total_tokens += result[3]

            combined_report = json.dumps(
                page_results,
                ensure_ascii=False,
            )

            synthesis_response = await client.chat.completions.create(
                model=text_model,
                messages=[
                    {
                        "role": "user",
                        "content": get_medical_report_text_prompt(
                            combined_report
                        ),
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_completion_tokens=3000,
            )

            usage = getattr(synthesis_response, "usage", None)

            synthesis_prompt_tokens = (
                getattr(usage, "prompt_tokens", 0)
                if usage
                else 0
            )

            synthesis_completion_tokens = (
                getattr(usage, "completion_tokens", 0)
                if usage
                else 0
            )

            synthesis_total_tokens = (
                getattr(usage, "total_tokens", 0)
                if usage
                else synthesis_prompt_tokens + synthesis_completion_tokens
            )

            total_prompt_tokens += synthesis_prompt_tokens
            total_completion_tokens += synthesis_completion_tokens
            total_tokens += synthesis_total_tokens

            analysis = clean_json_response(
                synthesis_response.choices[0].message.content or "{}"
            )

            ai_model = f"{REPORT_VISION_MODEL} + {text_model}"

    else:
        image_base64 = base64.b64encode(file_bytes).decode("utf-8")
        image_data_url = f"data:{content_type};base64,{image_base64}"

        (
            analysis,
            total_prompt_tokens,
            total_completion_tokens,
            total_tokens,
        ) = await analyze_report_image(
            client,
            image_data_url,
            REPORT_VISION_MODEL,
        )

        ai_model = REPORT_VISION_MODEL

    response_time_sec = round(
        time.perf_counter() - start_time,
        3,
    )

    return {
        **analysis,
        "file_name": file_name,
        "ai_model": ai_model,
        "tokens_prompt": total_prompt_tokens,
        "tokens_completion": total_completion_tokens,
        "tokens_total": total_tokens,
        "response_time_sec": response_time_sec,
    }