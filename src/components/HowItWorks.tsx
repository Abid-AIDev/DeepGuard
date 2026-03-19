import { Upload, Cpu, FileCheck, HardDrive } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/Animations";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Image",
    description:
      "Drag & drop or browse to upload any image. It stays in your browser memory — never uploaded to any server.",
  },
  {
    number: "02",
    icon: HardDrive,
    title: "Model Loads",
    description:
      "On first visit, the ViT model downloads (~50MB) and caches in IndexedDB. Loads instantly on return visits.",
  },
  {
    number: "03",
    icon: Cpu,
    title: "AI Analysis",
    description:
      "Transformers.js runs the Vision Transformer directly in your browser using ONNX Runtime. GPU-accelerated where available.",
  },
  {
    number: "04",
    icon: FileCheck,
    title: "Get Results",
    description:
      "Receive verdict, confidence scores, forensic data, and detailed analysis — all computed locally on your device.",
  },
];

export const HowItWorks = () => {
  return (
    <section>
      <div className="section-divider" />
      <div className="container py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Everything runs in your browser. No server, no API, no data leaves your device.
          </p>
        </div>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <StaggerItem
              key={number}
              className="group relative border border-border bg-card rounded-lg p-8 shadow-sm card-glow transition-all"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-5xl font-bold text-primary/15">
                  {number}
                </span>
                <div className="bg-primary/10 rounded-lg p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-wide">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
