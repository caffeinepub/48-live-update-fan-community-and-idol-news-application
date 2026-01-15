import { useGetUnarchivedRumors, useCreateRumor, useUpdateRumor, useArchiveRumor } from '../../hooks/useQueries';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Status } from '../../backend';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Rumor } from '../../backend';

export default function AdminRumors() {
  const { data: rumors, isLoading } = useGetUnarchivedRumors();
  const createRumor = useCreateRumor();
  const updateRumor = useUpdateRumor();
  const archiveRumor = useArchiveRumor();
  const [open, setOpen] = useState(false);
  const [editingRumor, setEditingRumor] = useState<Rumor | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<Status>(Status.waiting);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirm':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30';
      case 'unconfirm':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
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
      if (editingRumor) {
        await updateRumor.mutateAsync({
          id: editingRumor.id,
          title: title.trim(),
          content: content.trim(),
          status,
        });
        toast.success('Rumor berhasil diperbarui');
      } else {
        await createRumor.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          status,
        });
        toast.success('Rumor berhasil dibuat');
      }

      setTitle('');
      setContent('');
      setStatus(Status.waiting);
      setEditingRumor(null);
      setOpen(false);
    } catch (error: any) {
      const errorMessage = error?.message || (editingRumor ? 'Gagal memperbarui rumor' : 'Gagal membuat rumor');
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleEdit = (rumor: Rumor) => {
    setEditingRumor(rumor);
    setTitle(rumor.title);
    setContent(rumor.content);
    setStatus(rumor.status);
    setOpen(true);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Yakin ingin menghapus rumor ini?')) return;

    try {
      await archiveRumor.mutateAsync(id);
      toast.success('Rumor berhasil dihapus');
    } catch (error: any) {
      toast.error(error?.message || 'Gagal menghapus rumor');
      console.error(error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRumor(null);
    setTitle('');
    setContent('');
    setStatus(Status.waiting);
  };

  const handleOpenCreate = () => {
    setEditingRumor(null);
    setTitle('');
    setContent('');
    setStatus(Status.waiting);
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

  const sortedRumors = [...(rumors || [])].sort((a, b) => Number(b.date - a.date));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Kelola Rumor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Buat dan kelola rumor dengan status</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleOpenCreate}
              className="gap-2 gradient-secondary hover:neon-glow-hover transition-glow"
            >
              <Plus className="h-4 w-4" />
              Buat Rumor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl glass-strong border-primary/20">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {editingRumor ? 'Edit Rumor' : 'Buat Rumor Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Judul *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul rumor"
                  className="glass border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-base font-semibold">Status *</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
                  <SelectTrigger className="glass border-primary/20 focus:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-primary/20">
                    <SelectItem value={Status.waiting}>Menunggu</SelectItem>
                    <SelectItem value={Status.confirm}>Terkonfirmasi</SelectItem>
                    <SelectItem value={Status.unconfirm}>Tidak Terkonfirmasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold">Konten *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis konten rumor..."
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
                  disabled={createRumor.isPending || updateRumor.isPending}
                  className="gradient-secondary hover:neon-glow-hover transition-glow"
                >
                  {createRumor.isPending || updateRumor.isPending
                    ? 'Menyimpan...'
                    : editingRumor
                      ? 'Perbarui'
                      : 'Buat'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedRumors.length === 0 ? (
        <Card className="glass-strong border-border/50">
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Belum ada rumor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedRumors.map((rumor) => (
            <Card 
              key={rumor.id.toString()}
              className="glass-strong border-border/50 hover:border-primary/50 hover:neon-glow-hover transition-glow group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge className={`${getStatusColor(rumor.status)} neon-glow`}>
                        {getStatusLabel(rumor.status)}
                      </Badge>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                      {rumor.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{rumor.content}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(Number(rumor.date) / 1000000, { addSuffix: true, locale: id })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(rumor)}
                      className="glass border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-glow"
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rumor.id)}
                      disabled={archiveRumor.isPending}
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
