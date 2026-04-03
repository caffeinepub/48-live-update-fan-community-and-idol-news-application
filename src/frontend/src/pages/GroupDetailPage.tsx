import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Edit,
  MapPin,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Member, Setlist } from "../backend";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  useGetGroup,
  useIsCallerAdmin,
  useUpdateGroup,
} from "../hooks/useQueries";

export default function GroupDetailPage() {
  const { groupName } = useParams({ from: "/groups/$groupName" });
  const navigate = useNavigate();
  const { data: group, isLoading } = useGetGroup(groupName);
  const { data: isAdmin } = useIsCallerAdmin();
  const updateGroup = useUpdateGroup();

  const [showSetlistDialog, setShowSetlistDialog] = useState(false);
  const [editingSetlistIndex, setEditingSetlistIndex] = useState<number | null>(
    null,
  );
  const [setlistTitle, setSetlistTitle] = useState("");
  const [setlistTracks, setSetlistTracks] = useState<string[]>([""]);

  // Sort members alphabetically by full name and separate by team
  const sortedMembers = useMemo(() => {
    if (!group) return { teamMembers: [], trainees: [] };

    const teamMembers = group.members
      .filter((m) => !m.team.toLowerCase().includes("trainee"))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "id"));

    const trainees = group.members
      .filter((m) => m.team.toLowerCase().includes("trainee"))
      .sort((a, b) => a.fullName.localeCompare(b.fullName, "id"));

    return { teamMembers, trainees };
  }, [group]);

  const handleAddSetlist = () => {
    setEditingSetlistIndex(null);
    setSetlistTitle("");
    setSetlistTracks([""]);
    setShowSetlistDialog(true);
  };

  const handleEditSetlist = (index: number) => {
    if (!group) return;
    const setlist = group.setlists[index];
    setEditingSetlistIndex(index);
    setSetlistTitle(setlist.title);
    setSetlistTracks([...setlist.tracks]);
    setShowSetlistDialog(true);
  };

  const handleDeleteSetlist = async (index: number) => {
    if (!group) return;

    const updatedSetlists = group.setlists.filter((_, i) => i !== index);

    try {
      await updateGroup.mutateAsync({
        ...group,
        setlists: updatedSetlists,
      });
      toast.success("Setlist berhasil dihapus");
    } catch (_error) {
      toast.error("Gagal menghapus setlist");
    }
  };

  const handleSaveSetlist = async () => {
    if (!group) return;
    if (!setlistTitle.trim()) {
      toast.error("Judul setlist harus diisi");
      return;
    }

    const validTracks = setlistTracks.filter((track) => track.trim() !== "");
    if (validTracks.length === 0) {
      toast.error("Minimal harus ada satu lagu");
      return;
    }

    const newSetlist: Setlist = {
      title: setlistTitle,
      tracks: validTracks,
    };

    let updatedSetlists: Setlist[];
    if (editingSetlistIndex !== null) {
      updatedSetlists = [...group.setlists];
      updatedSetlists[editingSetlistIndex] = newSetlist;
    } else {
      updatedSetlists = [...group.setlists, newSetlist];
    }

    try {
      await updateGroup.mutateAsync({
        ...group,
        setlists: updatedSetlists,
      });
      toast.success(
        editingSetlistIndex !== null
          ? "Setlist berhasil diperbarui"
          : "Setlist berhasil ditambahkan",
      );
      setShowSetlistDialog(false);
    } catch (_error) {
      toast.error("Gagal menyimpan setlist");
    }
  };

  const handleAddTrack = () => {
    setSetlistTracks([...setlistTracks, ""]);
  };

  const handleRemoveTrack = (index: number) => {
    setSetlistTracks(setlistTracks.filter((_, i) => i !== index));
  };

  const handleTrackChange = (index: number, value: string) => {
    const updated = [...setlistTracks];
    updated[index] = value;
    setSetlistTracks(updated);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-8 h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/groups" })}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Data grup belum tersedia
              </p>
              <p className="text-sm text-muted-foreground">
                Informasi untuk {groupName} akan segera ditambahkan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/groups" })}
          className="mb-6 gap-2 transition-all hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        {/* Group Header */}
        <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="mb-6 flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
              <h1 className="text-5xl font-bold text-gradient">{group.name}</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tanggal Pembentukan
                  </p>
                  <p className="font-medium">
                    {format(
                      Number(group.formationDate) / 1000000,
                      "dd MMMM yyyy",
                      { locale: id },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lokasi Base</p>
                  <p className="font-medium">{group.baseLocation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/10">
                  <MapPin className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Lokasi Theater
                  </p>
                  <p className="font-medium">{group.theaterLocation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jumlah Member</p>
                  <p className="font-medium">{Number(group.memberCount)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 grid w-full grid-cols-5">
            <TabsTrigger value="members" className="rounded-xl">
              Member
            </TabsTrigger>
            <TabsTrigger value="schedules" className="rounded-xl">
              Jadwal
            </TabsTrigger>
            <TabsTrigger value="news" className="rounded-xl">
              Berita
            </TabsTrigger>
            <TabsTrigger value="discography" className="rounded-xl">
              Diskografi
            </TabsTrigger>
            <TabsTrigger value="setlists" className="rounded-xl">
              Setlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <div className="space-y-8">
              {/* Team Members */}
              {sortedMembers.teamMembers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gradient mb-6">
                    Member Team
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedMembers.teamMembers.map((member, index) => (
                      <Card
                        // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                        key={index}
                        className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                      >
                        <CardContent className="p-6">
                          <h3 className="mb-1 text-lg font-bold text-foreground">
                            {member.fullName}
                          </h3>
                          <p className="mb-3 text-sm text-primary font-medium">
                            {member.nickname}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full">
                                {member.team}
                              </Badge>
                            </div>
                            <p>
                              <span className="text-muted-foreground">
                                Generasi:
                              </span>{" "}
                              {member.generation}
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Lahir:
                              </span>{" "}
                              {format(
                                Number(member.birthdate) / 1000000,
                                "dd MMMM yyyy",
                                { locale: id },
                              )}
                            </p>
                            {member.bio && (
                              <p className="mt-3 text-muted-foreground">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Trainees */}
              {sortedMembers.trainees.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gradient mb-6">
                    Member Trainee
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedMembers.trainees.map((member, index) => (
                      <Card
                        // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                        key={index}
                        className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                      >
                        <CardContent className="p-6">
                          <h3 className="mb-1 text-lg font-bold text-foreground">
                            {member.fullName}
                          </h3>
                          <p className="mb-3 text-sm text-accent font-medium">
                            {member.nickname}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-accent/20 text-accent border-accent/30 rounded-full">
                                {member.team}
                              </Badge>
                            </div>
                            <p>
                              <span className="text-muted-foreground">
                                Generasi:
                              </span>{" "}
                              {member.generation}
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Lahir:
                              </span>{" "}
                              {format(
                                Number(member.birthdate) / 1000000,
                                "dd MMMM yyyy",
                                { locale: id },
                              )}
                            </p>
                            {member.bio && (
                              <p className="mt-3 text-muted-foreground">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {group.members.length === 0 && (
                <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                      Belum ada data member
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedules">
            <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gradient mb-6">
                  Jadwal & Event
                </h2>
                {group.schedules.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                      Belum ada jadwal tersedia
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {group.schedules.map((schedule, index) => (
                      <Card
                        // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                        key={index}
                        className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-3 min-w-[80px]">
                              <span className="text-2xl font-bold text-gradient">
                                {format(Number(schedule.date) / 1000000, "dd", {
                                  locale: id,
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  Number(schedule.date) / 1000000,
                                  "MMM yyyy",
                                  { locale: id },
                                )}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="mb-1 font-semibold text-foreground">
                                {schedule.event}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {schedule.location}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gradient mb-6">
                  Berita Grup
                </h2>
                {group.news.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">
                      Belum ada berita tersedia
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {group.news.map((news) => (
                      <Card
                        key={news.id.toString()}
                        className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                      >
                        <CardContent className="p-4">
                          <div className="mb-2 text-sm text-primary font-medium">
                            {format(
                              Number(news.date) / 1000000,
                              "dd MMMM yyyy",
                              { locale: id },
                            )}
                          </div>
                          <h3 className="mb-2 font-semibold text-foreground">
                            {news.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {news.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discography">
            <div className="space-y-6">
              <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gradient mb-6">
                    Single
                  </h2>
                  {group.discography.singles.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Belum ada data single
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {group.discography.singles.map((single, index) => (
                        <Card
                          // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                          key={index}
                          className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                        >
                          <CardContent className="p-4">
                            <h3 className="mb-1 font-semibold text-foreground">
                              {single.title}
                            </h3>
                            <p className="mb-3 text-sm text-primary font-medium">
                              {format(
                                Number(single.releaseDate) / 1000000,
                                "dd MMMM yyyy",
                                { locale: id },
                              )}
                            </p>
                            <div className="space-y-1">
                              {single.tracks.map((track, trackIndex) => (
                                <p
                                  // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                                  key={trackIndex}
                                  className="text-sm text-muted-foreground"
                                >
                                  {trackIndex + 1}. {track}
                                </p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gradient mb-6">
                    Album
                  </h2>
                  {group.discography.albums.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Belum ada data album
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {group.discography.albums.map((album, index) => (
                        <Card
                          // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                          key={index}
                          className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                        >
                          <CardContent className="p-4">
                            <h3 className="mb-1 font-semibold text-foreground">
                              {album.title}
                            </h3>
                            <p className="mb-3 text-sm text-primary font-medium">
                              {format(
                                Number(album.releaseDate) / 1000000,
                                "dd MMMM yyyy",
                                { locale: id },
                              )}
                            </p>
                            <div className="space-y-1">
                              {album.tracks.map((track, trackIndex) => (
                                <p
                                  // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                                  key={trackIndex}
                                  className="text-sm text-muted-foreground"
                                >
                                  {trackIndex + 1}. {track}
                                </p>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setlists">
            <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gradient">
                    Setlist Theater
                  </h2>
                  {isAdmin && (
                    <Button
                      onClick={handleAddSetlist}
                      className="gap-2 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Setlist
                    </Button>
                  )}
                </div>
                {group.setlists.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">
                      Belum ada setlist theater
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {group.setlists.map((setlist, index) => (
                      <Card
                        // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                        key={index}
                        className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                      >
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <h3 className="text-lg font-bold text-gradient">
                              {setlist.title}
                            </h3>
                            {isAdmin && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSetlist(index)}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSetlist(index)}
                                  className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            {setlist.tracks.map((track, trackIndex) => (
                              <p
                                // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                                key={trackIndex}
                                className="text-sm text-muted-foreground"
                              >
                                {trackIndex + 1}. {track}
                              </p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Setlist Dialog */}
      <Dialog open={showSetlistDialog} onOpenChange={setShowSetlistDialog}>
        <DialogContent className="rounded-3xl border-2 border-primary/20 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient">
              {editingSetlistIndex !== null
                ? "Edit Setlist Theater"
                : "Tambah Setlist Theater"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="setlist-title">Judul Setlist</Label>
              <Input
                id="setlist-title"
                value={setlistTitle}
                onChange={(e) => setSetlistTitle(e.target.value)}
                placeholder="Contoh: Team K 6th Stage"
                className="rounded-xl border-2 border-primary/20"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Daftar Lagu</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddTrack}
                  className="gap-2 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Lagu
                </Button>
              </div>
              <div className="space-y-2">
                {setlistTracks.map((track, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                  <div key={index} className="flex gap-2">
                    <Input
                      value={track}
                      onChange={(e) => handleTrackChange(index, e.target.value)}
                      placeholder={`Lagu ${index + 1}`}
                      className="rounded-xl border-2 border-primary/20"
                    />
                    {setlistTracks.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTrack(index)}
                        className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSetlistDialog(false)}
              className="rounded-full"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveSetlist}
              disabled={updateGroup.isPending}
              className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {updateGroup.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
