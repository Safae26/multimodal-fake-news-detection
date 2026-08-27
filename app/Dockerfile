FROM python:3.10-slim

# Install system dependencies needed for some ML libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /code

# Copy requirements first to leverage Docker cache
COPY requirements.txt /code/requirements.txt

# Install Python packages
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy all backend code files
COPY . /code

# Expose Hugging Face Space port 7860
EXPOSE 7860

# Run uvicorn server on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
