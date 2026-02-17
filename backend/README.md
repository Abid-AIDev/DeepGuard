# SecureVision AI - Backend

Python FastAPI backend for real-time deepfake detection using Vision Transformer.

## Requirements

- Python 3.10+
- Mac M3 with MPS support (or CUDA GPU)
- ~4GB free disk space (for model)

## Quick Start

### Option 1: Use the startup script

```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install torch torchvision torchaudio transformers fastapi uvicorn pillow python-multipart

# Run the server
python main.py
```

## Network Issues?

If you're on a network with SSL inspection (school/corporate network), try:

1. **Use a different network** (mobile hotspot recommended)
2. **Or bypass SSL verification** (not recommended for production):
   ```bash
   pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org <packages>
   ```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/health` | GET | API status |
| `/api/verify` | POST | Verify image (multipart file) |
| `/api/models` | GET | List available models |

## Example Usage

```bash
# Test the API
curl -X POST -F "file=@test_image.jpg" http://localhost:8000/api/verify
```

## Model Info

- **Model**: prithivMLmods/Deep-Fake-Detector-v2-Model
- **Accuracy**: 92.12%
- **Architecture**: Vision Transformer (ViT-Base)
- **First run**: Downloads ~350MB model to `~/.cache/huggingface/`
