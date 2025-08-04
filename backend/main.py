from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from typing import Optional
import re
import os

app = FastAPI(
    title="Translation API",
    description="OpenAPI backend for Japanese-English translation using LLM",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and tokenizer
model = None
tokenizer = None

class TranslationRequest(BaseModel):
    text: str
    direction: str = "en_to_ja"  # en_to_ja or ja_to_en

class TranslationResponse(BaseModel):
    translation: str
    original_text: str
    direction: str

@app.on_event("startup")
async def startup_event():
    global model, tokenizer
    #llm = "pfnet/plamo-2-1b"
    #llm = "elyza/Llama-3-ELYZA-JP-8B-AWQ"
    llm = "pfnet/plamo-2-translate"
    print(f"Loading LLM... {llm}")
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(llm, trust_remote_code=True)
        tokenizer.pad_token = tokenizer.eos_token
        
        # Configure 4-bit quantization
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float32,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=False,
        )
        
        model = AutoModelForCausalLM.from_pretrained(
            llm, 
            trust_remote_code=True, 
            device_map="auto",
            quantization_config=quantization_config,
            torch_dtype=torch.float32,
        )
    except Exception as e:
        print(f"Model loading failed: {e}")
        raise e
    
    model.config.pad_token_id = tokenizer.pad_token_id
    print("Model loaded successfully with 4-bit quantization!")

@app.get("/")
async def root():
    return {"message": "Translation API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text between English and Japanese using the loaded LLM model.
    
    - **text**: The text to translate
    - **direction**: Translation direction ("en_to_ja" or "ja_to_en")
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if request.direction not in ["en_to_ja", "ja_to_en"]:
        raise HTTPException(status_code=400, detail="Invalid direction. Use 'en_to_ja' or 'ja_to_en'")
    
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        if request.direction == "en_to_ja":
            prompt = f'''<|plamo:op|>dataset
translation
<|plamo:op|>input lang=English
{request.text}
<|plamo:op|>output lang=Japanese
'''
        else:  # ja_to_en
            prompt = f'''<|plamo:op|>dataset
translation
<|plamo:op|>input lang=Japanese
{request.text}
<|plamo:op|>output lang=English
'''
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        input_ids = inputs["input_ids"].to(device)
        attention_mask = inputs["attention_mask"].to(device)

        # Calculate max_new_tokens based on prompt size
        prompt_tokens = input_ids.shape[1]
        max_new_tokens = int(prompt_tokens * 1.05)
        if prompt_tokens > 512:
            max_new_tokens = 512
            pass
        
        generated_tokens = model.generate(
            inputs=input_ids,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            top_k=25,
            top_p=0.95,
            temperature=1.0,
            attention_mask=attention_mask,
        )[0]
        
        generated_text = tokenizer.decode(generated_tokens, skip_special_tokens=True)
        
        # Extract the translation part (remove the original prompt)
        translation = generated_text[len(prompt):].strip()
        sanitized_translation = translation.split("<|plamo:op|>")[0].strip()
        
        # Clear GPU cache after translation
        #if torch.cuda.is_available():
        #    torch.cuda.empty_cache()
        
        return TranslationResponse(
            translation=sanitized_translation,
            original_text=request.text,
            direction=request.direction
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 4000))
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
