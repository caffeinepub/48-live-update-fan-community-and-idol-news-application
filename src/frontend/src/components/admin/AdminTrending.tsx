import { useGetAllTrending, useGetUnarchivedArticles, useGetUnarchivedRumors, useGetUnarchivedDiscussions, useAddTrending, useRemoveTrending } from '../../hooks/useQueries';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Plus, Trash2, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Article, Rumor, Discussion } from '../../backend';

export default function AdminTrending() {
  const { data: trending, isLoading: trendingLoading } = useGetAllTrending();
  const { data: articles } = useGetUnarchivedArticles();
  const { data: rumors } = useGetUnarchivedRumors();
  const { data: discussions } = useGetUnarchivedDiscussions();
  const addTrending = useAddTrending();
  const removeTrending = useRemoveTrending();
  const [open, setOpen] = useState(false);
  const [contentType, setContentType] = useState<string>('article');
  const [contentId, setContentId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId) {
      toast.error('Pilih konten terlebih dahulu');
      return;
    }

    try {
      await addTrending.mutateAsync({
        contentId: BigInt(contentId),
        contentType,
      });
      toast.success('Konten berhasil ditambahkan ke trending');
      setContentId('');
      setContentType('article');
      setOpen(false);
    } catch (error) {
      toast.error('Gagal menambahkan ke trending');
      console.error(error);
    }
  };

  const handleRemove = async (id: bigint) => {
    if (!confirm('Yakin ingin menghapus dari trending?')) return;

    try {
      await removeTrending.mutateAsync(id);
      toast.success('Konten berhasil dihapus dari trending');
    } catch (error) {
      toast.error('Gagal menghapus dari trending');
      console.error(error);
    }
  };

  const getContentOptions = () => {
    switch (contentType) {
      case 'article':
        return articles?.map((a) => ({ value: a.id.toString(), label: a.title })) || [];
      case 'rumor':
        return rumors?.map((r) => ({ value: r.id.toString(), label: r.title })) || [];
      case 'discussion':
        return discussions?.map((d) => ({ value: d.id.toString(), label: d.title })) || [];
      default:
        return [];
    }
  };

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

  if (trendingLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const sortedTrending = [...(trending || [])].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Kelola Trending
          </h2>
          <p className="text-sm text-muted-foreground">Pilih konten yang akan ditampilkan di bagian trending</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary hover:neon-glow-hover transition-glow border-0">
              <Plus className="h-4 w-4" />
              Tambah Trending
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md glass-strong border-primary/20">
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Tambah Konten ke Trending
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contentType">Tipe Konten</Label>
                <Select value={contentType} onValueChange={(value) => { setContentType(value); setContentId(''); }}>
                  <SelectTrigger className="glass border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong">
                    <SelectItem value="article">Artikel</SelectItem>
                    <SelectItem value="rumor">Rumor</SelectItem>
                    <SelectItem value="discussion">Diskusi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentId">Pilih Konten</Label>
                <Select value={contentId} onValueChange={setContentId}>
                  <SelectTrigger className="glass border-border/50">
                    <SelectValue placeholder="Pilih konten..." />
                  </SelectTrigger>
                  <SelectContent className="glass-strong">
                    {getContentOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="glass">
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={addTrending.isPending}
                  className="gradient-primary hover:neon-glow-hover transition-glow border-0"
                >
                  {addTrending.isPending ? 'Menambahkan...' : 'Tambah'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedTrending.length === 0 ? (
        <Card className="glass-strong border-border/50">
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Belum ada konten trending</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTrending.map((trend) => {
            let content: Article | Rumor | Discussion | undefined = undefined;
            let contentTitle = '';
            let contentDate: bigint | undefined = undefined;

            if (trend.contentType === 'article') {
              const article = articles?.find((a) => a.id === trend.contentId);
              if (article) {
                content = article;
                contentTitle = article.title;
                contentDate = article.date;
              }
            } else if (trend.contentType === 'rumor') {
              const rumor = rumors?.find((r) => r.id === trend.contentId);
              if (rumor) {
                content = rumor;
                contentTitle = rumor.title;
                contentDate = rumor.date;
              }
            } else if (trend.contentType === 'discussion') {
              const discussion = discussions?.find((d) => d.id === trend.contentId);
              if (discussion) {
                content = discussion;
                contentTitle = discussion.title;
                contentDate = discussion.timestamp;
              }
            }

            if (!content) return null;

            const isRumor = trend.contentType === 'rumor' && 'status' in content;

            return (
              <Card 
                key={trend.id.toString()}
                className="glass-strong border-border/50 hover:border-primary/50 hover:neon-glow-hover transition-glow group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        <Badge className="gap-1 gradient-primary border-0 shadow-neon-md">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </Badge>
                        <Badge variant="outline" className="border-primary/30">
                          {trend.contentType === 'article' ? 'Artikel' : trend.contentType === 'rumor' ? 'Rumor' : 'Diskusi'}
                        </Badge>
                        {isRumor && (
                          <Badge className={`${getStatusColor((content as Rumor).status)} border`}>
                            {getStatusLabel((content as Rumor).status)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                        {contentTitle}
                      </h3>
                      {contentDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(Number(contentDate) / 1000000, { addSuffix: true, locale: id })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(trend.id)}
                        disabled={removeTrending.isPending}
                        className="glass border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 transition-glow"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

