import uvicorn
from main import app

# Ce script sert de point d'entrée pour Hugging Face Spaces (SDK Gradio)
# Il permet de faire tourner l'API FastAPI gratuitement sans Docker.
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=7860)
