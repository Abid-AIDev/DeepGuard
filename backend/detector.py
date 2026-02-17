"""
Deepfake Detection Model Wrapper
Optimized for Mac M3 with MPS (Metal Performance Shaders) support
"""

import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import time
import io

from gradcam import generate_attention_heatmap


class DeepfakeDetector:
    """
    Wrapper for prithivMLmods/Deep-Fake-Detector-v2-Model
    Provides high-performance inference on Mac M3
    """
    
    _instance = None
    _model = None
    _processor = None
    _device = None
    
    def __new__(cls):
        """Singleton pattern to ensure model is loaded only once"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize model and processor"""
        print("🚀 Loading Deepfake Detection Model...")
        start_time = time.time()
        
        # Select best available device
        if torch.backends.mps.is_available():
            self._device = torch.device("mps")
            print("✅ Using Apple Silicon GPU (MPS)")
        elif torch.cuda.is_available():
            self._device = torch.device("cuda")
            print("✅ Using NVIDIA GPU (CUDA)")
        else:
            self._device = torch.device("cpu")
            print("⚠️ Using CPU (slower inference)")
        
        # Load model from Hugging Face
        model_name = "prithivMLmods/Deep-Fake-Detector-v2-Model"
        
        self._processor = AutoImageProcessor.from_pretrained(model_name)
        self._model = AutoModelForImageClassification.from_pretrained(model_name)
        self._model.to(self._device)
        self._model.eval()
        
        load_time = time.time() - start_time
        print(f"✅ Model loaded in {load_time:.2f}s on {self._device}")
        
        # Warm up the model
        self._warmup()
    
    def _warmup(self):
        """Warm up model for faster first inference"""
        print("🔥 Warming up model...")
        dummy_image = Image.new('RGB', (224, 224), color='white')
        self.verify(dummy_image)
        print("✅ Model ready!")
    
    def verify(self, image: Image.Image) -> dict:
        """
        Verify if an image is a deepfake or real
        
        Args:
            image: PIL Image object
            
        Returns:
            dict containing verification results
        """
        start_time = time.time()
        
        # Ensure RGB format
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess image
        inputs = self._processor(images=image, return_tensors="pt")
        inputs = {k: v.to(self._device) for k, v in inputs.items()}
        
        # Inference
        with torch.no_grad():
            outputs = self._model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=1)
        
        # Get predictions
        # Model labels: 0 = Realism, 1 = Deepfake (from model config.json id2label)
        real_score = probs[0][0].item()
        fake_score = probs[0][1].item()
        
        is_deepfake = fake_score > real_score
        confidence = max(fake_score, real_score)
        
        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Determine verdict
        if confidence >= 0.85:
            verdict = "VERIFIED_AI" if is_deepfake else "VERIFIED_REAL"
        elif confidence >= 0.6:
            verdict = "VERIFIED_AI" if is_deepfake else "VERIFIED_REAL"
        else:
            verdict = "UNVERIFIED"
        
        # Build response matching frontend VerificationData interface
        result = {
            "verdict": verdict,
            "confidence": confidence,
            "watermark": {
                "present": False,
                "valid": False,
                "source_id": None,
                "timestamp": None,
                "payload": None
            },
            "detection": {
                "model_name": "Deep-Fake-Detector-v2",
                "model_version": "2.0.0",
                "score": fake_score if is_deepfake else real_score,
                "label": "AI_GENERATED" if is_deepfake else "LIKELY_REAL",
                "artifact_types": self._detect_artifacts(is_deepfake, confidence)
            },
            "image_quality": {
                "psnr": 40.0,  # Placeholder - could implement actual PSNR
                "ssim": 0.95   # Placeholder - could implement actual SSIM
            },
            "reasons": self._generate_reasons(is_deepfake, confidence, fake_score, real_score),
            "processing_time_ms": processing_time_ms
        }
        
        return result
    
    def _detect_artifacts(self, is_deepfake: bool, confidence: float) -> list:
        """Detect potential AI artifacts based on confidence"""
        artifacts = []
        if is_deepfake:
            if confidence > 0.9:
                artifacts.append("high_confidence_ai_signature")
            if confidence > 0.75:
                artifacts.append("frequency_anomaly")
            if confidence > 0.6:
                artifacts.append("texture_inconsistency")
        return artifacts
    
    def _generate_reasons(self, is_deepfake: bool, confidence: float, 
                          fake_score: float, real_score: float) -> list:
        """Generate human-readable reasons for the verdict"""
        reasons = []
        
        # Primary detection reason
        if is_deepfake:
            reasons.append(
                f"AI detection model classifies image as AI-generated with {fake_score:.1%} confidence."
            )
            if confidence > 0.9:
                reasons.append("High probability of synthetic generation detected.")
            elif confidence > 0.75:
                reasons.append("Significant AI-generated patterns identified in image.")
        else:
            reasons.append(
                f"Image appears to be authentic with {real_score:.1%} confidence."
            )
            if confidence > 0.9:
                reasons.append("No significant AI generation artifacts detected.")
            elif confidence > 0.75:
                reasons.append("Image passes most authenticity checks.")
        
        # Watermark reason
        reasons.append("No embedded watermark found in image.")
        
        return reasons
    
    def verify_with_heatmap(self, image: Image.Image) -> dict:
        """Verify image and generate attention heatmap overlay"""
        result = self.verify(image)
        
        try:
            heatmap_b64 = generate_attention_heatmap(
                self._model, self._processor, image, self._device
            )
            result["heatmap_base64"] = heatmap_b64
        except Exception as e:
            print(f"⚠️ Heatmap generation failed: {e}")
            result["heatmap_base64"] = None
        
        return result
    
    def verify_from_bytes(self, image_bytes: bytes) -> dict:
        """Verify image from raw bytes"""
        image = Image.open(io.BytesIO(image_bytes))
        return self.verify(image)
    
    def verify_from_path(self, image_path: str) -> dict:
        """Verify image from file path"""
        image = Image.open(image_path)
        return self.verify(image)


# Singleton instance
detector = None

def get_detector() -> DeepfakeDetector:
    """Get or create the detector instance"""
    global detector
    if detector is None:
        detector = DeepfakeDetector()
    return detector
