import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard = ({ icon: Icon, title, description, className }: FeatureCardProps) => {
  return (
    <div className={cn(
      "border-4 border-foreground bg-card p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg",
      className
    )}>
      <div className="mb-4 inline-block border-2 border-foreground bg-accent p-3 shadow-xs">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold uppercase tracking-wide">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};
