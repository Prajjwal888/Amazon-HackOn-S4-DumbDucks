from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from huggingface_hub import login
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

login(token=os.getenv("HUGGINGFACE_HUB_TOKEN"))

classifier = pipeline(
    "text-classification",
    model="prajjwal888/roberta-finetuned-review-classifier",
    truncation=True,     
    max_length=512
)

class ReviewInput(BaseModel):
    text: str

@app.post("/predict")
async def predict(review: ReviewInput):
    prediction = classifier(review.text)
    return {"result": prediction}
