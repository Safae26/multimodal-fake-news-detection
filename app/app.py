import uvicorn
import gradio as gr
import spaces
from main import app as fastapi_app

# Hugging Face ZeroGPU REQUIRES a Gradio Interface bound to a @spaces.GPU function
@spaces.GPU
def dummy_gpu_fn(text):
    return "System is running. API is available at /docs"

# Create a minimal Gradio UI
demo = gr.Interface(
    fn=dummy_gpu_fn,
    inputs="text",
    outputs="text",
    title="Backend API Status"
)

# Mount the Gradio UI at /ui so it doesn't break our API routes
app = gr.mount_gradio_app(fastapi_app, demo, path="/ui")

if __name__ == "__main__":
    # Hugging Face ZeroGPU wrapper automatically starts the server.
    # Running uvicorn here causes an [Errno 98] address already in use error.
    pass
