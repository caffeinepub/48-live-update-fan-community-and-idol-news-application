import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetGroup, useIsCallerAdmin, useUpdateGroup } from '../hooks/useQueries';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, MapPin, Calendar, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import type { Setlist } from '../backend';

export default function GroupDetailPage() {
  const { groupName } = useParams({ from: '/groups/$groupName' });
  const navigate = useNavigate();
  const { data: group, isLoading } = useGetGroup(groupName);
  const { data: isAdmin } = useIsCallerAdmin();
  const updateGroup = useUpdateGroup();

  const [showSetlistDialog, setShowSetlistDialog] = useState(false);
  const [editingSetlistIndex, setEditingSetlistIndex] = useState<number | null>(null);
  const [setlistTitle, setSetlistTitle] = useState('');
  const [setlistTracks, setSetlistTracks] = useState<string[]>(['']);

  const handleAddSetlist = () => {
    setEditingSetlistIndex(null);
    setSetlistTitle('');
    setSetlistTracks(['']);
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
      toast.success('Setlist berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus setlist');
    }
  };

  const handleSaveSetlist = async () => {
    if (!group) return;
    if (!setlistTitle.trim()) {
      toast.error('Judul setlist harus diisi');
      return;
    }

    const validTracks = setlistTracks.filter(track => track.trim() !== '');
    if (validTracks.length === 0) {
      toast.error('Minimal harus ada satu lagu');
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
      toast.success(editingSetlistIndex !== null ? 'Setlist berhasil diperbarui' : 'Setlist berhasil ditambahkan');
      setShowSetlistDialog(false);
    } catch (error) {
      toast.error('Gagal menyimpan setlist');
    }
  };

  const handleAddTrack = () => {
    setSetlistTracks([...setlistTracks, '']);
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
          onClick={() => navigate({ to: '/groups' })}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Card className="glass-card">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">Data grup belum tersedia</p>
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
          onClick={() => navigate({ to: '/groups' })}
          className="mb-6 gap-2 transition-all hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        {/* Group Header */}
        <Card className="glass-card mb-8 animate-glow">
          <CardContent className="p-8">
            <div className="mb-6 flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <h1 className="gradient-text text-5xl font-bold">{group.name}</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-neon-cyan" />
                <div>
                  <p className="text-sm text-muted-foreground">Dibentuk</p>
                  <p className="font-medium">
                    {format(Number(group.formationDate) / 1000000, 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-neon-pink" />
                <div>
                  <p className="text-sm text-muted-foreground">Lokasi</p>
                  <p className="font-medium">{group.baseLocation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-neon-purple" />
                <div>
                  <p className="text-sm text-muted-foreground">Theater</p>
                  <p className="font-medium">{group.theaterLocation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-neon-blue" />
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
          <TabsList className="glass-card grid w-full grid-cols-6">
            <TabsTrigger value="members">Member</TabsTrigger>
            <TabsTrigger value="schedules">Jadwal</TabsTrigger>
            <TabsTrigger value="news">Berita</TabsTrigger>
            <TabsTrigger value="discography">Diskografi</TabsTrigger>
            <TabsTrigger value="setlists">Setlist</TabsTrigger>
            <TabsTrigger value="theater-setlists">Setlist Theater</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="gradient-text mb-6 text-2xl font-bold">Member</h2>
                {group.members.length === 0 ? (
                  <p className="text-center text-muted-foreground">Belum ada data member</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.members.map((member, index) => (
                      <Card key={index} className="glass-card transition-all hover:scale-105">
                        <CardContent className="p-4">
                          <h3 className="mb-1 font-semibold">{member.fullName}</h3>
                          <p className="mb-2 text-sm text-neon-cyan">{member.nickname}</p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-muted-foreground">Generasi:</span> {member.generation}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Tim:</span> {member.team}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Lahir:</span>{' '}
                              {format(Number(member.birthdate) / 1000000, 'dd MMMM yyyy', { locale: id })}
                            </p>
                            {member.bio && <p className="mt-2 text-muted-foreground">{member.bio}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="gradient-text mb-6 text-2xl font-bold">Jadwal & Event</h2>
                {group.schedules.length === 0 ? (
                  <p className="text-center text-muted-foreground">Belum ada jadwal tersedia</p>
                ) : (
                  <div className="space-y-4">
                    {group.schedules.map((schedule, index) => (
                      <Card key={index} className="glass-card transition-all hover:scale-[1.02]">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 p-3">
                              <span className="gradient-text text-2xl font-bold">
                                {format(Number(schedule.date) / 1000000, 'dd', { locale: id })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(Number(schedule.date) / 1000000, 'MMM', { locale: id })}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="mb-1 font-semibold">{schedule.event}</h3>
                              <p className="text-sm text-muted-foreground">{schedule.location}</p>
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
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="gradient-text mb-6 text-2xl font-bold">Berita Grup</h2>
                {group.news.length === 0 ? (
                  <p className="text-center text-muted-foreground">Belum ada berita tersedia</p>
                ) : (
                  <div className="space-y-4">
                    {group.news.map((news) => (
                      <Card key={news.id.toString()} className="glass-card transition-all hover:scale-[1.02]">
                        <CardContent className="p-4">
                          <div className="mb-2 text-sm text-neon-cyan">
                            {format(Number(news.date) / 1000000, 'dd MMMM yyyy', { locale: id })}
                          </div>
                          <h3 className="mb-2 font-semibold">{news.title}</h3>
                          <p className="text-sm text-muted-foreground">{news.content}</p>
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
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="gradient-text mb-6 text-2xl font-bold">Single</h2>
                  {group.discography.singles.length === 0 ? (
                    <p className="text-center text-muted-foreground">Belum ada data single</p>
                  ) : (
                    <div className="space-y-4">
                      {group.discography.singles.map((single, index) => (
                        <Card key={index} className="glass-card transition-all hover:scale-[1.02]">
                          <CardContent className="p-4">
                            <h3 className="mb-1 font-semibold">{single.title}</h3>
                            <p className="mb-3 text-sm text-neon-cyan">
                              {format(Number(single.releaseDate) / 1000000, 'dd MMMM yyyy', { locale: id })}
                            </p>
                            <div className="space-y-1">
                              {single.tracks.map((track, trackIndex) => (
                                <p key={trackIndex} className="text-sm">
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

              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="gradient-text mb-6 text-2xl font-bold">Album</h2>
                  {group.discography.albums.length === 0 ? (
                    <p className="text-center text-muted-foreground">Belum ada data album</p>
                  ) : (
                    <div className="space-y-4">
                      {group.discography.albums.map((album, index) => (
                        <Card key={index} className="glass-card transition-all hover:scale-[1.02]">
                          <CardContent className="p-4">
                            <h3 className="mb-1 font-semibold">{album.title}</h3>
                            <p className="mb-3 text-sm text-neon-cyan">
                              {format(Number(album.releaseDate) / 1000000, 'dd MMMM yyyy', { locale: id })}
                            </p>
                            <div className="space-y-1">
                              {album.tracks.map((track, trackIndex) => (
                                <p key={trackIndex} className="text-sm">
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
            <Card className="glass-card">
              <CardContent className="p-6">
                <h2 className="gradient-text mb-6 text-2xl font-bold">Setlist Konser</h2>
                {group.setlists.length === 0 ? (
                  <p className="text-center text-muted-foreground">Belum ada data setlist</p>
                ) : (
                  <div className="space-y-4">
                    {group.setlists.map((setlist, index) => (
                      <Card key={index} className="glass-card transition-all hover:scale-[1.02]">
                        <CardContent className="p-4">
                          <h3 className="mb-3 font-semibold">{setlist.title}</h3>
                          <div className="space-y-1">
                            {setlist.tracks.map((track, trackIndex) => (
                              <p key={trackIndex} className="text-sm">
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

          <TabsContent value="theater-setlists">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="gradient-text text-2xl font-bold">Setlist Theater</h2>
                  {isAdmin && (
                    <Button
                      onClick={handleAddSetlist}
                      className="gap-2 bg-gradient-to-r from-neon-cyan to-neon-blue transition-all hover:scale-105"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Setlist
                    </Button>
                  )}
                </div>
                {group.setlists.length === 0 ? (
                  <p className="text-center text-muted-foreground">Belum ada setlist theater</p>
                ) : (
                  <div className="space-y-4">
                    {group.setlists.map((setlist, index) => (
                      <Card key={index} className="glass-card transition-all hover:scale-[1.02]">
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <h3 className="gradient-text font-semibold">{setlist.title}</h3>
                            {isAdmin && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSetlist(index)}
                                  className="h-8 w-8 p-0 transition-all hover:scale-110 hover:text-neon-cyan"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteSetlist(index)}
                                  className="h-8 w-8 p-0 transition-all hover:scale-110 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            {setlist.tracks.map((track, trackIndex) => (
                              <p key={trackIndex} className="text-sm">
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
        <DialogContent className="glass-card max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {editingSetlistIndex !== null ? 'Edit Setlist Theater' : 'Tambah Setlist Theater'}
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
                className="glass-input"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Daftar Lagu</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddTrack}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Lagu
                </Button>
              </div>
              <div className="space-y-2">
                {setlistTracks.map((track, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={track}
                      onChange={(e) => handleTrackChange(index, e.target.value)}
                      placeholder={`Lagu ${index + 1}`}
                      className="glass-input"
                    />
                    {setlistTracks.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTrack(index)}
                        className="transition-all hover:scale-110 hover:text-destructive"
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
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveSetlist}
              disabled={updateGroup.isPending}
              className="bg-gradient-to-r from-neon-cyan to-neon-blue"
            >
              {updateGroup.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
