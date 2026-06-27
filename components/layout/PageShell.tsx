import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "2xl" | "3xl" | "4xl";
}

export function PageShell({
  children,
  className,
  maxWidth = "3xl",
}: PageShellProps) {
  const maxWidthClass = {
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url('/images/gym-bg.png')" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-black/45" aria-hidden />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/60 to-black/90" aria-hidden />

      <main
        className={cn(
          "relative container mx-auto px-4 py-10 sm:py-12",
          maxWidthClass,
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
