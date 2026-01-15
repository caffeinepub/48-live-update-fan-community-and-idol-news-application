import { useGetUnarchivedDiscussions, useCreateDiscussion } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Clock, MessageSquare, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

const CATEGORIES = ['Umum', 'Member', 'Konser', 'Single', 'Theater', 'Lainnya'];

export default function DiscussPage() {
  const { data: discussions, isLoading } = useGetUnarchivedDiscussions();
  const { identity } = useInternetIdentity();
  const createDiscussion = useCreateDiscussion();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Umum');
  const [content, setContent] = useState('');

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Judul dan konten tidak boleh kosong');
      return;
    }

    try {
      await createDiscussion.mutateAsync({ title: title.trim(), category, content: content.trim() });
      setTitle('');
      setCategory('Umum');
      setContent('');
      setOpen(false);
      toast.success('Diskusi berhasil dibuat');
    } catch (error) {
      toast.error('Gagal membuat diskusi');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const sortedDiscussions = [...(discussions || [])].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">48 LIVE DISCUSS</h1>
            <p className="mt-2 text-muted-foreground">Forum diskusi komunitas 48 Group</p>
          </div>
          {isAuthenticated && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Buat Diskusi
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buat Diskusi Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masukkan judul diskusi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Konten</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Tulis konten diskusi Anda..."
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={createDiscussion.isPending}>
                      {createDiscussion.isPending ? 'Membuat...' : 'Buat Diskusi'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!isAuthenticated && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Silakan masuk untuk membuat diskusi dan berpartisipasi dalam forum
              </p>
            </CardContent>
          </Card>
        )}

        {sortedDiscussions.length === 0 ? (
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">Belum ada diskusi tersedia</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDiscussions.map((discussion) => (
              <Card
                key={discussion.id.toString()}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate({ to: '/discuss/$discussionId', params: { discussionId: discussion.id.toString() } })}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline">{discussion.category}</Badge>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{discussion.title}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{discussion.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(Number(discussion.timestamp) / 1000000, { addSuffix: true, locale: id })}
                        </div>
                        <span>•</span>
                        <span>{discussion.author.toString().slice(0, 8)}...</span>
                      </div>
                    </div>
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
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
