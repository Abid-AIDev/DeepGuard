"""
FastAPI Backend for SecureVision AI
Deepfake Detection API Server
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from PIL import Image
import io
from typing import List
import time

from detector import get_detector

# Initialize FastAPI app
app = FastAPI(
    title="SecureVision AI API",
    description="Deepfake Detection API powered by Vision Transformer",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    print("🚀 Starting SecureVision AI Backend...")
    # Initialize detector (loads model)
    get_detector()
    print("✅ Backend ready!")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "SecureVision AI",
        "version": "1.0.0"
    }


@app.get("/api/health")
async def health_check():
    """Health check for API"""
    return {
        "status": "healthy",
        "model": "Deep-Fake-Detector-v2",
        "ready": True
    }


@app.post("/api/verify")
async def verify_image(
    file: UploadFile = File(...),
    heatmap: bool = Query(False, description="Generate attention heatmap overlay"),
    model: str = Query("vit-v2", description="Model ID to use for detection"),
):
    """
    Verify if an uploaded image is AI-generated or real
    
    Args:
        file: Image file (PNG, JPG, WEBP)
        heatmap: Whether to generate GradCAM heatmap
        model: Which model to use (vit-v2, ai-detector, sdxl-detector, ensemble)
        
    Returns:
        VerificationData matching frontend interface
    """
    image, contents = await _load_image(file)
    
    detector = get_detector()
    
    if heatmap:
        result = detector.verify_with_heatmap(image)
    else:
        result = detector.verify(image)
    
    return JSONResponse(content=result)


@app.post("/api/verify/batch")
async def verify_batch(
    files: List[UploadFile] = File(...),
    heatmap: bool = Query(False),
):
    """
    Verify multiple images in a single request.
    Returns an array of results, one per image.
    """
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 images per batch.")
    
    detector = get_detector()
    results = []
    
    for file in files:
        try:
            image, _ = await _load_image(file)
            if heatmap:
                result = detector.verify_with_heatmap(image)
            else:
                result = detector.verify(image)
            result["filename"] = file.filename
            result["status"] = "success"
            results.append(result)
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
    
    return JSONResponse(content={"results": results, "total": len(results)})


@app.post("/api/forensics")
async def analyze_forensics(file: UploadFile = File(...)):
    """
    Run forensic analysis on an image: metadata, ELA, noise analysis.
    """
    from forensics import extract_metadata, error_level_analysis, noise_analysis
    
    image, contents = await _load_image(file)
    
    try:
        metadata = extract_metadata(image)
        ela_b64 = error_level_analysis(contents)
        noise_b64 = noise_analysis(image)
        
        return JSONResponse(content={
            "metadata": metadata,
            "ela_base64": ela_b64,
            "noise_base64": noise_b64,
        })
    except Exception as e:
        print(f"❌ Forensics error: {e}")
        raise HTTPException(status_code=500, detail=f"Forensics analysis failed: {str(e)}")


async def _load_image(file: UploadFile):
    """Validate and load an uploaded image file. Returns (PIL Image, raw bytes)."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    contents = await file.read()
    
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Maximum size is 20MB.")
    
    try:
        image = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process image: {str(e)}")
    
    return image, contents


@app.get("/api/models")
async def list_models():
    """List available detection models"""
    return {
        "models": [
            {
                "id": "deep-fake-detector-v2",
                "name": "Deep-Fake-Detector-v2",
                "version": "2.0.0",
                "accuracy": "92.12%",
                "architecture": "Vision Transformer (ViT-Base)",
                "active": True
            }
        ]
    }


if __name__ == "__main__":
    print("=" * 50)
    print("  SecureVision AI - Deepfake Detection Backend")
    print("=" * 50)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload in production
        log_level="info"
    )
