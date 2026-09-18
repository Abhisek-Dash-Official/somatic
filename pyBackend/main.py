import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from google import genai
from google.genai import types

from prompts import get_medical_prompt
from rag import retrieve_relevant_context, initialize_knowledge_base

# import traceback

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET", "my_super_secret_key_123")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Vector DB & Ayurvedic Knowledge Base...")
    initialize_knowledge_base()
    yield
    print("Shutting down AI Microservice...")

app = FastAPI(title="Somatic Secure RAG AI Microservice", lifespan=lifespan)
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
    ai_model_override: str | None = "gemini-3.6-flash"
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
        raise HTTPException(status_code=403, detail="Forbidden: Invalid or missing internal secret token.")

    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing.")

    retrieved_context = retrieve_relevant_context(payload.symptoms_raw_text)

    default_base_prompt = "You are an expert AI medical assistant trained in both Allopathic triage and Ayurvedic principles (Doshas). Analyze the patient's symptoms carefully using the provided reference context."
    base_prompt = payload.custom_system_prompt if payload.custom_system_prompt else default_base_prompt

    prompt = get_medical_prompt(
        base_prompt=base_prompt,
        age=payload.age,
        weight_kg=payload.weight_kg,
        symptoms_raw_text=payload.symptoms_raw_text,
        retrieved_context=retrieved_context,
        available_departments=payload.available_departments
    )
    
    model_name = payload.ai_model_override if payload.ai_model_override else "gemini-3.6-flash"
    
    try:
        model_name = payload.ai_model_override if payload.ai_model_override else "gemini-3.6-flash"
        
        chat = client.aio.chats.create(
            model=model_name,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        response = await chat.send_message(prompt)
        
        usage = getattr(response, "usage_metadata", None)
        tokens_prompt = getattr(usage, "prompt_token_count", 0) if usage else 0
        tokens_completion = getattr(usage, "candidates_token_count", 0) if usage else 0

        clean_json = response.text.strip()
        if clean_json.startswith("```"):
            clean_json = "\n".join(clean_json.split("\n")[1:-1])

        parsed_data = json.loads(clean_json)
        
        parsed_data["tokens_prompt"] = tokens_prompt
        parsed_data["tokens_completion"] = tokens_completion
        parsed_data["response_time_sec"] = 0.0
        parsed_data["ai_status"] = "success"

        return parsed_data
        
    except Exception as e:
        # traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class BatchTranslationRequest(BaseModel):
    texts: dict[str, str]
    target_language: str
    ai_model_override: str | None = "gemini-3.6-flash"

@app.post("/api/translate-batch")
async def translate_batch_text(
    payload: BatchTranslationRequest,
    x_internal_secret: str = Header(None)
):
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing.")

    prompt = (
        f"You are an expert medical translator. Translate the values of the following JSON object "
        f"into {payload.target_language}.\n"
        f"CRITICAL RULES:\n"
        f"1. Keep the EXACT same JSON keys in the output.\n"
        f"2. Translate ONLY the values.\n"
        f"3. Return ONLY a valid JSON object, no markdown, no explanations.\n\n"
        f"JSON to translate:\n{json.dumps(payload.texts, ensure_ascii=False)}"
    )

    model_name = payload.ai_model_override if payload.ai_model_override else "gemini-3.6-flash"

    try:
        model_name = payload.ai_model_override if payload.ai_model_override else "gemini-3.6-flash"

        chat = client.aio.chats.create(
            model=model_name,
            config=types.GenerateContentConfig(
                response_mime_type="application/json", 
                temperature=0.1
            )
        )
        response = await chat.send_message(prompt)
        
        clean_json = response.text.strip()
        if clean_json.startswith("```"):
            clean_json = "\n".join(clean_json.split("\n")[1:-1])

        translated_dict = json.loads(clean_json)
        return translated_dict
        
    except Exception as e:
        # traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Secure Somatic AI Microservice is active"}