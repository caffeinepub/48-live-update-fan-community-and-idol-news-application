import { useNavigate, useSearch } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useGetUnarchivedRumors } from "../hooks/useQueries";

export default function RumorsPage() {
  const { data: rumors, isLoading } = useGetUnarchivedRumors();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [localSearch, setLocalSearch] = useState(searchParams.q || "");

  const filteredRumors = useMemo(() => {
    if (!rumors) return [];
    const sorted = [...rumors].sort((a, b) => Number(b.date - a.date));
    if (!localSearch.trim()) return sorted;

    const query = localSearch.toLowerCase();
    return sorted.filter(
      (rumor) =>
        rumor.title.toLowerCase().includes(query) ||
        rumor.content.toLowerCase().includes(query),
    );
  }, [rumors, localSearch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirm":
        return "bg-success/20 text-success border-success/30";
      case "unconfirm":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-warning/20 text-warning border-warning/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirm":
        return "Terkonfirmasi";
      case "unconfirm":
        return "Tidak Terkonfirmasi";
      default:
        return "Menunggu";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gradient mb-4">
            48 LIVE RUMOR
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Rumor dan kabar terbaru seputar 48 Group
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari rumor..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-12 rounded-full border-2 border-accent/20 focus:border-accent h-12"
            />
          </div>
        </div>

        {filteredRumors.length === 0 ? (
          <Card className="rounded-3xl border-2 border-accent/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
            <CardContent className="flex h-64 flex-col items-center justify-center gap-4">
              <Sparkles className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {localSearch
                  ? "Tidak ada rumor yang cocok dengan pencarian"
                  : "Belum ada rumor tersedia"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRumors.map((rumor) => (
              <Card
                key={rumor.id.toString()}
                className="cursor-pointer rounded-3xl border-2 border-accent/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth group"
                onClick={() =>
                  navigate({
                    to: "/rumors/$rumorId",
                    params: { rumorId: rumor.id.toString() },
                  })
                }
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge
                      className={`${getStatusColor(rumor.status)} rounded-full`}
                    >
                      {getStatusLabel(rumor.status)}
                    </Badge>
                  </div>
                  <h3 className="mb-3 line-clamp-2 text-lg font-bold group-hover:text-primary transition-smooth">
                    {rumor.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {rumor.content}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(Number(rumor.date) / 1000000, {
                      addSuffix: true,
                      locale: id,
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
