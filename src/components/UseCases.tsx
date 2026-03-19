import { Newspaper, ShieldCheck, Palette, Building2 } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/Animations";

const useCases = [
    {
        icon: Newspaper,
        title: "Journalism & Media",
        description:
            "Verify image authenticity before publishing. All analysis runs locally — never risk exposing sensitive sources or unpublished images.",
    },
    {
        icon: ShieldCheck,
        title: "Digital Forensics",
        description:
            "Run ELA, noise analysis, EXIF extraction, and integrity scoring on evidence images. No cloud dependency — results stay on your machine.",
    },
    {
        icon: Palette,
        title: "Content Creators",
        description:
            "Protect your original work. Detect if your images have been AI-manipulated, and embed encrypted watermarks via StegoCrypt to prove ownership.",
    },
    {
        icon: Building2,
        title: "Privacy-First Organizations",
        description:
            "Zero data leaves the browser. Ideal for healthcare, legal, government, and education where image data is sensitive and regulated.",
    },
];

export const UseCases = () => {
    return (
        <section className="bg-muted/50">
            <div className="section-divider" />
            <div className="container py-16 md:py-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                        Who Is It <span className="gradient-text">For</span>?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        DeepGuard AI serves anyone who needs reliable image verification
                        without compromising privacy or uploading sensitive data.
                    </p>
                </div>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2">
                    {useCases.map(({ icon: Icon, title, description }) => (
                        <StaggerItem
                            key={title}
                            className="flex gap-5 border border-border bg-card rounded-lg p-6 shadow-sm card-glow transition-all"
                        >
                            <div className="shrink-0">
                                <div className="bg-primary/10 rounded-lg p-3">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-wide">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
};
