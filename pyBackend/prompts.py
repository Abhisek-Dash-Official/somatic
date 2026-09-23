import json

def get_medical_prompt(base_prompt: str, age, weight_kg, symptoms_raw_text, retrieved_context: str, available_departments: list) -> str:
    return f"""
    {base_prompt}
    
    [Authentic Ayurvedic Reference Context Retrieved from Vector DB]:
    {retrieved_context}
    
    Available Hospital Departments (Format: [{{id, name}}]):
    {available_departments}
    
    Patient Details:
    - Age: {age if age else "Not provided"}
    - Weight: {weight_kg if weight_kg else "Not provided"} kg
    - Symptoms & History (Raw Input): {symptoms_raw_text}
    
    Task:
    Using the retrieved Ayurvedic context and general clinical knowledge, analyze the input and return ONLY a valid JSON object matching this exact structure. 
    CRITICAL: The doctor uses an English interface. All text outputs in the JSON MUST be in ENGLISH, regardless of the patient's preferred language.
    
    {{
      "translated_symptoms": string (Translate the 'Symptoms & History' accurately into ENGLISH),
      "is_emergency": boolean (true if symptoms indicate a life-threatening emergency like severe chest pain, extreme bleeding, acute breathing difficulty),
      "chief_complaints": [string] (list of core symptoms extracted concisely in ENGLISH),
      "suggested_medicines": [string] (list of suggested generic allopathic and ayurvedic medicines/first-aid based on symptoms, written in ENGLISH),
      "ayurvedic_hints": string (brief insight regarding Vata, Pitta, or Kapha imbalance based strictly on the retrieved context, written in ENGLISH),
      "ai_summary_and_advice": string (a professional clinical summary, safety triage precautions, and preliminary guidance written clearly in ENGLISH),
      "assigned_department_id": string (You MUST select the EXACT 'id' of the most appropriate department strictly from the 'Available Hospital Departments' list. Choose the closest match. Do not return null.)
    }}
    """

def get_translation_prompt(texts: dict, target_language: str) -> str:
    return f"""
You are an expert medical translator. Translate the values of the following JSON object into {target_language}.

CRITICAL RULES:
1. Keep the EXACT same JSON keys in the output.
2. Translate ONLY the values.
3. Return ONLY a valid JSON object, no markdown, no explanations.

JSON to translate:
{json.dumps(texts, ensure_ascii=False)}
"""