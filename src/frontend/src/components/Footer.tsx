import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-gradient-to-br from-card to-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            © 2026. 48 LIVE UPDATE Indonesia
          </p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            Build For 48 Fans
          </p>
        </div>
      </div>
    </footer>
  );
}
