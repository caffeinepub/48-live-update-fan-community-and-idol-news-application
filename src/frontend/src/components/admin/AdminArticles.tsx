import { useGetUnarchivedArticles, useCreateArticle, useUpdateArticle, useArchiveArticle } from '../../hooks/useQueries';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Plus, Edit, Trash2, Clock, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Article } from '../../backend';

export default function AdminArticles() {
  const { data: articles, isLoading } = useGetUnarchivedArticles();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const archiveArticle = useArchiveArticle();
  const [open, setOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Judul tidak boleh kosong');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Konten tidak boleh kosong');
      return;
    }

    try {
      let imageBlob: ExternalBlob | null = null;
      
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (editingArticle && editingArticle.image) {
        imageBlob = editingArticle.image;
      }

      if (editingArticle) {
        await updateArticle.mutateAsync({
          id: editingArticle.id,
          title: title.trim(),
          image: imageBlob,
          content: content.trim(),
        });
        toast.success('Artikel berhasil diperbarui');
      } else {
        await createArticle.mutateAsync({
          title: title.trim(),
          image: imageBlob || undefined,
          content: content.trim(),
        });
        toast.success('Artikel berhasil dibuat');
      }

      setTitle('');
      setContent('');
      setImageFile(null);
      setUploadProgress(0);
      setEditingArticle(null);
      setOpen(false);
    } catch (error: any) {
      const errorMessage = error?.message || (editingArticle ? 'Gagal memperbarui artikel' : 'Gagal membuat artikel');
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setContent(article.content);
    setImageFile(null);
    setOpen(true);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return;

    try {
      await archiveArticle.mutateAsync(id);
      toast.success('Artikel berhasil dihapus');
    } catch (error: any) {
      toast.error(error?.message || 'Gagal menghapus artikel');
      console.error(error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingArticle(null);
    setTitle('');
    setContent('');
    setImageFile(null);
    setUploadProgress(0);
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setTitle('');
    setContent('');
    setImageFile(null);
    setUploadProgress(0);
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

  const sortedArticles = [...(articles || [])].sort((a, b) => Number(b.date - a.date));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Kelola Artikel
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Buat dan kelola artikel berita</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleOpenCreate}
              className="gap-2 gradient-primary hover:neon-glow-hover transition-glow"
            >
              <Plus className="h-4 w-4" />
              Buat Artikel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl glass-strong border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {editingArticle ? 'Edit Artikel' : 'Buat Artikel Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Judul *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul artikel"
                  className="glass border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="text-base font-semibold">
                  Gambar (Opsional)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="glass border-primary/20 focus:border-primary/50"
                  />
                  {imageFile && (
                    <div className="flex items-center gap-2 text-sm text-green-500">
                      <Upload className="h-4 w-4" />
                      <span>Dipilih</span>
                    </div>
                  )}
                </div>
                {editingArticle && !imageFile && editingArticle.image && (
                  <p className="text-sm text-muted-foreground">Biarkan kosong untuk tetap menggunakan gambar lama</p>
                )}
                {!editingArticle && (
                  <p className="text-sm text-muted-foreground">Gambar dapat ditambahkan nanti jika diperlukan</p>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <p className="text-sm text-primary">Upload: {uploadProgress}%</p>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold">Konten *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis konten artikel..."
                  rows={10}
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
                  disabled={createArticle.isPending || updateArticle.isPending}
                  className="gradient-primary hover:neon-glow-hover transition-glow"
                >
                  {createArticle.isPending || updateArticle.isPending
                    ? 'Menyimpan...'
                    : editingArticle
                      ? 'Perbarui'
                      : 'Buat'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedArticles.length === 0 ? (
        <Card className="glass-strong border-border/50">
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Belum ada artikel</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedArticles.map((article) => (
            <Card 
              key={article.id.toString()}
              className="glass-strong border-border/50 hover:border-primary/50 hover:neon-glow-hover transition-glow group"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {article.image && (
                    <img
                      src={article.image.getDirectURL()}
                      alt={article.title}
                      className="h-24 w-24 rounded-lg object-cover border border-primary/20 group-hover:border-primary/50 transition-smooth"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                      {article.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{article.content}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(Number(article.date) / 1000000, { addSuffix: true, locale: id })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(article)}
                      className="glass border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-glow"
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                      disabled={archiveArticle.isPending}
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
