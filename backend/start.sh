#!/bin/bash
# SecureVision AI - Backend Startup Script
# Run this script to start the deepfake detection backend

echo "=================================================="
echo "  SecureVision AI - Backend Setup & Startup"
echo "=================================================="

# Navigate to backend directory
cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import torch" 2>/dev/null; then
    echo "📥 Installing dependencies (this may take a few minutes)..."
    echo "   Note: First run will also download the AI model (~350MB)"
    pip install --upgrade pip
    pip install torch torchvision torchaudio transformers fastapi uvicorn pillow python-multipart
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        echo ""
        echo "If you're on a network with SSL certificates (like a school/corporate network),"
        echo "try one of these solutions:"
        echo ""
        echo "1. Use a different network (like mobile hotspot)"
        echo "2. Or run: pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org <packages>"
        echo "3. Or contact your IT admin to whitelist pypi.org and pythonhosted.org"
        exit 1
    fi
fi

echo ""
echo "🚀 Starting SecureVision AI Backend..."
echo "   Server will run at: http://localhost:8000"
echo "   API endpoint: POST http://localhost:8000/api/verify"
echo ""

# Start the server
python main.py
