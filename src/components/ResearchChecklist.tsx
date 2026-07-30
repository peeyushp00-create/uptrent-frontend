import { CheckCircle2, Loader2, Circle, MoreHorizontal } from "lucide-react";

export default function ResearchChecklist({ steps, activeStep }: { steps: string[]; activeStep: number }) {
  return (
    <div className="panel w-full p-5 text-left">
      {steps.map((step, i) => {
        const state = i < activeStep ? "done" : i === activeStep ? "active" : "pending";
        return (
          <div
            key={step}
            className={`flex items-center gap-3 py-2 transition-opacity ${state === "pending" ? "opacity-40" : "opacity-100"}`}
          >
            {state === "done" && <CheckCircle2 className="size-4 text-primary shrink-0" />}
            {state === "active" && <Loader2 className="size-4 text-primary animate-spin shrink-0" />}
            {state === "pending" && <Circle className="size-4 text-muted-foreground shrink-0" />}
            <span className={`text-sm ${state === "active" ? "font-semibold text-foreground" : "text-foreground/80"}`}>
              {step}
            </span>
            {state === "active" && <MoreHorizontal className="size-4 ml-auto text-muted-foreground shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}
