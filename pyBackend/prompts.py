def get_medical_prompt(base_prompt: str, age, weight_kg, symptoms_raw_text, language, retrieved_context: str, available_departments: list) -> str:
    return f"""
    {base_prompt}
    
    [Authentic Ayurvedic Reference Context Retrieved from Vector DB]:
    {retrieved_context}
    
    Available Hospital Departments (Format: [{{id, name}}]):
    {available_departments}
    
    Patient Details:
    - Age: {age if age else "Not provided"}
    - Weight: {weight_kg if weight_kg else "Not provided"} kg
    - Symptoms & History: {symptoms_raw_text}
    - Preferred Language for Advice: {language}
    
    Task:
    Using the retrieved Ayurvedic context and general clinical knowledge, analyze the input and return ONLY a valid JSON object matching this exact structure:
    {{
      "is_emergency": boolean (true if symptoms indicate a life-threatening emergency like severe chest pain, extreme bleeding, acute breathing difficulty),
      "chief_complaints": [string] (list of core symptoms extracted concisely),
      "ayurvedic_hints": string (brief insight regarding Vata, Pitta, or Kapha imbalance based strictly on the retrieved context, written in the preferred language),
      "ai_summary_and_advice": string (a professional clinical summary, safety triage precautions, and preliminary guidance written clearly in the preferred language),
      "assigned_department_id": string (Select the EXACT 'id' of the most appropriate department from the 'Available Hospital Departments' list. If none match or list is empty, return null)
    }}
    """