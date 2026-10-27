"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const databaseUnavailable =
    error.message.includes("Can't reach database server") ||
    error.message.includes("PrismaClientInitializationError");

  return (
    <main className="app-error-page">
      <section>
        <span>{databaseUnavailable ? "Connection interrupted" : "Something went wrong"}</span>
        <h1>
          {databaseUnavailable ? "We couldn’t reach the store database." : "This page hit a snag."}
        </h1>
        <p>
          {databaseUnavailable
            ? "The connection may be waking up or briefly unavailable. Your work is safe—please try again."
            : "Please try loading the page again. If it keeps happening, return to the homepage."}
        </p>
        <div>
          <button onClick={reset} type="button">
            <RefreshCw size={17} /> Try again
          </button>
          <Link href="/">Return home</Link>
        </div>
      </section>
    </main>
  );
}
