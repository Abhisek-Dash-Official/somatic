import json
import os
import time
import traceback
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import AsyncGroq
from pydantic import BaseModel

from prompts import (
    get_medical_prompt,
    get_translation_prompt,
    get_soma_system_prompt,
    get_soma_summary_prompt,
)
from rag import initialize_knowledge_base, retrieve_relevant_context
from report_utils import process_medical_report


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET")

client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Vector DB & Ayurvedic Knowledge Base...")
    initialize_knowledge_base()
    yield
    print("Shutting down AI Microservice...")


app = FastAPI(
    title="Somatic Secure RAG AI Microservice",
    lifespan=lifespan,
)

app_url = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[app_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientInput(BaseModel):
    symptoms_raw_text: str
    age: int | None = None
    weight_kg: float | None = None
    ai_model_override: str | None = "openai/gpt-oss-120b"
    custom_system_prompt: str | None = None
    available_departments: list[dict] = []


class AIDraftResponse(BaseModel):
    translated_symptoms: str
    is_emergency: bool
    chief_complaints: list[str]
    suggested_medicines: list[str] = []
    ayurvedic_hints: str = ""
    ai_summary_and_advice: str
    assigned_department_id: str | None = None
    tokens_prompt: int | None = 0
    tokens_completion: int | None = 0
    response_time_sec: float | None = 0.0
    ai_status: str = "success"


@app.post("/api/analyze-symptoms", response_model=AIDraftResponse)
async def analyze_symptoms(
    payload: PatientInput,
    x_internal_secret: str = Header(None),
):
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Invalid or missing internal secret token.",
        )

    if not client:
        raise HTTPException(
            status_code=500,
            detail="Groq API Key is missing.",
        )

    retrieved_context = retrieve_relevant_context(payload.symptoms_raw_text)

    default_base_prompt = (
        "You are an expert AI medical assistant trained in both "
        "Allopathic triage and Ayurvedic principles (Doshas). "
        "Analyze the patient's symptoms carefully using the "
        "provided reference context."
    )

    base_prompt = payload.custom_system_prompt or default_base_prompt

    prompt = get_medical_prompt(
        base_prompt=base_prompt,
        age=payload.age,
        weight_kg=payload.weight_kg,
        symptoms_raw_text=payload.symptoms_raw_text,
        retrieved_context=retrieved_context,
        available_departments=payload.available_departments,
    )

    try:
        model_name = payload.ai_model_override or "openai/gpt-oss-120b"
        start_time = time.perf_counter()

        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
        )

        response_time_sec = round(time.perf_counter() - start_time, 3)
        usage = getattr(response, "usage", None)

        tokens_prompt = getattr(usage, "prompt_tokens", 0) if usage else 0
        tokens_completion = getattr(usage, "completion_tokens", 0) if usage else 0

        clean_json = response.choices[0].message.content.strip()

        if clean_json.startswith("```"):
            clean_json = "\n".join(clean_json.split("\n")[1:-1])

        parsed_data = json.loads(clean_json)

        parsed_data["tokens_prompt"] = tokens_prompt
        parsed_data["tokens_completion"] = tokens_completion
        parsed_data["response_time_sec"] = response_time_sec
        parsed_data["ai_status"] = "success"

        return parsed_data

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


class BatchTranslationRequest(BaseModel):
    texts: dict[str, str]
    target_language: str
    ai_model_override: str | None = None


@app.post("/api/translate-batch")
async def translate_batch_text(
    payload: BatchTranslationRequest,
    x_internal_secret: str = Header(None),
):
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not client:
        raise HTTPException(
            status_code=500,
            detail="Groq API Key is missing.",
        )

    prompt = get_translation_prompt(payload.texts, payload.target_language)

    try:
        model_name = payload.ai_model_override or "openai/gpt-oss-120b"
        start_time = time.perf_counter()

        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1,
        )

        response_time_sec = round(time.perf_counter() - start_time, 3)
        usage = getattr(response, "usage", None)

        tokens_prompt = getattr(usage, "prompt_tokens", 0) if usage else 0
        tokens_completion = getattr(usage, "completion_tokens", 0) if usage else 0
        tokens_total = (
            getattr(usage, "total_tokens", 0)
            if usage
            else tokens_prompt + tokens_completion
        )

        clean_json = response.choices[0].message.content.strip()

        if clean_json.startswith("```"):
            clean_json = "\n".join(clean_json.split("\n")[1:-1])

        translated_dict = json.loads(clean_json)

        return {
            **translated_dict,
            "ai_model": model_name,
            "tokens_prompt": tokens_prompt,
            "tokens_completion": tokens_completion,
            "tokens_total": tokens_total,
            "response_time_sec": response_time_sec,
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


class SomaChatMessage(BaseModel):
    role: str
    content: str


class SomaChatRequest(BaseModel):
    messages: list[SomaChatMessage]
    conversation_summary: str = ""
    ai_model_override: str | None = "openai/gpt-oss-120b"
    custom_system_prompt: str | None = None


@app.post("/api/soma-chat")
async def soma_chat(
    payload: SomaChatRequest,
    x_internal_secret: str = Header(None),
):
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not client:
        raise HTTPException(
            status_code=500,
            detail="Groq API Key is missing.",
        )

    if not payload.messages:
        raise HTTPException(
            status_code=400,
            detail="At least one message is required.",
        )

    model_name = payload.ai_model_override or "openai/gpt-oss-120b"
    base_system_prompt = get_soma_system_prompt()

    if payload.custom_system_prompt:
        system_prompt = (
            f"{base_system_prompt}\n\n"
            "Additional administrator instructions:\n"
            f"{payload.custom_system_prompt}"
        )
    else:
        system_prompt = base_system_prompt

    messages = [{"role": "system", "content": system_prompt}]

    if payload.conversation_summary.strip():
        messages.append(
            {
                "role": "system",
                "content": (
                    "Previous conversation memory:\n\n"
                    f"{payload.conversation_summary.strip()}\n\n"
                    "Use this only as factual context. "
                    "Do not invent information that is not present "
                    "in the current conversation or memory."
                ),
            }
        )

    for message in payload.messages:
        if message.role not in {"user", "assistant"}:
            continue

        if not message.content.strip():
            continue

        messages.append(
            {
                "role": message.role,
                "content": message.content.strip(),
            }
        )

    latest_user_message = ""

    for message in reversed(payload.messages):
        if message.role == "user" and message.content.strip():
            latest_user_message = message.content.strip()
            break

    async def generate():
        start_time = time.perf_counter()
        full_response = []
        usage = None

        try:
            stream = await client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.3,
                max_completion_tokens=1200,
                stream=True,
                extra_body={
                    "stream_options": {
                        "include_usage": True,
                    }
                },
            )

            yield (
                "data: "
                + json.dumps(
                    {
                        "type": "start",
                        "model": model_name,
                    }
                )
                + "\n\n"
            )

            async for chunk in stream:
                if getattr(chunk, "usage", None):
                    usage = chunk.usage

                if not chunk.choices:
                    continue

                content = chunk.choices[0].delta.content

                if content:
                    full_response.append(content)

                    yield (
                        "data: "
                        + json.dumps(
                            {
                                "type": "delta",
                                "content": content,
                            }
                        )
                        + "\n\n"
                    )

            response_time_sec = round(
                time.perf_counter() - start_time,
                3,
            )

            tokens_prompt = getattr(usage, "prompt_tokens", 0) if usage else 0
            tokens_completion = (
                getattr(usage, "completion_tokens", 0) if usage else 0
            )
            tokens_total = (
                getattr(usage, "total_tokens", 0)
                if usage
                else tokens_prompt + tokens_completion
            )

            assistant_response = "".join(full_response).strip()
            conversation_summary = ""

            if assistant_response:
                summary_prompt = get_soma_summary_prompt(
                    previous_summary=payload.conversation_summary,
                    latest_user_message=latest_user_message,
                    latest_assistant_response=assistant_response,
                )

                summary_response = await client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You create concise factual "
                                "conversation memory for a "
                                "healthcare assistant. "
                                "Never invent facts."
                            ),
                        },
                        {
                            "role": "user",
                            "content": summary_prompt,
                        },
                    ],
                    temperature=0.1,
                    max_completion_tokens=200,
                )

                conversation_summary = (
                    summary_response.choices[0].message.content.strip()
                )

                summary_usage = getattr(summary_response, "usage", None)

                summary_prompt_tokens = (
                    getattr(summary_usage, "prompt_tokens", 0)
                    if summary_usage
                    else 0
                )
                summary_completion_tokens = (
                    getattr(summary_usage, "completion_tokens", 0)
                    if summary_usage
                    else 0
                )
                summary_total_tokens = (
                    getattr(summary_usage, "total_tokens", 0)
                    if summary_usage
                    else summary_prompt_tokens + summary_completion_tokens
                )

                tokens_prompt += summary_prompt_tokens
                tokens_completion += summary_completion_tokens
                tokens_total += summary_total_tokens

            yield (
                "data: "
                + json.dumps(
                    {
                        "type": "done",
                        "ai_model": model_name,
                        "tokens_prompt": tokens_prompt,
                        "tokens_completion": tokens_completion,
                        "tokens_total": tokens_total,
                        "response_time_sec": response_time_sec,
                        "conversation_summary": conversation_summary,
                    }
                )
                + "\n\n"
            )

        except Exception as e:
            traceback.print_exc()

            yield (
                "data: "
                + json.dumps(
                    {
                        "type": "error",
                        "message": str(e),
                    }
                )
                + "\n\n"
            )

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/analyze-medical-report")
async def analyze_medical_report(
    file: UploadFile = File(...),
    ai_model_override: str = Form("openai/gpt-oss-120b"),
    x_internal_secret: str = Header(None),
):
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(
            status_code=403,
            detail="Forbidden",
        )

    if not client:
        raise HTTPException(
            status_code=500,
            detail="Groq API Key is missing.",
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must have a filename.",
        )

    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded report is empty.",
            )

        if len(file_bytes) > 20 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="The report must be smaller than 20 MB.",
            )

        result = await process_medical_report(
            client=client,
            file_name=file.filename,
            content_type=file.content_type or "",
            file_bytes=file_bytes,
            ai_model_override=ai_model_override,
        )

        return result

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Failed to analyze the medical report.",
        )


@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "Secure Somatic AI Microservice is active",
    }