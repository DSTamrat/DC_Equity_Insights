📘 DC Equity Insights – RAG Policy Dashboard
<p align="center">
<img src="assets/dc_map.png" width="300">
</p>

<p align="center">
<strong>A Retrieval-Augmented Generation (RAG) dashboard for analyzing equity, transit access, housing stability, public safety, education, health, and public‑sector performance across Washington, DC.</strong>
</p>

🏷️ Badges
<p align="center">

<img src="https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge">
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge">
<img src="https://img.shields.io/badge/Streamlit-Frontend-FF4B4B?style=for-the-badge">
<img src="https://img.shields.io/badge/RAG-Enabled-6A5ACD?style=for-the-badge">
<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge">
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge">

</p>

📊 Overview
DC Equity Insights is an interactive RAG-powered policy dashboard that synthesizes structured datasets and natural‑language reasoning to answer questions about:

Equity disparities across wards

Transit access and transportation burden

Housing stability and eviction risk

Public safety trends

311 service request patterns

School performance

Workforce and unemployment

Health outcomes

Public‑sector performance

The system combines FastAPI, semantic retrieval, and a Streamlit UI to deliver transparent, explainable insights.

🧠 Key Features
🔹 RAG Backend (FastAPI)
/ask endpoint for policy‑style reasoning

/health endpoint for diagnostics

Embedding‑based retrieval

Transparent metadata:

metrics used

sources

limitations

🔹 Streamlit Dashboard
Centered DC map banner

Dropdown menu with representative questions

Custom question input

Expandable sections for metrics, sources, limitations

Modern dark‑navy theme

Clean, government‑style layout

🗂️ Project Structure
Code
DC_Equity_Insights/
│
├── backend/
│   ├── main.py
│   ├── data_pipeline.py
│   └── venv/ (ignored)
│
├── assets/
│   └── dc_map.png
│
├── app.py
├── README.md
└── .gitignore

## 🏗️ System Architecture

```mermaid
flowchart TD
    A[User] -->|Question| B[Streamlit Frontend]

    B -->|POST /ask| C[FastAPI Backend]

    C --> D[Embedding Model<br>Vector Store]
    C --> E[Policy Reasoning Engine]

    D --> C
    E --> C

    C -->|Answer + Metrics + Sources| B
