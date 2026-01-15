import { useGetHomepageContent } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Clock, TrendingUp, MessageSquare, Sparkles, ImageOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function HomePage() {
  const { data, isLoading } = useGetHomepageContent();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-64 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const articles = data?.articles || [];
  const rumors = data?.rumors || [];
  const discussions = data?.discussions || [];
  const trending = data?.trending || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirm':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'unconfirm':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirm':
        return 'Terkonfirmasi';
      case 'unconfirm':
        return 'Tidak Terkonfirmasi';
      default:
        return 'Menunggu';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(var(--primary)/10%),transparent_50%)]" />
        <img
          src="/assets/generated/hero-banner-futuristic.dim_1200x400.png"
          alt="48 LIVE UPDATE"
          className="h-64 w-full object-cover opacity-30 md:h-96"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 px-4">
            <h1 className="text-4xl font-bold md:text-6xl neon-text bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              48 LIVE UPDATE
            </h1>
            <p className="mt-4 text-lg md:text-xl text-foreground/80 font-medium">
              Portal Berita & Komunitas Penggemar 48 Group
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              <span>Futuristic Experience</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Trending Section */}
        {trending.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg glass neon-glow">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Trending
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trending.slice(0, 3).map((trend) => {
                if (trend.contentType === 'article') {
                  const article = articles.find((a) => a.id === trend.contentId);
                  if (!article) return null;
                  return (
                    <Card
                      key={trend.id.toString()}
                      className="group cursor-pointer overflow-hidden glass-strong border-primary/20 hover:neon-glow-hover transition-glow"
                      onClick={() => navigate({ to: '/news/$articleId', params: { articleId: article.id.toString() } })}
                    >
                      {article.image ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={article.image.getDirectURL()}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                          <Badge className="absolute right-3 top-3 gap-1 gradient-primary border-0 shadow-neon-md">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </Badge>
                        </div>
                      ) : (
                        <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
                          <ImageOff className="h-12 w-12 text-muted-foreground" />
                          <Badge className="absolute right-3 top-3 gap-1 gradient-primary border-0 shadow-neon-md">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(Number(article.date) / 1000000, { addSuffix: true, locale: id })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                } else if (trend.contentType === 'rumor') {
                  const rumor = rumors.find((r) => r.id === trend.contentId);
                  if (!rumor) return null;
                  return (
                    <Card
                      key={trend.id.toString()}
                      className="group cursor-pointer overflow-hidden glass-strong border-primary/20 hover:neon-glow-hover transition-glow"
                      onClick={() => navigate({ to: '/rumors/$rumorId', params: { rumorId: rumor.id.toString() } })}
                    >
                      <CardContent className="p-6">
                        <div className="mb-3 flex items-center justify-between">
                          <Badge className={`${getStatusColor(rumor.status)} border`}>
                            {getStatusLabel(rumor.status)}
                          </Badge>
                          <Badge className="gap-1 gradient-primary border-0 shadow-neon-md">
                            <TrendingUp className="h-3 w-3" />
                            Trending
                          </Badge>
                        </div>
                        <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                          {rumor.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(Number(rumor.date) / 1000000, { addSuffix: true, locale: id })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })}
            </div>
          </section>
        )}

        {/* Latest News */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Berita Terbaru
            </h2>
            <button
              onClick={() => navigate({ to: '/news' })}
              className="text-sm font-medium text-primary hover:text-accent transition-smooth flex items-center gap-1 group"
            >
              Lihat Semua
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 6).map((article) => (
              <Card
                key={article.id.toString()}
                className="group cursor-pointer overflow-hidden glass-strong border-border/50 hover:border-primary/50 hover:neon-glow-hover transition-glow"
                onClick={() => navigate({ to: '/news/$articleId', params: { articleId: article.id.toString() } })}
              >
                {article.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image.getDirectURL()}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                ) : (
                  <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
                    <ImageOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(Number(article.date) / 1000000, { addSuffix: true, locale: id })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest Rumors */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Rumor Terbaru
            </h2>
            <button
              onClick={() => navigate({ to: '/rumors' })}
              className="text-sm font-medium text-primary hover:text-accent transition-smooth flex items-center gap-1 group"
            >
              Lihat Semua
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {rumors.slice(0, 4).map((rumor) => (
              <Card
                key={rumor.id.toString()}
                className="cursor-pointer glass-strong border-border/50 hover:border-primary/50 hover:neon-glow-hover transition-glow group"
                onClick={() => navigate({ to: '/rumors/$rumorId', params: { rumorId: rumor.id.toString() } })}
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge className={`${getStatusColor(rumor.status)} border`}>
                      {getStatusLabel(rumor.status)}
                    </Badge>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                    {rumor.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(Number(rumor.date) / 1000000, { addSuffix: true, locale: id })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest Discussions */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Diskusi Terbaru
            </h2>
            <button
              onClick={() => navigate({ to: '/discuss' })}
              className="text-sm font-medium text-primary hover:text-accent transition-smooth flex items-center gap-1 group"
            >
              Lihat Semua
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
          <div className="space-y-4">
            {discussions.slice(0, 5).map((discussion) => (
              <Card
                key={discussion.id.toString()}
                className="cursor-pointer glass-strong border-border/50 hover:border-primary/50 hover:neon-glow-hover transition-glow group"
                onClick={() => navigate({ to: '/discuss/$discussionId', params: { discussionId: discussion.id.toString() } })}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/30">
                          {discussion.category}
                        </Badge>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(Number(discussion.timestamp) / 1000000, { addSuffix: true, locale: id })}
                        </div>
                      </div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-smooth" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
