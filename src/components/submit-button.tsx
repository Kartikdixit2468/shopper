"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className,
  pendingText = "Saving…",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className ?? "merchant-primary-action"}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? <span className="button-spinner" aria-hidden="true" /> : null}
      {pending ? pendingText : children}
    </button>
  );
}
