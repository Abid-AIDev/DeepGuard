import { Newspaper, Landmark, Smartphone, Building2 } from "lucide-react";

const useCases = [
    {
        icon: Newspaper,
        title: "Journalism & Media",
        description:
            "Verify image authenticity before publishing. Protect editorial integrity and prevent misinformation from spreading through manipulated visuals.",
    },
    {
        icon: Landmark,
        title: "Government & Law Enforcement",
        description:
            "Detect manipulated evidence in legal proceedings. Ensure the integrity of visual documentation in investigations and court cases.",
    },
    {
        icon: Smartphone,
        title: "Social Media Platforms",
        description:
            "Automate content moderation at scale. Flag AI-generated images in user uploads to combat deepfake-driven disinformation campaigns.",
    },
    {
        icon: Building2,
        title: "Enterprise & Compliance",
        description:
            "Protect your brand from AI-generated fraud. Verify identity documents, marketing materials, and user-submitted content.",
    },
];

export const UseCases = () => {
    return (
        <section className="border-b-4 border-foreground bg-muted">
            <div className="container py-16 md:py-24">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold uppercase tracking-tight md:text-4xl">
                        Who Is It For?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                        DeepGuard AI serves organizations and individuals who need reliable
                        deepfake detection across diverse industries.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    {useCases.map(({ icon: Icon, title, description }) => (
                        <div
                            key={title}
                            className="flex gap-5 border-4 border-foreground bg-card p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="shrink-0">
                                <div className="border-2 border-foreground bg-accent p-3 shadow-xs">
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold uppercase tracking-wide">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
