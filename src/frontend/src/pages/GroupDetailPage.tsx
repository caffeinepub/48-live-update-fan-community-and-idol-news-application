import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Edit,
  ExternalLink,
  Globe,
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

// Website resmi masing-masing grup 48
const GROUP_OFFICIAL_WEBSITES: Record<string, { url: string; label: string }> =
  {
    AKB48: { url: "https://www.akb48.co.jp", label: "akb48.co.jp" },
    SKE48: { url: "https://ske48.co.jp", label: "ske48.co.jp" },
    NMB48: { url: "https://www.nmb48.com", label: "nmb48.com" },
    HKT48: { url: "https://hkt48.jp", label: "hkt48.jp" },
    NGT48: { url: "https://ngt48.jp", label: "ngt48.jp" },
    STU48: { url: "https://stu48.com", label: "stu48.com" },
    JKT48: { url: "https://www.jkt48.com", label: "jkt48.com" },
    BNK48: { url: "https://www.bnk48.com", label: "bnk48.com" },
    MNL48: { url: "https://www.mnl48.com", label: "mnl48.com" },
    CGM48: { url: "https://www.cgm48.com", label: "cgm48.com" },
    KLP48: { url: "https://www.klp48.com", label: "klp48.com" },
    TSH48: { url: "https://www.tsh48.com", label: "tsh48.com" },
    TPE48: { url: "https://www.tpe48.com", label: "tpe48.com" },
  };

// Sosial media resmi per grup
const GROUP_SOCIAL_MEDIA: Record<string, { platform: string; url: string }[]> =
  {
    AKB48: [
      { platform: "Twitter/X", url: "https://twitter.com/AKB48" },
      { platform: "Instagram", url: "https://www.instagram.com/akb48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@akb48" },
    ],
    SKE48: [
      { platform: "Twitter/X", url: "https://twitter.com/SKE48_official" },
      { platform: "Instagram", url: "https://www.instagram.com/ske48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@ske48" },
    ],
    NMB48: [
      { platform: "Twitter/X", url: "https://twitter.com/nmb48_official" },
      { platform: "Instagram", url: "https://www.instagram.com/nmb48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@nmb48" },
    ],
    HKT48: [
      { platform: "Twitter/X", url: "https://twitter.com/hkt48_official" },
      { platform: "Instagram", url: "https://www.instagram.com/hkt48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@hkt48" },
    ],
    NGT48: [
      { platform: "Twitter/X", url: "https://twitter.com/NGT48_official" },
      { platform: "YouTube", url: "https://www.youtube.com/@NGT48" },
    ],
    STU48: [
      { platform: "Twitter/X", url: "https://twitter.com/STU48_official" },
      { platform: "Instagram", url: "https://www.instagram.com/stu48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@stu48" },
    ],
    JKT48: [
      { platform: "Twitter/X", url: "https://twitter.com/JKT48" },
      { platform: "Instagram", url: "https://www.instagram.com/jkt48" },
      { platform: "YouTube", url: "https://www.youtube.com/@JKT48" },
      { platform: "TikTok", url: "https://www.tiktok.com/@jkt48official" },
    ],
    BNK48: [
      { platform: "Twitter/X", url: "https://twitter.com/BNK48" },
      { platform: "Instagram", url: "https://www.instagram.com/bnk48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@BNK48" },
      { platform: "TikTok", url: "https://www.tiktok.com/@bnk48official" },
    ],
    MNL48: [
      { platform: "Twitter/X", url: "https://twitter.com/MNL48" },
      { platform: "Instagram", url: "https://www.instagram.com/mnl48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@MNL48" },
    ],
    CGM48: [
      { platform: "Instagram", url: "https://www.instagram.com/cgm48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@CGM48" },
      { platform: "TikTok", url: "https://www.tiktok.com/@cgm48official" },
    ],
    KLP48: [
      { platform: "Instagram", url: "https://www.instagram.com/klp48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@KLP48" },
    ],
    TSH48: [
      { platform: "Instagram", url: "https://www.instagram.com/tsh48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@TSH48" },
    ],
    TPE48: [
      { platform: "Instagram", url: "https://www.instagram.com/tpe48official" },
      { platform: "YouTube", url: "https://www.youtube.com/@TPE48" },
    ],
  };

function isTraineeTeam(teamName: string): boolean {
  const lower = teamName.toLowerCase();
  return lower.includes("trainee") || lower.includes("kenkyuusei");
}

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

  // Group members dynamically by their actual team field value
  const teamGroups = useMemo(() => {
    if (!group) return [];

    const grouped: Record<string, Member[]> = {};
    for (const member of group.members) {
      const teamKey = member.team.trim() || "Tanpa Tim";
      if (!grouped[teamKey]) grouped[teamKey] = [];
      grouped[teamKey].push(member);
    }

    // Sort members alphabetically within each team
    for (const teamKey of Object.keys(grouped)) {
      grouped[teamKey].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, "id"),
      );
    }

    // Sort team names: non-trainee teams first (alphabetical), trainee/kenkyuusei last
    const sortedTeamNames = Object.keys(grouped).sort((a, b) => {
      const aIsTrainee = isTraineeTeam(a);
      const bIsTrainee = isTraineeTeam(b);
      if (aIsTrainee && !bIsTrainee) return 1;
      if (!aIsTrainee && bIsTrainee) return -1;
      return a.localeCompare(b, "id");
    });

    return sortedTeamNames.map((teamName) => ({
      teamName,
      members: grouped[teamName],
      isTrainee: isTraineeTeam(teamName),
    }));
  }, [group]);

  const officialSite = group ? GROUP_OFFICIAL_WEBSITES[group.name] : null;
  const socialMedia = group ? GROUP_SOCIAL_MEDIA[group.name] || [] : [];

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
        <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg">
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
    <div className="min-h-screen">
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
        <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg mb-8">
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
          <TabsList className="rounded-2xl border border-border bg-card grid w-full grid-cols-6">
            <TabsTrigger
              value="members"
              className="rounded-xl text-xs sm:text-sm"
            >
              Member
            </TabsTrigger>
            <TabsTrigger
              value="schedules"
              className="rounded-xl text-xs sm:text-sm"
            >
              Jadwal
            </TabsTrigger>
            <TabsTrigger value="news" className="rounded-xl text-xs sm:text-sm">
              Berita
            </TabsTrigger>
            <TabsTrigger
              value="discography"
              className="rounded-xl text-xs sm:text-sm"
            >
              Diskografi
            </TabsTrigger>
            <TabsTrigger
              value="setlists"
              className="rounded-xl text-xs sm:text-sm"
            >
              Setlist
            </TabsTrigger>
            <TabsTrigger
              value="official"
              className="rounded-xl text-xs sm:text-sm"
            >
              Website
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <div className="space-y-8">
              {teamGroups.length > 0 ? (
                teamGroups.map(({ teamName, members, isTrainee }) => (
                  <div key={teamName}>
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-2xl font-bold text-gradient">
                        {teamName}
                      </h2>
                      <Badge
                        className={
                          isTrainee
                            ? "bg-accent/20 text-accent border-accent/30 rounded-full text-xs"
                            : "bg-primary/20 text-primary border-primary/30 rounded-full text-xs"
                        }
                      >
                        {members.length} member
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {members.map((member, index) => (
                        <Card
                          // biome-ignore lint/suspicious/noArrayIndexKey: ordered list uses index as key
                          key={index}
                          className={`rounded-2xl border-2 ${
                            isTrainee ? "border-accent/20" : "border-primary/20"
                          } bg-card shadow-lg hover:shadow-xl transition-smooth`}
                        >
                          <CardContent className="p-6">
                            <h3 className="mb-1 text-lg font-bold text-foreground">
                              {member.fullName}
                            </h3>
                            <p
                              className={`mb-3 text-sm font-medium ${
                                isTrainee ? "text-accent" : "text-primary"
                              }`}
                            >
                              {member.nickname}
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    isTrainee
                                      ? "bg-accent/20 text-accent border-accent/30 rounded-full"
                                      : "bg-primary/20 text-primary border-primary/30 rounded-full"
                                  }
                                >
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
                ))
              ) : (
                <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg">
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
            <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg">
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
                        className="rounded-2xl border-2 border-accent/20 bg-card shadow-lg hover:shadow-xl transition-smooth"
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
            <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg">
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
                        className="rounded-2xl border-2 border-primary/20 bg-card shadow-lg hover:shadow-xl transition-smooth"
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
              <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg">
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
                          className="rounded-2xl border-2 border-accent/20 bg-card shadow-lg hover:shadow-xl transition-smooth"
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

              <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg">
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
                          className="rounded-2xl border-2 border-accent/20 bg-card shadow-lg hover:shadow-xl transition-smooth"
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
            <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gradient">
                    Setlist Theater
                  </h2>
                  {isAdmin && (
                    <Button
                      onClick={handleAddSetlist}
                      className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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
                        className="rounded-2xl border-2 border-accent/20 bg-card shadow-lg hover:shadow-xl transition-smooth"
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

          {/* Tab Website Resmi */}
          <TabsContent value="official">
            <div className="space-y-6">
              {/* Website Resmi */}
              <Card className="rounded-3xl border-2 border-primary/20 bg-card shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gradient">
                      Website Resmi {group.name}
                    </h2>
                  </div>
                  {officialSite ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Kunjungi website resmi {group.name} untuk informasi
                        terbaru mengenai jadwal, member, single, album, dan
                        konten eksklusif lainnya.
                      </p>
                      <a
                        href={officialSite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-smooth shadow-lg"
                      >
                        <Globe className="h-5 w-5" />
                        <span>{officialSite.label}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg text-muted-foreground">
                        Website resmi untuk {group.name} belum tersedia
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Informasi akan segera diperbarui
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Media Sosial Resmi */}
              {socialMedia.length > 0 && (
                <Card className="rounded-3xl border-2 border-accent/20 bg-card shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-accent/10">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                      <h2 className="text-2xl font-bold text-gradient">
                        Media Sosial Resmi
                      </h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {socialMedia.map((social) => (
                        <a
                          key={social.platform}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border-2 border-accent/20 bg-card hover:bg-accent/10 hover:border-accent/40 transition-smooth group"
                        >
                          <span className="font-semibold text-foreground group-hover:text-accent transition-smooth">
                            {social.platform}
                          </span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-smooth" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Banner */}
              <Card className="rounded-2xl border border-border bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Seluruh link di atas mengarah ke website dan media sosial
                    resmi {group.name}. Pastikan kamu mengakses informasi dari
                    sumber resmi untuk menghindari informasi yang tidak akurat.
                  </p>
                </CardContent>
              </Card>
            </div>
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
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updateGroup.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
