import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="NLP Emotion Service")

# Maps model output labels to our emotion names
LABEL_MAP = {
    "нейтральный":   "нейтральный",
    "нейтральность": "нейтральный",
    "neutral":       "нейтральный",
    "счастье":       "счастье",
    "радость":       "счастье",
    "joy":           "счастье",
    "happiness":     "счастье",
    "грусть":        "грусть",
    "печаль":        "грусть",
    "sadness":       "грусть",
    "grief":         "грусть",
    "энтузиазм":     "энтузиазм",
    "enthusiasm":    "энтузиазм",
    "страх":         "страх",
    "тревога":       "страх",
    "fear":          "страх",
    "anxiety":       "страх",
    "гнев":          "гнев",
    "злость":        "гнев",
    "anger":         "гнев",
    "отвращение":    "отвращение",
    "disgust":       "отвращение",
}

token = os.getenv("HF_TOKEN") or None

try:
    print("Loading Aniemore/rubert-large-emotion-russian-cedr-m7...")
    classifier = pipeline(
        "text-classification",
        model="Aniemore/rubert-large-emotion-russian-cedr-m7",
        token=token,
        top_k=None,
    )
    print("Model loaded successfully.")
except Exception as e:
    print(f"FATAL: Could not load model: {e}", file=sys.stderr)
    sys.exit(1)


class AnalyzeRequest(BaseModel):
    text: str


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    result = classifier(req.text)
    labels = result[0] if isinstance(result[0], list) else result
    best = max(labels, key=lambda x: x["score"])
    raw_label = best["label"].lower()
    emotion = LABEL_MAP.get(raw_label, "нейтральный")
    return {"emotion": emotion, "score": round(best["score"], 2)}


@app.get("/health")
async def health():
    return {"status": "ok"}
