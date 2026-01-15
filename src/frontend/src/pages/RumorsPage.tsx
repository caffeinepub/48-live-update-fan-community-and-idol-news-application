import { useGetUnarchivedRumors } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function RumorsPage() {
  const { data: rumors, isLoading } = useGetUnarchivedRumors();
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const sortedRumors = [...(rumors || [])].sort((a, b) => Number(b.date - a.date));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">48 LIVE RUMOR</h1>
          <p className="mt-2 text-muted-foreground">Rumor dan kabar seputar 48 Group</p>
        </div>

        {sortedRumors.length === 0 ? (
          <Card>
            <CardContent className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">Belum ada rumor tersedia</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedRumors.map((rumor) => (
              <Card
                key={rumor.id.toString()}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate({ to: '/rumors/$rumorId', params: { rumorId: rumor.id.toString() } })}
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge className={getStatusColor(rumor.status)}>{getStatusLabel(rumor.status)}</Badge>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{rumor.title}</h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{rumor.content}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(Number(rumor.date) / 1000000, { addSuffix: true, locale: id })}
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
