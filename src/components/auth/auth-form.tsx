import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function AuthForm() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-5 shadow-sm text-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground mx-auto" />
      <p className="text-sm text-muted-foreground">
        Signing you in…
      </p>
    </div>
  );
}
