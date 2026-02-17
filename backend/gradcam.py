"""
GradCAM / Attention Rollout for Vision Transformer (ViT)

Generates heatmaps showing which image regions triggered the deepfake detection.
Uses attention rollout: aggregate attention from all ViT layers to produce a spatial map.
"""

import torch
import numpy as np
import cv2
from PIL import Image
import base64
import io


def generate_attention_heatmap(model, processor, image: Image.Image, device) -> str:
    """
    Generate an attention-based heatmap for a ViT model.
    
    Uses attention rollout across all transformer layers to create a spatial
    attention map showing which regions the model focused on.
    
    Args:
        model: HuggingFace ViT model
        processor: HuggingFace image processor
        image: PIL Image
        device: torch device
        
    Returns:
        Base64-encoded PNG of the colored heatmap overlay
    """
    # Ensure RGB
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Preprocess
    inputs = processor(images=image, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # Forward pass with attention weights
    with torch.no_grad():
        outputs = model(**inputs, output_attentions=True)
    
    # Get attention from all layers: list of (batch, heads, seq_len, seq_len)
    attentions = outputs.attentions
    
    # Attention rollout
    rollout = _attention_rollout(attentions)
    
    # Extract CLS token attention to all patches (skip CLS token itself)
    # rollout shape: (seq_len, seq_len), we want row 0 (CLS) -> all patches
    cls_attention = rollout[0, 1:]  # skip CLS token position
    
    # Reshape to spatial grid
    # ViT-Base with 224x224 input uses 16x16 patches -> 14x14 grid
    num_patches = cls_attention.shape[0]
    grid_size = int(np.sqrt(num_patches))
    
    if grid_size * grid_size != num_patches:
        # Fallback: try to find closest square
        grid_size = int(np.ceil(np.sqrt(num_patches)))
        # Pad if needed
        padded = np.zeros(grid_size * grid_size)
        padded[:num_patches] = cls_attention
        attention_map = padded.reshape(grid_size, grid_size)
    else:
        attention_map = cls_attention.reshape(grid_size, grid_size)
    
    # Normalize to [0, 1]
    attention_map = (attention_map - attention_map.min()) / (attention_map.max() - attention_map.min() + 1e-8)
    
    # Resize to original image dimensions
    orig_w, orig_h = image.size
    attention_map_resized = cv2.resize(
        attention_map.astype(np.float32),
        (orig_w, orig_h),
        interpolation=cv2.INTER_CUBIC
    )
    
    # Apply colormap (jet: blue=low, red=high)
    heatmap_colored = cv2.applyColorMap(
        (attention_map_resized * 255).astype(np.uint8),
        cv2.COLORMAP_JET
    )
    
    # Convert BGR to RGB
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
    
    # Blend with original image
    original_np = np.array(image.resize((orig_w, orig_h)))
    blended = cv2.addWeighted(original_np, 0.5, heatmap_colored, 0.5, 0)
    
    # Encode to base64 PNG
    blended_image = Image.fromarray(blended)
    buffer = io.BytesIO()
    blended_image.save(buffer, format="PNG", optimize=True)
    buffer.seek(0)
    
    heatmap_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    return heatmap_b64


def _attention_rollout(attentions) -> np.ndarray:
    """
    Compute attention rollout across all transformer layers.
    
    Multiplies attention matrices from all layers, adding residual connections,
    to get the total attention flow from input to output.
    
    Args:
        attentions: tuple of attention tensors (batch, heads, seq_len, seq_len)
        
    Returns:
        numpy array of shape (seq_len, seq_len) with rollout attention
    """
    # Average across heads for each layer
    all_layer_attentions = []
    for attention in attentions:
        # attention shape: (batch, heads, seq_len, seq_len)
        # Average across heads -> (batch, seq_len, seq_len)
        att = attention.squeeze(0).mean(dim=0).cpu().numpy()
        all_layer_attentions.append(att)
    
    # Attention rollout with residual connections
    seq_len = all_layer_attentions[0].shape[0]
    rollout = np.eye(seq_len)
    
    for attention in all_layer_attentions:
        # Add identity for residual connection
        attention_with_residual = 0.5 * attention + 0.5 * np.eye(seq_len)
        # Normalize rows
        row_sums = attention_with_residual.sum(axis=-1, keepdims=True)
        attention_with_residual = attention_with_residual / (row_sums + 1e-8)
        # Multiply through
        rollout = rollout @ attention_with_residual
    
    return rollout
