import { useGetHomepageContent } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
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
  const trendingTable = data?.trendingTable || [];
  const latestArticlesTable = data?.latestArticlesTable || [];

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

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'Update':
        return 'Berita';
      case 'Rumor':
        return 'Rumor';
      case 'Discuss':
        return 'Diskusi';
      default:
        return type;
    }
  };

  const getItemTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Update':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Rumor':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Discuss':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleTableRowClick = (itemType: string, itemId: bigint) => {
    if (itemType === 'Update') {
      navigate({ to: '/news/$articleId', params: { articleId: itemId.toString() } });
    } else if (itemType === 'Rumor') {
      navigate({ to: '/rumors/$rumorId', params: { rumorId: itemId.toString() } });
    } else if (itemType === 'Discuss') {
      navigate({ to: '/discuss/$discussionId', params: { discussionId: itemId.toString() } });
    }
  };

  const getItemTitle = (itemType: string, itemId: bigint) => {
    if (itemType === 'Update') {
      const article = articles.find((a) => a.id === itemId);
      return article?.title || 'Tidak ditemukan';
    } else if (itemType === 'Rumor') {
      const rumor = rumors.find((r) => r.id === itemId);
      return rumor?.title || 'Tidak ditemukan';
    } else if (itemType === 'Discuss') {
      const discussion = discussions.find((d) => d.id === itemId);
      return discussion?.title || 'Tidak ditemukan';
    }
    return 'Tidak ditemukan';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(var(--primary)/10%),transparent_50%)]" />
        <img
          src="/assets/IMG_7148.jpeg"
          alt="48 LIVE UPDATE"
          className="h-64 w-full object-cover opacity-40 md:h-96"
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
              <span>Wota Experience</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Trending Table */}
        {trendingTable.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg glass neon-glow">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Trending Terbaru
              </h2>
            </div>
            <Card className="glass-strong border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-primary font-semibold">Tipe</TableHead>
                        <TableHead className="text-primary font-semibold">Judul</TableHead>
                        <TableHead className="text-primary font-semibold text-right">Waktu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trendingTable
                        .sort((a, b) => Number(b.timestamp - a.timestamp))
                        .slice(0, 10)
                        .map((item, index) => (
                          <TableRow
                            key={index}
                            className="border-border/30 hover:bg-primary/5 cursor-pointer transition-smooth"
                            onClick={() => handleTableRowClick(item.itemType, item.itemId)}
                          >
                            <TableCell>
                              <Badge className={`${getItemTypeBadgeClass(item.itemType)} border`}>
                                {getItemTypeLabel(item.itemType)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{getItemTitle(item.itemType, item.itemId)}</TableCell>
                            <TableCell className="text-right text-muted-foreground text-sm">
                              {formatDistanceToNow(Number(item.timestamp) / 1000000, { addSuffix: true, locale: id })}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Latest Articles Table */}
        {latestArticlesTable.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="p-2 rounded-lg glass neon-glow">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Konten Terbaru
              </h2>
            </div>
            <Card className="glass-strong border-accent/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-accent font-semibold">Tipe</TableHead>
                        <TableHead className="text-accent font-semibold">Judul</TableHead>
                        <TableHead className="text-accent font-semibold text-right">Tanggal Upload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestArticlesTable
                        .sort((a, b) => Number(b.uploadDate - a.uploadDate))
                        .slice(0, 15)
                        .map((item, index) => (
                          <TableRow
                            key={index}
                            className="border-border/30 hover:bg-accent/5 cursor-pointer transition-smooth"
                            onClick={() => handleTableRowClick(item.itemType, item.itemId)}
                          >
                            <TableCell>
                              <Badge className={`${getItemTypeBadgeClass(item.itemType)} border`}>
                                {getItemTypeLabel(item.itemType)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{getItemTitle(item.itemType, item.itemId)}</TableCell>
                            <TableCell className="text-right text-muted-foreground text-sm">
                              {formatDistanceToNow(Number(item.uploadDate) / 1000000, { addSuffix: true, locale: id })}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

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
