import { useGetUnarchivedArticles } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Clock, ImageOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function NewsPage() {
  const { data: articles, isLoading } = useGetUnarchivedArticles();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  const sortedArticles = [...(articles || [])].sort((a, b) => Number(b.date - a.date));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">48 LIVE UPDATE</h1>
          <p className="mt-2 text-muted-foreground">Berita terbaru seputar 48 Group</p>
        </div>

        {sortedArticles.length === 0 ? (
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">Belum ada berita tersedia</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedArticles.map((article) => (
              <Card
                key={article.id.toString()}
                className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                onClick={() => navigate({ to: '/news/$articleId', params: { articleId: article.id.toString() } })}
              >
                {article.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image.getDirectURL()}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
                    <ImageOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{article.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{article.content}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(Number(article.date) / 1000000, { addSuffix: true, locale: id })}
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
