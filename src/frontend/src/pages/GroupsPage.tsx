import { useNavigate, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useGetAllGroups } from "../hooks/useQueries";

export default function GroupsPage() {
  const { data: groups, isLoading } = useGetAllGroups();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { q?: string };
  const [localSearch, setLocalSearch] = useState(searchParams.q || "");

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!localSearch.trim()) return groups;

    const query = localSearch.toLowerCase();
    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.baseLocation.toLowerCase().includes(query) ||
        group.theaterLocation.toLowerCase().includes(query),
    );
  }, [groups, localSearch]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gradient mb-4">48Group</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Informasi lengkap tentang grup-grup 48
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari grup..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-12 rounded-full border-2 border-primary/20 focus:border-primary h-12"
            />
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {localSearch
                  ? "Tidak ada grup yang cocok dengan pencarian"
                  : "Belum ada grup yang tersedia"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Card
                key={group.name}
                className="group cursor-pointer rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth overflow-hidden"
                onClick={() =>
                  navigate({
                    to: "/groups/$groupName",
                    params: { groupName: group.name },
                  })
                }
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(var(--primary)/20%),transparent_70%)]" />
                  <h2 className="text-4xl font-bold text-gradient relative z-10 group-hover:scale-110 transition-smooth">
                    {group.name}
                  </h2>
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">
                      {Number(group.memberCount)} Member
                    </span>
                  </div>
                  {group.baseLocation && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-xl bg-accent/10">
                        <MapPin className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-muted-foreground">
                        {group.baseLocation}
                      </span>
                    </div>
                  )}
                  {group.formationDate && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-xl bg-secondary/10">
                        <Calendar className="h-5 w-5 text-secondary" />
                      </div>
                      <span className="text-muted-foreground">
                        {format(Number(group.formationDate) / 1000000, "yyyy", {
                          locale: id,
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
