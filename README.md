# 🔍 Multimodal Fake News Detection Platform

A comprehensive research platform and interactive web dashboard for benchmarking and deploying advanced architectures in **Multimodal Fake News Detection**. The platform evaluates **16 model architectures** across **6 key paradigms**, including classical baselines, foundation vision-language models, edge-optimized models, and cutting-edge 2025/2026 state-of-the-art models on the multilingual **M4FC Dataset**.

---

## 🚀 System Architecture

The application is structured as a decoupled, high-performance web suite. Below is the interaction workflow between the client, backend APIs, SQLite storage, and the deep learning inference engines:

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b;
    classDef api fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#052e16;
    classDef db fill:#fff7ed,stroke:#f97316,stroke-width:2px,color:#431407;
    classDef ml fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#3b0764;
    
    %% Client Tier
    subgraph Client Tier (React Frontend)
        User[Web User] -->|HTTP Requests| SPA[React App / Vite]
        SPA -->|Language Config| Lang[LanguageContext]
    end

    %% Application Tier
    subgraph Application Tier (FastAPI Backend)
        SPA -->|API Requests / Auth| Main[app/main.py]
        Main -->|User Session / JWT| Auth[app/auth.py]
        Main -->|CRUD Ops| CRUD[app/crud.py]
    end

    %% Database Tier
    subgraph Database Tier (SQLite)
        CRUD -->|SQLAlchemy ORM| DB[(multimodal_fake_news_detection_system.db)]
    end

    %% Machine Learning Core
    subgraph ML Core (PyTorch & Hugging Face)
        Main -->|Raw Inputs| ML[app/predict.py]
        ML -->|Zero-Shot Infer| CLIP[Original CLIP]
        ML -->|Multimodal Co-Attention| Champion[EANN / MIAN / VCLMMF]
        ML -->|Low-Latency Edge| Edge[MiniRBT / PERT]
        ML -->|Visual Reasoning| LVLM[LVLM Vicuna/GLM4/Gemini]
    end

    %% Class Associations
    class User,SPA,Lang client;
    class Main,Auth,CRUD api;
    class DB db;
    class ML,CLIP,Champion,Edge,LVLM ml;
```

---

## 📋 Setup & Deployment Guide

### Option A: Local Development Setup (Manual)

#### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/multimodal-fake-news-detection.git
cd multimodal-fake-news-detection
```

#### 2. Configure Python Virtual Environment
Create and activate the environment for running notebooks and running the backend API:
```bash
# Create the virtual environment
python -m venv venv_ai

# Activate (Windows)
venv_ai\Scripts\activate

# Activate (Linux/Mac)
source venv_ai/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Run the FastAPI Backend Server
Navigate to the `app` directory, configure the `.env` parameters if needed, and start the server:
```bash
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The backend server runs locally on **`http://localhost:8000`**.

#### 4. Run the React Frontend
Open a new terminal, navigate to the `react-frontend` directory, install Node dependencies, and start Vite:
```bash
cd react-frontend
npm install
npm run dev
```
The frontend application will start on **`http://localhost:3000`**.

---

### Option B: Docker Container Deployment (Recommended for Reproducibility)

The platform is fully containerized. You can build and run both the React SPA and FastAPI backend instantly using Docker Compose:

```bash
# Build and launch all containers
docker-compose up --build
```
- **React Frontend:** Access at **`http://localhost:3000`**
- **FastAPI API Documentation (Swagger):** Access at **`http://localhost:8000/docs`**

---

## 🧠 Benchmarked Model Architectures

This project implements and compares **16 neural network models** spanning 6 distinct paradigms:

| Paradigm | Model Family | Key Architecture / Feature Fusion | Target Paper / Reference |
| :--- | :--- | :--- | :--- |
| **I. State of the Art** | **LVLM (Vicuna/GLM4)** | Large Vision-Language Model Zero-Shot reasoning | *2025/2026 Baseline* |
| | **MIAN** | Hierarchical Learning Module (HLM) + Co-Attention + Inverse Attention | *IJCAI 2025* |
| | **VCLMMF** | Probabilistic VAE Alignment + InfoNCE Dual Contrastive Loss | *2025* |
| **II. Foundational** | **CLIP** | Zero-Shot Cosine Similarity / Supervised MLP Classifier | Radford et al., *ICML 2021* |
| | **BLIP** | Bootstrapping Language-Image Captioning Matching | Li et al., *ICML 2022* |
| | **VisualBERT** | Single-Stream Joint Transformer Adapter | Li et al., *arXiv 2019* |
| **III. Adversarial** | **EANN** | Event Adversarial Neural Network with Domain Classifier | Wang et al., *KDD 2018* |
| | **CAFE** | Ambiguity-Aware Cross-Modal Learning & Uncertainty | Zhou et al., *CVPR 2021* |
| **IV. Attention** | **HMCAN** | Hierarchical Contextual Attention Network (Text/Image/Metadata) | *ACL* |
| | **att-RNN** | Joint Visual-Textual Attention with Bi-GRU + VGG-19 | Jin et al., *IJCAI 2017* |
| | **SpotFake** | BERT Text + VGG-19 Image Concatenation | Singhal et al., *IEEE MIPR 2019* |
| | **SpotFake+** | XLM-RoBERTa + ResNet-50 Image Concatenation | Singhal et al., *AAAI 2020* |
| **V. Variational & Fusion** | **MVAE** | Multimodal Variational Autoencoder (Generative Reconstruction) | Khattar et al., *WWW 2019* |
| | **SAFE** | Similarity-Aware Fusion Engine (Cross-Modal Correlation) | Zhou et al., *PAKDD 2020* |
| | **Traditional Fusion**| Early Fusion (Concatenation) / Late Fusion (Voting Classifier) | *Baseline* |
| **VI. PEFT \& Edge Optimization** | **MiniRBT** | Distilled mini-RoBERTa (5x compression, fast edge deployment) | *Edge optimized* |
| | **PERT** | Parameter-Efficient Fine-Tuned (PEFT) Masking Transformer | *Edge optimized* |

---

## 📂 Project Structure

```
multimodal_fake_news_detection/
├── app/                      # FastAPI Backend Server
│   ├── main.py               # Main Entrypoint (API endpoints & server config)
│   ├── auth.py               # JWT authentication & password security
│   ├── database.py           # SQLite connection & sessionmaker
│   ├── crud.py               # Database CRUD helpers
│   ├── models.py             # SQL Alchemy schemas (User, ClaimRecord)
│   ├── schemas.py            # Pydantic schemas (predict & user)
│   ├── predict.py            # Deep learning inference engine loader
│   ├── twitter_stream.py     # Real-time ingestion stream (4chan, Reddit, Telegram)
│   ├── Dockerfile            # Docker configuration for FastAPI
│   └── requirements.txt      # Minimal CPU-optimized packages
├── react-frontend/           # React + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── pages/            # View pages (Home, Models, History, Analyzer, About)
│   │   ├── components/       # Reusable components (Charts, Navbar, Stream)
│   │   └── context/          # State management context (Language, Alerts)
│   ├── Dockerfile            # Multi-stage build Dockerfile
│   └── nginx.conf            # Nginx routing configuration
├── src/                      # Modular Production ML Pipeline
│   ├── data_pipeline.py      # M4FC custom dataloaders & padding
│   └── model_registry.py     # Registry for model weights loading
├── notebooks/                # PyTorch Implementation Jupyter Notebooks
├── M4FC/                     # Official dataset submodule / clone
├── figures/                  # Static assets & model architecture diagrams
├── reports/                  # Generated evaluation reports (classification report text & figures)
├── docker-compose.yml        # Orchestration build file for full stack
└── requirements.txt          # Global packages (including GPU wheels)
```

---

## 📄 License

This project is licensed under a custom **Non-Commercial Software License** (Exclusive Commercial Rights retained by Safae Eraji). It is free for personal, educational, and academic research purposes, but commercial use by any third party is strictly prohibited. Refer to the [LICENSE](LICENSE) file for the full terms and conditions.
