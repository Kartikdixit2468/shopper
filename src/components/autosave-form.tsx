"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";

import type { AutosaveState } from "@/app/actions/presence";

type AutosaveFormProps = {
  autosave: (formData: FormData) => Promise<AutosaveState>;
  submitAction: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
};

export function AutosaveForm({ autosave, submitAction, children, className }: AutosaveFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [message, setMessage] = useState("Changes save automatically");
  const [pending, startTransition] = useTransition();

  function scheduleSave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage("Unsaved changes");
    timerRef.current = setTimeout(() => {
      if (!formRef.current) return;
      const data = new FormData(formRef.current);
      startTransition(async () => {
        const result = await autosave(data);
        setMessage(result.message);
      });
    }, 700);
  }

  return (
    <form ref={formRef} action={submitAction} className={className} onInput={scheduleSave}>
      <div className={`autosave-status ${pending ? "is-saving" : ""}`} aria-live="polite">
        <span /> {pending ? "Saving…" : message}
      </div>
      {children}
    </form>
  );
}
