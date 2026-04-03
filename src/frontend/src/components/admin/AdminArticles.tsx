import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Article } from "../../backend";
import {
  useCreateArticle,
  useDeleteArticle,
  useGetUnarchivedArticles,
  useUpdateArticle,
} from "../../hooks/useQueries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";

export default function AdminArticles() {
  const { data: articles, isLoading } = useGetUnarchivedArticles();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const [open, setOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul tidak boleh kosong");
      return;
    }

    if (!content.trim()) {
      toast.error("Konten tidak boleh kosong");
      return;
    }

    try {
      if (editingArticle) {
        await updateArticle.mutateAsync({
          id: editingArticle.id,
          title: title.trim(),
          content: content.trim(),
        });
        toast.success("Artikel berhasil diperbarui");
      } else {
        await createArticle.mutateAsync({
          title: title.trim(),
          content: content.trim(),
        });
        toast.success("Artikel berhasil dibuat");
      }

      setTitle("");
      setContent("");
      setEditingArticle(null);
      setOpen(false);
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (editingArticle
          ? "Gagal memperbarui artikel"
          : "Gagal membuat artikel");
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setContent(article.content);
    setOpen(true);
  };

  const confirmDelete = (id: bigint) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteArticle.mutateAsync(deleteId);
      toast.success("Artikel berhasil dihapus");
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus artikel");
      console.error(error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingArticle(null);
    setTitle("");
    setContent("");
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setTitle("");
    setContent("");
    setOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const sortedArticles = [...(articles || [])].sort((a, b) =>
    Number(b.date - a.date),
  );

  return (
    <div>
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl border-2 border-destructive/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Artikel akan dihapus secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteArticle.isPending}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArticle.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient">Kelola Artikel</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Buat dan kelola artikel berita
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleOpenCreate}
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-smooth"
            >
              <Plus className="h-4 w-4" />
              Buat Artikel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gradient">
                {editingArticle ? "Edit Artikel" : "Buat Artikel Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Judul *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masukkan judul artikel"
                  className="rounded-full border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold">
                  Konten *
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis konten artikel..."
                  rows={10}
                  className="rounded-2xl border-primary/20 focus:border-primary/50"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="rounded-full border-border/50"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createArticle.isPending || updateArticle.isPending}
                  className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-smooth"
                >
                  {createArticle.isPending || updateArticle.isPending
                    ? "Menyimpan..."
                    : editingArticle
                      ? "Perbarui"
                      : "Buat"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedArticles.length === 0 ? (
        <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Belum ada artikel</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedArticles.map((article) => (
            <Card
              key={article.id.toString()}
              className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-smooth group"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-smooth">
                      {article.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {article.content}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(Number(article.date) / 1000000, {
                        addSuffix: true,
                        locale: id,
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(article)}
                      className="rounded-full border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-smooth"
                    >
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(article.id)}
                      disabled={deleteArticle.isPending}
                      className="rounded-full border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 transition-smooth"
                      data-ocid="article.delete_button"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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
