# 🛡️ DeepGuard AI

**AI-Powered Digital Media Authentication Platform**

DeepGuard AI is a privacy-first web application that detects deepfakes, identifies AI-generated images, performs forensic analysis, and provides steganographic encryption — all running **100% client-side** in your browser. Your images never leave your device.

> 🔗 **Live Demo**: [deepguard-ai.netlify.app](https://deepguard-ai.netlify.app)

---

## ✨ Features

### 🔍 Deepfake Detection
- Binary classification: **Real** vs **Deepfake**
- Powered by **Deep-Fake-Detector-v2** (ViT-Base patch16, 224×224)
- 70% confidence threshold for definitive verdicts
- Detailed confidence scores with heatmap overlay support

### 🤖 AI Image Detection
- 3-class classification: **AI-Generated** · **Deepfake** · **Authentic**
- Powered by **AI-vs-Deepfake-vs-Real** ViT model
- Works with any image type — not just faces
- Low-confidence warnings with actionable guidance

### 🔬 Forensics Toolkit
- **Error Level Analysis (ELA)** — detects edited/spliced regions
- **Noise Pattern Analysis** — reveals inconsistent noise across image regions
- **EXIF Metadata Extraction** — reads camera data, GPS, software tags
- **Integrity Score** — composite authenticity rating

### 🔐 StegoCrypt (Steganography + Encryption)
- Hide secret messages inside images using **LSB steganography**
- Messages encrypted with **AES-256-GCM** via Web Crypto API
- Key derivation using **PBKDF2** with random salt
- Extract and decrypt hidden payloads from steganographic images

### 📦 Batch Scanning
- Upload and scan multiple images simultaneously
- Aggregated results with per-image confidence breakdown
- Export batch reports

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ React UI │  │ AI Models│  │ Forensics │ │
│  │ (Vite)   │  │ (ONNX)   │  │ (Canvas)  │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │              │              │        │
│  ┌────┴──────────────┴──────────────┴─────┐ │
│  │         Transformers.js / WASM          │ │
│  │         Web Crypto API                  │ │
│  │         IndexedDB (Model Cache)         │ │
│  └─────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────┘
                   │ Auth & History only
            ┌──────┴──────┐
            │  Supabase   │
            │  (Auth/DB)  │
            └─────────────┘
```

**Zero-Upload Architecture** — All AI inference and image processing runs entirely in the browser via ONNX Runtime Web (WASM). No images are ever sent to a server.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui, Framer Motion |
| **AI/ML** | `@huggingface/transformers` v3, ONNX Runtime Web (WASM) |
| **Forensics** | Canvas API (ELA, Noise Analysis), `exifr` (Metadata) |
| **Encryption** | Web Crypto API (AES-256-GCM, PBKDF2) |
| **Auth/DB** | Supabase (PostgreSQL + Auth) |
| **Deployment** | Netlify |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Abid-AIDev/DeepGuard.git

# Navigate to project directory
cd DeepGuard

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
```

---

## 🧠 AI Models Used

| Model | Purpose | Architecture | Source |
|-------|---------|-------------|--------|
| `Deep-Fake-Detector-v2-Model-ONNX` | Deepfake Detection (binary) | ViT-Base patch16 224×224 | [HuggingFace](https://huggingface.co/onnx-community/Deep-Fake-Detector-v2-Model-ONNX) |
| `AI-vs-Deepfake-vs-Real-ONNX` | AI Image Detection (3-class) | ViT-Base patch32 224×224 | [HuggingFace](https://huggingface.co/prithivMLmods/AI-vs-Deepfake-vs-Real-ONNX) |

Models are downloaded from HuggingFace Hub on first use (~50MB each) and **cached in IndexedDB** for offline use.

---

## 🔒 Privacy & Security

- **Zero-Upload**: All processing happens client-side — images never leave the browser
- **No Telemetry**: No tracking, analytics, or data collection on uploaded images
- **AES-256-GCM**: Military-grade encryption for steganographic payloads
- **PBKDF2**: Secure key derivation with 100,000 iterations and random salt
- **Supabase Auth**: Secure authentication for optional scan history features

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation bar
│   ├── ImageUpload.tsx  # Drag-and-drop upload
│   ├── VerificationResult.tsx  # Detection result display
│   └── ui/              # shadcn/ui primitives
├── contexts/            # React context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── ThemeContext.tsx  # Dark/light theme
├── lib/                 # Core logic modules
│   ├── detector.ts      # Deepfake detection (ViT model)
│   ├── aiDetector.ts    # AI image detection (3-class)
│   ├── clientForensics.ts  # ELA & noise analysis
│   ├── exifExtractor.ts # EXIF metadata parsing
│   ├── steganography.ts # LSB encoding/decoding
│   ├── encryption.ts    # AES-256-GCM encryption
│   └── supabaseClient.ts  # Supabase connection
├── pages/               # Route pages
│   ├── Index.tsx         # Landing page
│   ├── DeepfakeScan.tsx  # Deepfake scanner
│   ├── AIImageDetect.tsx # AI image detector
│   ├── ForensicsPage.tsx # Forensics toolkit
│   ├── StegoCrypt.tsx    # Steganography tool
│   └── BatchScan.tsx     # Batch processing
└── App.tsx              # Router & providers
```

---

## 👥 Team

- **Abid** — Lead Developer & AI Integration
- Built as a B.Tech Mini Project (2025-2026)

---

## 📄 License

This project is for educational and research purposes.

---

<p align="center">
  <b>DeepGuard AI</b> — Securing Digital Trust with Client-Side AI
  <br/>
  Made with ❤️ using React, TypeScript & Vision Transformers
</p>
