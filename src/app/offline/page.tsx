import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline — Summa AI",
  description: "You are currently offline.",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">You are offline</h1>
      <p className="text-muted-foreground">
        Please check your internet connection and try again.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
      >
        Go back home
      </Link>
    </div>
  );
}
