import { Upload, Cpu, FileCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Image",
    description:
      "Drag & drop or browse to upload any image. Supports PNG, JPG, and WEBP formats up to 20MB.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Analysis",
    description:
      "Our Vision Transformer model processes the image in real-time, analyzing pixel-level patterns and artifacts.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Get Results",
    description:
      "Receive a detailed verdict with confidence score, artifact analysis, and a downloadable JSON report.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="border-b-4 border-foreground">
      <div className="container py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Detect deepfakes in three simple steps. No signup required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <div
              key={number}
              className="group relative border-4 border-foreground bg-card p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-5xl font-bold text-muted-foreground/20">
                  {number}
                </span>
                <div className="border-2 border-foreground bg-accent p-3 shadow-xs">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wide">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
