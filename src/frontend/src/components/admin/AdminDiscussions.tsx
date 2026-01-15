import { useGetUnarchivedDiscussions, useCreateDiscussion, useArchiveDiscussion } from '../../hooks/useQueries';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Trash2, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';

export default function AdminDiscussions() {
  const { data: discussions, isLoading } = useGetUnarchivedDiscussions();
  const createDiscussion = useCreateDiscussion();
  const archiveDiscussion = useArchiveDiscussion();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Judul tidak boleh kosong');
      return;
    }
    
    if (!category.trim()) {
      toast.error('Kategori tidak boleh kosong');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Konten tidak boleh kosong');
      return;
    }

    try {
      await createDiscussion.mutateAsync({
        title: title.trim(),
        category: category.trim(),
        content: content.trim(),
      });
      toast.success('Diskusi berhasil dibuat');
      setTitle('');
      setCategory('');
      setContent('');
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Gagal membuat diskusi');
      console.error(error);
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Yakin ingin menghapus diskusi ini?')) return;

    try {
      await archiveDiscussion.mutateAsync(id);
      toast.success('Diskusi berhasil dihapus');
    } catch (error: any) {
      toast.error(error?.message || 'Gagal menghapus diskusi');
      console.error(error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTitle('');
    setCategory('');
    setContent('');
  };

  const handleOpenCreate = () => {
    setTitle('');
    setCategory('');
    setContent('');
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const sortedDiscussions = [...(discussions || [])].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Kelola Diskusi
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Moderasi dan buat diskusi baru</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleOpenCreate}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:neon-glow-hover transition-glow"
            >
              <Plus className="h-4 w-4" />
              Buat Diskusi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl glass-strong border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Buat Diskusi Baru
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Judul *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul diskusi"
                  className="glass border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">Kategori *</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Masukkan kategori (contoh: Umum, Berita, Pertanyaan)"
                  className="glass border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold">Konten *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis konten diskusi..."
                  rows={8}
                  className="glass border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="glass border-border/50"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={createDiscussion.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:neon-glow-hover transition-glow"
                >
                  {createDiscussion.isPending ? 'Membuat...' : 'Buat'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedDiscussions.length === 0 ? (
        <Card className="glass-strong border-border/50">
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Belum ada diskusi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDiscussions.map((discussion) => (
            <Card 
              key={discussion.id.toString()}
              className="glass-strong border-border/50 hover:border-primary/50 hover:neon-glow-hover transition-glow group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="border-primary/30 neon-glow">
                        {discussion.category}
                      </Badge>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                      {discussion.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{discussion.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(Number(discussion.timestamp) / 1000000, { addSuffix: true, locale: id })}
                      </div>
                      <span>•</span>
                      <span className="font-mono text-xs">{discussion.author.toString().slice(0, 8)}...</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(discussion.id)}
                      disabled={archiveDiscussion.isPending}
                      className="glass border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 transition-glow"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
