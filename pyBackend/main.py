import os
import json
import time
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from groq import AsyncGroq

from prompts import get_medical_prompt, get_translation_prompt
from rag import retrieve_relevant_context, initialize_knowledge_base


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
INTERNAL_API_SECRET = os.getenv(
    "INTERNAL_API_SECRET",
    "my_super_secret_key_123"
)

client = AsyncGroq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Vector DB & Ayurvedic Knowledge Base...")
    initialize_knowledge_base()
    yield
    print("Shutting down AI Microservice...")


app = FastAPI(
    title="Somatic Secure RAG AI Microservice",
    lifespan=lifespan
)

app_url = os.getenv(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000"
)

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
    x_internal_secret: str = Header(None)
):
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Invalid or missing internal secret token."
        )

    if not client:
        raise HTTPException(
            status_code=500,
            detail="Groq API Key is missing."
        )

    retrieved_context = retrieve_relevant_context(
        payload.symptoms_raw_text
    )

    default_base_prompt = (
        "You are an expert AI medical assistant trained in both "
        "Allopathic triage and Ayurvedic principles (Doshas). "
        "Analyze the patient's symptoms carefully using the "
        "provided reference context."
    )

    base_prompt = (
        payload.custom_system_prompt
        if payload.custom_system_prompt
        else default_base_prompt
    )

    prompt = get_medical_prompt(
        base_prompt=base_prompt,
        age=payload.age,
        weight_kg=payload.weight_kg,
        symptoms_raw_text=payload.symptoms_raw_text,
        retrieved_context=retrieved_context,
        available_departments=payload.available_departments
    )

    try:
        model_name = (
            payload.ai_model_override
            or "openai/gpt-oss-120b"
        )

        start_time = time.perf_counter()

        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )

        response_time_sec = round(
            time.perf_counter() - start_time,
            3
        )

        usage = getattr(response, "usage", None)

        tokens_prompt = (
            getattr(usage, "prompt_tokens", 0)
            if usage else 0
        )

        tokens_completion = (
            getattr(usage, "completion_tokens", 0)
            if usage else 0
        )

        clean_json = response.choices[0].message.content.strip()

        if clean_json.startswith("```"):
            clean_json = "\n".join(
                clean_json.split("\n")[1:-1]
            )

        parsed_data = json.loads(clean_json)

        parsed_data["tokens_prompt"] = tokens_prompt
        parsed_data["tokens_completion"] = tokens_completion
        parsed_data["response_time_sec"] = response_time_sec
        parsed_data["ai_status"] = "success"

        return parsed_data

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


class BatchTranslationRequest(BaseModel):
    texts: dict[str, str]
    target_language: str
    ai_model_override: str | None = None


@app.post("/api/translate-batch")
async def translate_batch_text(
    payload: BatchTranslationRequest,
    x_internal_secret: str = Header(None)
):
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(
            status_code=403,
            detail="Forbidden"
        )

    if not client:
        raise HTTPException(
            status_code=500,
            detail="Groq API Key is missing."
        )

    prompt = get_translation_prompt(payload.texts, payload.target_language)

    try:
        model_name = (
            payload.ai_model_override
            or "openai/gpt-oss-120b"
        )

        start_time = time.perf_counter()

        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        response_time_sec = round(
            time.perf_counter() - start_time,
            3
        )

        usage = getattr(response, "usage", None)

        tokens_prompt = (
            getattr(usage, "prompt_tokens", 0)
            if usage else 0
        )

        tokens_completion = (
            getattr(usage, "completion_tokens", 0)
            if usage else 0
        )

        tokens_total = (
            getattr(usage, "total_tokens", 0)
            if usage else 0
        )

        clean_json = response.choices[0].message.content.strip()

        if clean_json.startswith("```"):
            clean_json = "\n".join(
                clean_json.split("\n")[1:-1]
            )

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
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "Secure Somatic AI Microservice is active"
    }