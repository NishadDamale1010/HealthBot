FROM python:3.11-slim

# Set up a new user named "user" with user ID 1000
# HuggingFace Spaces requires apps to run as a non-root user
RUN useradd -m -u 1000 user

WORKDIR /app

# Install system dependencies required for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Ensure the non-root user owns the directories where models/DBs are saved
RUN mkdir -p /app/vectorstore /app/app/artifacts/models
RUN chown -R user:user /app

# Switch to the non-root user
USER user

# Expose the standard HuggingFace Spaces port
EXPOSE 7860

# Run FastAPI using Uvicorn on port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
