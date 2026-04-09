import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000/ask"

st.set_page_config(page_title="DC Equity Insights – RAG Dashboard", layout="wide")

# -----------------------------
# Background Styling
# -----------------------------
st.markdown(
    """
    <style>
        body {
            background-color: #0A1A2F;
        }
        .main {
            background-color: #0A1A2F;
        }
        h1, h2, h3, p, label, span {
            color: #E8ECF1 !important;
        }
    </style>
    """,
    unsafe_allow_html=True
)

# -----------------------------
# Centered Map ABOVE Title
# -----------------------------
st.markdown("<div style='text-align: center;'>", unsafe_allow_html=True)
st.image("assets/dc_map.png", width=350)
st.markdown("</div>", unsafe_allow_html=True)

# -----------------------------
# Centered Title + Description
# -----------------------------
st.markdown(
    """
    <h1 style='text-align: center; margin-bottom: 0;'>DC Equity Insights – RAG Policy Dashboard</h1>
    <p style='text-align: center; font-size: 18px; color: #C7D3DF;'>
        A Retrieval-Augmented Generation (RAG) dashboard analyzing DC equity, transit access, housing stability, 
        public safety, education, health, and public-sector performance using structured datasets and policy-style reasoning.
    </p>
    """,
    unsafe_allow_html=True
)

st.write("")

# -----------------------------
# Representative Questions (Dropdown)
# -----------------------------
st.subheader("Representative Questions")

representative_questions = [
    "Which DC wards have the lowest equity score?",
    "How does transit access vary across census tracts?",
    "Which neighborhoods face the highest transportation burden?",
    "What factors contribute most to equity disparities?",
    "How does housing stability differ across wards?",
    "Which areas show the highest eviction risk?",
    "How do 311 service request patterns vary by ward?",
    "What public safety trends are most concerning?",
    "How does school performance vary across DCPS clusters?",
    "Which wards have the highest unemployment rates?",
    "How do health outcomes differ across census tracts?",
    "Summarize the key limitations of the dataset.",
    "Provide a public-sector performance overview for Ward 7.",
    "Which wards show the strongest improvements in equity metrics?",
]

selected_question = st.selectbox(
    "Choose a representative question:",
    ["(Select a question)"] + representative_questions
)

# If user selects a question, auto-fill the input box
if selected_question != "(Select a question)":
    st.session_state["question"] = selected_question

# -----------------------------
# User Input
# -----------------------------
question = st.text_input("Or type your own question:", st.session_state.get("question", ""))

# -----------------------------
# Backend Call
# -----------------------------
if st.button("Ask Now"):
    if not question.strip():
        st.warning("Please enter a question.")
    else:
        with st.spinner("Analyzing…"):
            try:
                response = requests.post(API_URL, json={"question": question})
                data = response.json()

                st.subheader("Answer")
                st.write(data.get("answer", ""))

                metrics = data.get("metrics_used", [])
                sources = data.get("sources", [])
                limitations = data.get("limitations", "")

                if metrics or sources:
                    with st.expander("Metrics & Sources"):
                        if metrics:
                            st.markdown("**Metrics used:** " + ", ".join(metrics))
                        if sources:
                            st.markdown("**Sources:** " + ", ".join(sources))

                if limitations:
                    with st.expander("Limitations"):
                        st.write(limitations)

            except Exception as e:
                st.error("Error connecting to backend.")
                st.exception(e)
