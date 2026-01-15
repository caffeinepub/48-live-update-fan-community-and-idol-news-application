import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetRumor, useGetCommentsByContentId, useAddComment } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RumorDetailPage() {
  const { rumorId } = useParams({ from: '/rumors/$rumorId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: rumor, isLoading } = useGetRumor(BigInt(rumorId));
  const { data: comments, isLoading: commentsLoading } = useGetCommentsByContentId(BigInt(rumorId));
  const addComment = useAddComment();
  const [commentText, setCommentText] = useState('');

  const isAuthenticated = !!identity;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirm':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'unconfirm':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
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

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }

    try {
      await addComment.mutateAsync({ contentId: BigInt(rumorId), content: commentText.trim() });
      setCommentText('');
      toast.success('Komentar berhasil ditambahkan');
    } catch (error) {
      toast.error('Gagal menambahkan komentar');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-4 h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!rumor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">Rumor tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedComments = [...(comments || [])].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/rumors' })}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        <article className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8">
              <div className="mb-4 flex items-center gap-3">
                <Badge className={getStatusColor(rumor.status)}>{getStatusLabel(rumor.status)}</Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(Number(rumor.date) / 1000000, { addSuffix: true, locale: id })}
                </div>
              </div>
              <h1 className="mb-6 text-3xl font-bold">{rumor.title}</h1>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{rumor.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Komentar ({sortedComments.length})</h2>
                </div>

                {isAuthenticated ? (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Tulis komentar Anda..."
                      className="mb-3"
                      rows={3}
                    />
                    <Button type="submit" disabled={addComment.isPending}>
                      {addComment.isPending ? 'Mengirim...' : 'Kirim Komentar'}
                    </Button>
                  </form>
                ) : (
                  <div className="mb-6 rounded-lg bg-muted p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Silakan masuk untuk menambahkan komentar
                    </p>
                  </div>
                )}

                <Separator className="mb-6" />

                {commentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : sortedComments.length === 0 ? (
                  <p className="text-center text-muted-foreground">Belum ada komentar</p>
                ) : (
                  <div className="space-y-4">
                    {sortedComments.map((comment) => (
                      <div key={comment.id.toString()} className="rounded-lg bg-muted/50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {comment.author.toString().slice(0, 8)}...
                          </span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(Number(comment.timestamp) / 1000000, { addSuffix: true, locale: id })}
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </article>
      </div>
    </div>
  );
}
