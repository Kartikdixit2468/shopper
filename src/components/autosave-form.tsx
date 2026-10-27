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
  const saveInFlightRef = useRef(false);
  const saveQueuedRef = useRef(false);
  const [message, setMessage] = useState("Changes save automatically");
  const [pending, startTransition] = useTransition();

  function runAutosave() {
    if (!formRef.current) return;
    if (saveInFlightRef.current) {
      saveQueuedRef.current = true;
      return;
    }

    saveInFlightRef.current = true;
    const data = new FormData(formRef.current);
    startTransition(async () => {
      try {
        const result = await autosave(data);
        setMessage(result.message);
      } finally {
        saveInFlightRef.current = false;
        if (saveQueuedRef.current) {
          saveQueuedRef.current = false;
          timerRef.current = setTimeout(runAutosave, 350);
        }
      }
    });
  }

  function scheduleSave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage("Unsaved changes");
    timerRef.current = setTimeout(runAutosave, 1400);
  }

  function cancelScheduledSave() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    saveQueuedRef.current = false;
  }

  return (
    <form
      ref={formRef}
      action={submitAction}
      className={className}
      onInput={scheduleSave}
      onSubmit={cancelScheduledSave}
    >
      <div className={`autosave-status ${pending ? "is-saving" : ""}`} aria-live="polite">
        <span /> {pending ? "Saving…" : message}
      </div>
      {children}
    </form>
  );
}
