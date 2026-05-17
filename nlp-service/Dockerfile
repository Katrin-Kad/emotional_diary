FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Скачиваем модель во время сборки, чтобы не делать это при каждом старте
RUN python - <<'EOF'
from transformers import pipeline
pipeline(
    "text-classification",
    model="Aniemore/rubert-large-emotion-russian-cedr-m7",
    top_k=None,
)
print("Model cached.")
EOF

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
