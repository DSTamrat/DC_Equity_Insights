from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import pandas as pd
from typing import Dict

# -------------------------------------------------
# FastAPI App
# -------------------------------------------------
app = FastAPI(
    title="DC Equity Insights RAG API",
    description="Backend API for structured-data RAG and policy-style explanations.",
    version="1.0.0"
)

# -------------------------------------------------
# CORS (required for frontend)
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Load Embedding Model
# -------------------------------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")

# -------------------------------------------------
# Load Structured Datasets (adjust paths as needed)
# -------------------------------------------------
try:
    equity_df = pd.read_csv("data/equity_scores_by_tract.csv")
    transit_df = pd.read_csv("data/transit_access.csv")
    meta_df = pd.read_csv("data/dataset_catalog.csv")
except Exception:
    # If files are missing, create placeholder data
    equity_df = pd.DataFrame({"equity_score": [72, 65, 80]})
    transit_df = pd.DataFrame({"access_index": [0.55, 0.72, 0.61]})
    meta_df = pd.DataFrame({"name": ["Equity Scores", "Transit Access", "Dataset Catalog"]})

# -------------------------------------------------
# Limitations Text
# -------------------------------------------------
LIMITATIONS_TEXT = """
This dashboard is based on modeled indicators and available administrative data.
Limitations include: data lags, missing records, under-reporting in some neighborhoods,
and the fact that composite scores may hide within-tract variation.
"""

# -------------------------------------------------
# Policy Answer Functions
# -------------------------------------------------
def answer_equity_score() -> Dict:
    avg_score = equity_df["equity_score"].mean()
    return {
        "answer": (
            f"The average equity score across all census tracts is {avg_score:.1f} out of 100. "
            "Higher scores indicate greater access to opportunity, stability, and essential services."
        ),
        "metrics_used": ["equity_score"],
        "sources": ["equity_scores_by_tract.csv"],
        "limitations": LIMITATIONS_TEXT.strip()
    }

def answer_transit_access() -> Dict:
    return {
        "answer": (
            "Transit access is calculated using a composite index that combines average travel time "
            "to key destinations, frequency of service, and proximity to high-capacity transit stops. "
            "Higher values indicate better access to jobs, healthcare, and education."
        ),
        "metrics_used": ["access_index"],
        "sources": ["transit_access.csv"],
        "limitations": LIMITATIONS_TEXT.strip()
    }

def answer_datasets_used() -> Dict:
    dataset_list = meta_df["name"].tolist()
    return {
        "answer": "This dashboard uses the following datasets: " + ", ".join(dataset_list) + ".",
        "metrics_used": [],
        "sources": dataset_list,
        "limitations": LIMITATIONS_TEXT.strip()
    }

def answer_limitations() -> Dict:
    return {
        "answer": LIMITATIONS_TEXT.strip(),
        "metrics_used": [],
        "sources": ["equity_scores_by_tract.csv", "transit_access.csv", "dataset_catalog.csv"],
        "limitations": LIMITATIONS_TEXT.strip()
    }

# -------------------------------------------------
# Request Schema
# -------------------------------------------------
class Question(BaseModel):
    question: str

# -------------------------------------------------
# RAG Endpoint (Government-Style)
# -------------------------------------------------
@app.post("/ask")
async def ask_api(payload: Question):
    query = payload.question.lower().strip()

    # 1. Rule-based routing for key policy questions
    if "equity score" in query:
        result = answer_equity_score()
    elif "transit access" in query or "transit" in query:
        result = answer_transit_access()
    elif "which datasets" in query or "datasets are used" in query:
        result = answer_datasets_used()
    elif "limitations" in query or "caveats" in query:
        result = answer_limitations()

    # 2. Fallback: semantic placeholder (later: real RAG)
    else:
        embedding = model.encode(query).tolist()
        result = {
            "answer": (
                f"I don't have a specific policy template for that question yet, "
                f"but I computed its embedding (length {len(embedding)}). "
                f"We can wire this to a semantic search over documentation next."
            ),
            "metrics_used": [],
            "sources": [],
            "limitations": LIMITATIONS_TEXT.strip()
        }

    return result

# -------------------------------------------------
# Health Check Endpoint
# -------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok", "message": "Backend is running"}
