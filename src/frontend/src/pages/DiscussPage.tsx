import { useNavigate, useSearch } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, MessageSquare, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Textarea } from "../components/ui/textarea";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateDiscussion,
  useGetUnarchivedDiscussions,
  useIsCallerAdmin,
} from "../hooks/useQueries";

export default function DiscussPage() {
  const { data: discussions, isLoading } = useGetUnarchivedDiscussions();
  const { identity } = useInternetIdentity();
  useIsCallerAdmin();
  const createDiscussion = useCreateDiscussion();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [localSearch, setLocalSearch] = useState(searchParams.q || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
  });

  const isAuthenticated = !!identity;

  const filteredDiscussions = useMemo(() => {
    if (!discussions) return [];
    const sorted = [...discussions].sort((a, b) =>
      Number(b.timestamp - a.timestamp),
    );
    if (!localSearch.trim()) return sorted;

    const query = localSearch.toLowerCase();
    return sorted.filter(
      (discussion) =>
        discussion.title.toLowerCase().includes(query) ||
        discussion.content.toLowerCase().includes(query) ||
        discussion.category.toLowerCase().includes(query),
    );
  }, [discussions, localSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.category ||
      !formData.content.trim()
    ) {
      toast.error("Semua field harus diisi");
      return;
    }

    try {
      await createDiscussion.mutateAsync({
        title: formData.title,
        category: formData.category,
        content: formData.content,
      });
      toast.success("Diskusi berhasil dibuat");
      setDialogOpen(false);
      setFormData({ title: "", category: "", content: "" });
    } catch (_error) {
      toast.error("Gagal membuat diskusi");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64 rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-5xl font-bold text-gradient">
              48 LIVE DISCUSS
            </h1>
            {isAuthenticated && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Plus className="h-5 w-5" />
                    Buat Diskusi
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-2 border-primary/20">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gradient">
                      Buat Diskusi Baru
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="discuss-title"
                        className="text-sm font-medium mb-2 block"
                      >
                        Judul
                      </label>
                      <Input
                        id="discuss-title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Masukkan judul diskusi"
                        className="rounded-xl border-2 border-primary/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="discuss-category"
                        className="text-sm font-medium mb-2 block"
                      >
                        Kategori
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl border-2 border-primary/20">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Umum">Umum</SelectItem>
                          <SelectItem value="Member">Member</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                          <SelectItem value="Musik">Musik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        htmlFor="discuss-content"
                        className="text-sm font-medium mb-2 block"
                      >
                        Konten
                      </label>
                      <Textarea
                        id="discuss-content"
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="Tulis diskusi Anda..."
                        rows={6}
                        className="rounded-xl border-2 border-primary/20"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="flex-1 rounded-full border-2 border-primary/20"
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        disabled={createDiscussion.isPending}
                        className="flex-1 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        {createDiscussion.isPending
                          ? "Membuat..."
                          : "Buat Diskusi"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Forum diskusi penggemar 48 Group
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari diskusi..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-12 rounded-full border-2 border-secondary/20 focus:border-secondary h-12"
            />
          </div>
        </div>

        {filteredDiscussions.length === 0 ? (
          <Card className="rounded-3xl border-2 border-secondary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
            <CardContent className="flex h-64 flex-col items-center justify-center gap-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {localSearch
                  ? "Tidak ada diskusi yang cocok dengan pencarian"
                  : "Belum ada diskusi tersedia"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <Card
                key={discussion.id.toString()}
                className="cursor-pointer rounded-3xl border-2 border-secondary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth group"
                onClick={() =>
                  navigate({
                    to: "/discuss/$discussionId",
                    params: { discussionId: discussion.id.toString() },
                  })
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-3">
                        <Badge className="bg-secondary/20 text-secondary border-secondary/30 rounded-full">
                          {discussion.category}
                        </Badge>
                      </div>
                      <h3 className="mb-2 text-xl font-bold group-hover:text-primary transition-smooth">
                        {discussion.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                        {discussion.content}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(
                          Number(discussion.timestamp) / 1000000,
                          { addSuffix: true, locale: id },
                        )}
                      </div>
                    </div>
                    <MessageSquare className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-smooth" />
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
