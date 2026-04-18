import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="NLP Emotion Service")

EMOTIONS = ["нейтральный", "счастье", "грусть", "энтузиазм", "страх", "гнев", "отвращение"]

classifier = None

def load_model():
    global classifier
    model_name = os.getenv("NLP_MODEL", "MoritzLaurer/multilingual-MiniLM-L12-mnli-xnli")
    try:
        from transformers import pipeline
        classifier = pipeline("zero-shot-classification", model=model_name)
        print(f"Model loaded: {model_name}")
    except Exception as e:
        print(f"Could not load model: {e}. Using keyword fallback.")

load_model()

KEYWORD_MAP = {
    "грусть":     ["грустно", "грустный", "грусть", "тяжело", "тяжёлый", "печально", "устал", "устала", "уныние", "плохо", "тоска", "скучно", "одиноко"],
    "счастье":    ["счастье", "счастлив", "радость", "радостно", "отлично", "замечательно", "прекрасно", "хорошо", "весело", "рад", "рада", "ура"],
    "гнев":       ["злость", "злой", "злая", "раздражение", "бесит", "ненавижу", "гнев", "злюсь", "достало", "достала", "раздражает"],
    "страх":      ["страх", "боюсь", "боится", "тревога", "тревожно", "переживаю", "волнение", "паника", "испугался", "испугалась", "страшно"],
    "энтузиазм":  ["энтузиазм", "вдохновение", "мотивация", "заряжен", "заряжена", "вдохновлён", "вдохновлена", "горю", "хочу", "хочется", "вперёд"],
    "отвращение": ["отвратительно", "тошнит", "противно", "мерзко", "гадко", "отвращение", "фу", "ужасно"],
    "нейтральный": [],
}


def keyword_analyze(text: str) -> dict:
    text_lower = text.lower()
    scores = {emotion: sum(1 for kw in kws if kw in text_lower) for emotion, kws in KEYWORD_MAP.items()}
    best = max(scores, key=scores.get)
    best_score = scores[best]
    if best_score == 0:
        return {"emotion": "нейтральный", "score": 0.5}
    total = sum(scores.values())
    confidence = round(min(best_score / total + 0.3, 0.99), 2)
    return {"emotion": best, "score": confidence}


class AnalyzeRequest(BaseModel):
    text: str


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    if classifier:
        result = classifier(req.text, EMOTIONS, multi_label=False)
        return {"emotion": result["labels"][0], "score": round(result["scores"][0], 2)}

    return keyword_analyze(req.text)


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": classifier is not None}
