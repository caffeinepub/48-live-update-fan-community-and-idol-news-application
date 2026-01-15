import { useGetAllGroups } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Users } from 'lucide-react';

const GROUP_NAMES = [
  'AKB48',
  'SKE48',
  'NMB48',
  'HKT48',
  'NGT48',
  'STU48',
  'JKT48',
  'BNK48',
  'MNL48',
  'CGM48',
  'KLP48',
  'TSH48',
  'AKB48 Team TP',
];

export default function GroupsPage() {
  const { data: groups, isLoading } = useGetAllGroups();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">48 Groups</h1>
          <p className="mt-2 text-muted-foreground">Informasi lengkap tentang grup-grup 48</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GROUP_NAMES.map((groupName) => {
            const group = groups?.find((g) => g.name === groupName);
            return (
              <Card
                key={groupName}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate({ to: '/groups/$groupName', params: { groupName } })}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                    <h2 className="text-3xl font-bold text-primary">{groupName}</h2>
                  </div>
                  {group ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{Number(group.memberCount)} Member</span>
                      </div>
                      <p className="text-muted-foreground">{group.baseLocation}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Klik untuk melihat detail</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
