import { Code, Terminal, Zap, Shield, FileJson } from "lucide-react";

const codeSnippet = `curl -X POST \\
  http://localhost:8000/api/verify \\
  -F "file=@image.jpg"

# Response:
{
  "verdict": "VERIFIED_AI",
  "confidence": 0.97,
  "detection": {
    "model_name": "Deep-Fake-Detector-v2",
    "score": 0.97,
    "label": "AI_GENERATED"
  },
  "processing_time_ms": 142
}`;

const features = [
    {
        icon: Terminal,
        title: "RESTful API",
        description: "Simple POST endpoint for image verification",
    },
    {
        icon: FileJson,
        title: "JSON Responses",
        description: "Structured results with confidence scores",
    },
    {
        icon: Zap,
        title: "Low Latency",
        description: "Sub-second response times for real-time use",
    },
    {
        icon: Shield,
        title: "Secure",
        description: "Images are processed and immediately discarded",
    },
];

export const DeveloperAPI = () => {
    return (
        <section className="border-b border-border bg-muted">
            <div className="container py-16 md:py-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        Integrate With Your Apps
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        Use our RESTful API to add deepfake detection to your platform.
                        Simple integration with any language or framework.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-5">
                    {/* Code Snippet */}
                    <div className="lg:col-span-3 bg-primary text-primary-foreground rounded-lg p-6 shadow-md">
                        <div className="mb-4 flex items-center gap-2">
                            <Code className="h-4 w-4 text-background" />
                            <span className="text-xs font-bold tracking-wide text-background">
                                API Example
                            </span>
                        </div>
                        <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-background/90">
                            <code>{codeSnippet}</code>
                        </pre>
                    </div>

                    {/* Feature Cards */}
                    <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="flex items-start gap-4 border border-border bg-card rounded-lg p-4 shadow-md"
                            >
                                <div className="shrink-0 bg-primary/10 rounded-lg p-2 shadow-xs">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase text-sm tracking-wide">
                                        {title}
                                    </h4>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
