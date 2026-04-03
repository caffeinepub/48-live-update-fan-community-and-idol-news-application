import { useNavigate, useSearch } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useGetUnarchivedArticles } from "../hooks/useQueries";

export default function NewsPage() {
  const { data: articles, isLoading } = useGetUnarchivedArticles();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [localSearch, setLocalSearch] = useState(searchParams.q || "");

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    const sorted = [...articles].sort((a, b) => Number(b.date - a.date));
    if (!localSearch.trim()) return sorted;

    const query = localSearch.toLowerCase();
    return sorted.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query),
    );
  }, [articles, localSearch]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 rounded-3xl" />
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
            48 LIVE UPDATE
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Berita terbaru seputar 48 Group
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari berita..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-12 rounded-full border-2 border-primary/20 focus:border-primary h-12"
            />
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
            <CardContent className="flex h-64 flex-col items-center justify-center gap-4">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {localSearch
                  ? "Tidak ada berita yang cocok dengan pencarian"
                  : "Belum ada berita tersedia"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card
                key={article.id.toString()}
                className="group cursor-pointer overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                onClick={() =>
                  navigate({
                    to: "/news/$articleId",
                    params: { articleId: article.id.toString() },
                  })
                }
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-primary/30 group-hover:scale-110 transition-smooth" />
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-3 line-clamp-2 text-lg font-bold group-hover:text-primary transition-smooth">
                    {article.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {article.content}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(Number(article.date) / 1000000, {
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
