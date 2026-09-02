import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-4 bg-background p-10 text-foreground">
      <h1 className="text-2xl font-semibold">
        Business Management
      </h1>

      <ThemeToggle />
    </main>
  );
}