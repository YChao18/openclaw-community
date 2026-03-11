"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "ghost" | "primary";
};

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary"
          ? "border-brand-yellow/30 bg-brand-yellow-soft text-brand-yellow hover:bg-brand-yellow/20"
          : "border-default bg-surface text-primary hover:bg-interactive-muted-hover",
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
