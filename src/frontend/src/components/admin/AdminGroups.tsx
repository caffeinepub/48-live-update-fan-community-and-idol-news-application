import { useState } from 'react';
import { useGetAllGroups, useUpdateGroup, useCreateGroup, useDeleteGroup } from '../../hooks/useQueries';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { toast } from 'sonner';
import { Save, X, Plus, Trash2, Calendar, MapPin, Users as UsersIcon, Music, Newspaper, CalendarDays, PlusCircle } from 'lucide-react';
import type { Group, Member, Schedule, GroupNews, Single, Album, Setlist } from '../../backend';
import { format } from 'date-fns';

export default function AdminGroups() {
  const { data: groups, isLoading } = useGetAllGroups();
  const updateGroup = useUpdateGroup();
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();

  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [editedGroup, setEditedGroup] = useState<Group | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleSelectGroup = (groupName: string) => {
    const group = groups?.find(g => g.name === groupName);
    if (group) {
      setSelectedGroupName(groupName);
      setEditedGroup({ ...group });
      setIsCreatingNew(false);
    }
  };

  const handleCreateNew = () => {
    const newGroup: Group = {
      name: '',
      formationDate: BigInt(Date.now() * 1000000),
      baseLocation: '',
      theaterLocation: '',
      memberCount: BigInt(0),
      members: [],
      schedules: [],
      news: [],
      discography: {
        singles: [],
        albums: [],
      },
      setlists: [],
    };
    setEditedGroup(newGroup);
    setSelectedGroupName('');
    setIsCreatingNew(true);
  };

  const handleSave = async () => {
    if (!editedGroup) return;

    if (!editedGroup.name.trim()) {
      toast.error('Nama grup harus diisi');
      return;
    }

    try {
      if (isCreatingNew) {
        await createGroup.mutateAsync(editedGroup);
        toast.success('Grup berhasil dibuat');
        setIsCreatingNew(false);
        setSelectedGroupName(editedGroup.name);
      } else {
        await updateGroup.mutateAsync(editedGroup);
        toast.success('Perubahan berhasil disimpan');
      }
    } catch (error) {
      toast.error(isCreatingNew ? 'Gagal membuat grup' : 'Gagal menyimpan perubahan');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!editedGroup || !editedGroup.name) return;

    try {
      await deleteGroup.mutateAsync(editedGroup.name);
      toast.success('Grup berhasil dihapus');
      setEditedGroup(null);
      setSelectedGroupName('');
      setIsCreatingNew(false);
    } catch (error) {
      toast.error('Gagal menghapus grup');
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (isCreatingNew) {
      setEditedGroup(null);
      setIsCreatingNew(false);
    } else {
      const group = groups?.find(g => g.name === selectedGroupName);
      if (group) {
        setEditedGroup({ ...group });
      }
    }
  };

  // Member management
  const handleAddMember = () => {
    if (!editedGroup) return;
    const newMember: Member = {
      fullName: '',
      nickname: '',
      birthdate: BigInt(Date.now() * 1000000),
      generation: '',
      team: '',
      bio: '',
    };
    setEditedGroup({
      ...editedGroup,
      members: [...editedGroup.members, newMember],
      memberCount: BigInt(editedGroup.members.length + 1),
    });
  };

  const handleUpdateMember = (index: number, field: keyof Member, value: string | bigint) => {
    if (!editedGroup) return;
    const updatedMembers = [...editedGroup.members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setEditedGroup({ ...editedGroup, members: updatedMembers });
  };

  const handleRemoveMember = (index: number) => {
    if (!editedGroup) return;
    const updatedMembers = editedGroup.members.filter((_, i) => i !== index);
    setEditedGroup({
      ...editedGroup,
      members: updatedMembers,
      memberCount: BigInt(updatedMembers.length),
    });
  };

  // Schedule management
  const handleAddSchedule = () => {
    if (!editedGroup) return;
    const newSchedule: Schedule = {
      date: BigInt(Date.now() * 1000000),
      event: '',
      location: '',
    };
    setEditedGroup({
      ...editedGroup,
      schedules: [...editedGroup.schedules, newSchedule],
    });
  };

  const handleUpdateSchedule = (index: number, field: keyof Schedule, value: string | bigint) => {
    if (!editedGroup) return;
    const updatedSchedules = [...editedGroup.schedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
    setEditedGroup({ ...editedGroup, schedules: updatedSchedules });
  };

  const handleRemoveSchedule = (index: number) => {
    if (!editedGroup) return;
    setEditedGroup({
      ...editedGroup,
      schedules: editedGroup.schedules.filter((_, i) => i !== index),
    });
  };

  // News management
  const handleAddNews = () => {
    if (!editedGroup) return;
    const newNews: GroupNews = {
      id: BigInt(editedGroup.news.length),
      title: '',
      content: '',
      date: BigInt(Date.now() * 1000000),
    };
    setEditedGroup({
      ...editedGroup,
      news: [...editedGroup.news, newNews],
    });
  };

  const handleUpdateNews = (index: number, field: keyof GroupNews, value: string | bigint) => {
    if (!editedGroup) return;
    const updatedNews = [...editedGroup.news];
    updatedNews[index] = { ...updatedNews[index], [field]: value };
    setEditedGroup({ ...editedGroup, news: updatedNews });
  };

  const handleRemoveNews = (index: number) => {
    if (!editedGroup) return;
    setEditedGroup({
      ...editedGroup,
      news: editedGroup.news.filter((_, i) => i !== index),
    });
  };

  // Single management
  const handleAddSingle = () => {
    if (!editedGroup) return;
    const newSingle: Single = {
      title: '',
      releaseDate: BigInt(Date.now() * 1000000),
      tracks: [''],
    };
    setEditedGroup({
      ...editedGroup,
      discography: {
        ...editedGroup.discography,
        singles: [...editedGroup.discography.singles, newSingle],
      },
    });
  };

  const handleUpdateSingle = (index: number, field: keyof Single, value: string | bigint | string[]) => {
    if (!editedGroup) return;
    const updatedSingles = [...editedGroup.discography.singles];
    updatedSingles[index] = { ...updatedSingles[index], [field]: value };
    setEditedGroup({
      ...editedGroup,
      discography: { ...editedGroup.discography, singles: updatedSingles },
    });
  };

  const handleRemoveSingle = (index: number) => {
    if (!editedGroup) return;
    setEditedGroup({
      ...editedGroup,
      discography: {
        ...editedGroup.discography,
        singles: editedGroup.discography.singles.filter((_, i) => i !== index),
      },
    });
  };

  // Album management
  const handleAddAlbum = () => {
    if (!editedGroup) return;
    const newAlbum: Album = {
      title: '',
      releaseDate: BigInt(Date.now() * 1000000),
      tracks: [''],
    };
    setEditedGroup({
      ...editedGroup,
      discography: {
        ...editedGroup.discography,
        albums: [...editedGroup.discography.albums, newAlbum],
      },
    });
  };

  const handleUpdateAlbum = (index: number, field: keyof Album, value: string | bigint | string[]) => {
    if (!editedGroup) return;
    const updatedAlbums = [...editedGroup.discography.albums];
    updatedAlbums[index] = { ...updatedAlbums[index], [field]: value };
    setEditedGroup({
      ...editedGroup,
      discography: { ...editedGroup.discography, albums: updatedAlbums },
    });
  };

  const handleRemoveAlbum = (index: number) => {
    if (!editedGroup) return;
    setEditedGroup({
      ...editedGroup,
      discography: {
        ...editedGroup.discography,
        albums: editedGroup.discography.albums.filter((_, i) => i !== index),
      },
    });
  };

  // Setlist management
  const handleAddSetlist = () => {
    if (!editedGroup) return;
    const newSetlist: Setlist = {
      title: '',
      tracks: [''],
    };
    setEditedGroup({
      ...editedGroup,
      setlists: [...editedGroup.setlists, newSetlist],
    });
  };

  const handleUpdateSetlist = (index: number, field: keyof Setlist, value: string | string[]) => {
    if (!editedGroup) return;
    const updatedSetlists = [...editedGroup.setlists];
    updatedSetlists[index] = { ...updatedSetlists[index], [field]: value };
    setEditedGroup({ ...editedGroup, setlists: updatedSetlists });
  };

  const handleRemoveSetlist = (index: number) => {
    if (!editedGroup) return;
    setEditedGroup({
      ...editedGroup,
      setlists: editedGroup.setlists.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Group Selection and Create */}
      <Card className="glass-strong border-primary/20 hover:neon-glow-hover transition-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="group-select" className="mb-2 block text-lg font-semibold">
                Pilih Grup untuk Diedit
              </Label>
              <Select value={selectedGroupName} onValueChange={handleSelectGroup} disabled={isCreatingNew}>
                <SelectTrigger id="group-select" className="glass-input">
                  <SelectValue placeholder="Pilih grup..." />
                </SelectTrigger>
                <SelectContent className="glass-strong">
                  {groups?.map((group) => (
                    <SelectItem key={group.name} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCreateNew}
                disabled={isCreatingNew}
                className="gap-2 gradient-primary hover:neon-glow-hover transition-glow border-0"
              >
                <PlusCircle className="h-5 w-5" />
                Buat Grup Baru
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editedGroup && (
        <Card className="glass-strong border-primary/20">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {isCreatingNew ? 'Buat Grup Baru' : `Edit ${editedGroup.name}`}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2 glass hover:neon-glow-hover transition-glow"
                >
                  <X className="h-4 w-4" />
                  Batal
                </Button>
                {!isCreatingNew && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="gap-2 hover:neon-glow-hover transition-glow"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus Grup
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-strong border-destructive/50">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">Hapus Grup?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus grup <strong>{editedGroup.name}</strong>? 
                          Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait grup ini 
                          termasuk member, jadwal, berita, diskografi, dan setlist.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="glass">Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={deleteGroup.isPending}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {deleteGroup.isPending ? 'Menghapus...' : 'Ya, Hapus'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button
                  onClick={handleSave}
                  disabled={updateGroup.isPending || createGroup.isPending}
                  className="gap-2 gradient-primary hover:neon-glow-hover transition-glow border-0"
                >
                  <Save className="h-4 w-4" />
                  {updateGroup.isPending || createGroup.isPending 
                    ? 'Menyimpan...' 
                    : isCreatingNew 
                      ? 'Buat Grup' 
                      : 'Simpan Perubahan'}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 glass p-1">
                <TabsTrigger value="basic" className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow">
                  <MapPin className="h-4 w-4 mr-2" />
                  Info Dasar
                </TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Member
                </TabsTrigger>
                <TabsTrigger value="schedules" className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Jadwal
                </TabsTrigger>
                <TabsTrigger value="news" className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow">
                  <Newspaper className="h-4 w-4 mr-2" />
                  Berita
                </TabsTrigger>
                <TabsTrigger value="discography" className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow">
                  <Music className="h-4 w-4 mr-2" />
                  Diskografi
                </TabsTrigger>
                <TabsTrigger value="setlists" className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow">
                  <Music className="h-4 w-4 mr-2" />
                  Setlist
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="group-name">Nama Grup *</Label>
                    <Input
                      id="group-name"
                      value={editedGroup.name}
                      onChange={(e) => setEditedGroup({ ...editedGroup, name: e.target.value })}
                      disabled={!isCreatingNew}
                      placeholder="Contoh: AKB48"
                      className="glass-input"
                    />
                    {isCreatingNew && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Nama grup tidak dapat diubah setelah dibuat
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="formation-date">Tanggal Dibentuk</Label>
                    <Input
                      id="formation-date"
                      type="date"
                      value={format(Number(editedGroup.formationDate) / 1000000, 'yyyy-MM-dd')}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setEditedGroup({
                          ...editedGroup,
                          formationDate: BigInt(date.getTime() * 1000000),
                        });
                      }}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-count">Jumlah Member</Label>
                    <Input
                      id="member-count"
                      type="number"
                      value={Number(editedGroup.memberCount)}
                      onChange={(e) =>
                        setEditedGroup({
                          ...editedGroup,
                          memberCount: BigInt(parseInt(e.target.value) || 0),
                        })
                      }
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="base-location">Lokasi Basis</Label>
                    <Input
                      id="base-location"
                      value={editedGroup.baseLocation}
                      onChange={(e) =>
                        setEditedGroup({ ...editedGroup, baseLocation: e.target.value })
                      }
                      placeholder="Contoh: Tokyo, Jepang"
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="theater-location">Lokasi Theater</Label>
                    <Input
                      id="theater-location"
                      value={editedGroup.theaterLocation}
                      onChange={(e) =>
                        setEditedGroup({ ...editedGroup, theaterLocation: e.target.value })
                      }
                      placeholder="Contoh: AKB48 Theater, Akihabara"
                      className="glass-input"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Daftar Member ({editedGroup.members.length})</h3>
                  <Button onClick={handleAddMember} className="gap-2 gradient-secondary hover:neon-glow-hover transition-glow border-0">
                    <Plus className="h-4 w-4" />
                    Tambah Member
                  </Button>
                </div>
                {editedGroup.members.length === 0 ? (
                  <Card className="glass border-border/50">
                    <CardContent className="p-8 text-center">
                      <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Belum ada member. Klik tombol "Tambah Member" untuk menambahkan.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {editedGroup.members.map((member, index) => (
                      <Card key={index} className="glass border-border/50 hover:border-primary/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold text-primary">Member {index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMember(index)}
                              className="h-8 w-8 p-0 hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <Label>Nama Lengkap</Label>
                              <Input
                                value={member.fullName}
                                onChange={(e) => handleUpdateMember(index, 'fullName', e.target.value)}
                                placeholder="Nama lengkap member"
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Nickname</Label>
                              <Input
                                value={member.nickname}
                                onChange={(e) => handleUpdateMember(index, 'nickname', e.target.value)}
                                placeholder="Nama panggilan"
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Tanggal Lahir</Label>
                              <Input
                                type="date"
                                value={format(Number(member.birthdate) / 1000000, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  handleUpdateMember(index, 'birthdate', BigInt(date.getTime() * 1000000));
                                }}
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Generasi</Label>
                              <Input
                                value={member.generation}
                                onChange={(e) => handleUpdateMember(index, 'generation', e.target.value)}
                                placeholder="Contoh: Gen 1"
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Tim</Label>
                              <Input
                                value={member.team}
                                onChange={(e) => handleUpdateMember(index, 'team', e.target.value)}
                                placeholder="Contoh: Team A"
                                className="glass-input"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Bio</Label>
                              <Input
                                value={member.bio}
                                onChange={(e) => handleUpdateMember(index, 'bio', e.target.value)}
                                placeholder="Biografi singkat member"
                                className="glass-input"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Schedules Tab */}
              <TabsContent value="schedules" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Jadwal & Event ({editedGroup.schedules.length})</h3>
                  <Button onClick={handleAddSchedule} className="gap-2 gradient-secondary hover:neon-glow-hover transition-glow border-0">
                    <Plus className="h-4 w-4" />
                    Tambah Jadwal
                  </Button>
                </div>
                {editedGroup.schedules.length === 0 ? (
                  <Card className="glass border-border/50">
                    <CardContent className="p-8 text-center">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Belum ada jadwal. Klik tombol "Tambah Jadwal" untuk menambahkan.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {editedGroup.schedules.map((schedule, index) => (
                      <Card key={index} className="glass border-border/50 hover:border-primary/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold text-primary">Jadwal {index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveSchedule(index)}
                              className="h-8 w-8 p-0 hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <Label>Tanggal</Label>
                              <Input
                                type="date"
                                value={format(Number(schedule.date) / 1000000, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  handleUpdateSchedule(index, 'date', BigInt(date.getTime() * 1000000));
                                }}
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Event</Label>
                              <Input
                                value={schedule.event}
                                onChange={(e) => handleUpdateSchedule(index, 'event', e.target.value)}
                                placeholder="Nama event"
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Lokasi</Label>
                              <Input
                                value={schedule.location}
                                onChange={(e) => handleUpdateSchedule(index, 'location', e.target.value)}
                                placeholder="Lokasi event"
                                className="glass-input"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* News Tab */}
              <TabsContent value="news" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Berita Grup ({editedGroup.news.length})</h3>
                  <Button onClick={handleAddNews} className="gap-2 gradient-secondary hover:neon-glow-hover transition-glow border-0">
                    <Plus className="h-4 w-4" />
                    Tambah Berita
                  </Button>
                </div>
                {editedGroup.news.length === 0 ? (
                  <Card className="glass border-border/50">
                    <CardContent className="p-8 text-center">
                      <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Belum ada berita. Klik tombol "Tambah Berita" untuk menambahkan.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {editedGroup.news.map((news, index) => (
                      <Card key={index} className="glass border-border/50 hover:border-primary/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold text-primary">Berita {index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveNews(index)}
                              className="h-8 w-8 p-0 hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-3">
                            <div>
                              <Label>Tanggal</Label>
                              <Input
                                type="date"
                                value={format(Number(news.date) / 1000000, 'yyyy-MM-dd')}
                                onChange={(e) => {
                                  const date = new Date(e.target.value);
                                  handleUpdateNews(index, 'date', BigInt(date.getTime() * 1000000));
                                }}
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Judul</Label>
                              <Input
                                value={news.title}
                                onChange={(e) => handleUpdateNews(index, 'title', e.target.value)}
                                placeholder="Judul berita"
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Konten</Label>
                              <Input
                                value={news.content}
                                onChange={(e) => handleUpdateNews(index, 'content', e.target.value)}
                                placeholder="Isi berita"
                                className="glass-input"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Discography Tab */}
              <TabsContent value="discography" className="space-y-6">
                {/* Singles */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Single ({editedGroup.discography.singles.length})</h3>
                    <Button onClick={handleAddSingle} className="gap-2 gradient-secondary hover:neon-glow-hover transition-glow border-0">
                      <Plus className="h-4 w-4" />
                      Tambah Single
                    </Button>
                  </div>
                  {editedGroup.discography.singles.length === 0 ? (
                    <Card className="glass border-border/50">
                      <CardContent className="p-8 text-center">
                        <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Belum ada single. Klik tombol "Tambah Single" untuk menambahkan.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {editedGroup.discography.singles.map((single, index) => (
                        <Card key={index} className="glass border-border/50 hover:border-primary/50 transition-all">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-semibold text-primary">Single {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveSingle(index)}
                                className="h-8 w-8 p-0 hover:text-destructive transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-3">
                              <div>
                                <Label>Judul</Label>
                                <Input
                                  value={single.title}
                                  onChange={(e) => handleUpdateSingle(index, 'title', e.target.value)}
                                  placeholder="Judul single"
                                  className="glass-input"
                                />
                              </div>
                              <div>
                                <Label>Tanggal Rilis</Label>
                                <Input
                                  type="date"
                                  value={format(Number(single.releaseDate) / 1000000, 'yyyy-MM-dd')}
                                  onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    handleUpdateSingle(index, 'releaseDate', BigInt(date.getTime() * 1000000));
                                  }}
                                  className="glass-input"
                                />
                              </div>
                              <div>
                                <Label>Tracklist (satu per baris)</Label>
                                <textarea
                                  value={single.tracks.join('\n')}
                                  onChange={(e) => handleUpdateSingle(index, 'tracks', e.target.value.split('\n').filter(t => t.trim()))}
                                  placeholder="Masukkan judul lagu, satu per baris"
                                  className="glass-input min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Albums */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Album ({editedGroup.discography.albums.length})</h3>
                    <Button onClick={handleAddAlbum} className="gap-2 gradient-secondary hover:neon-glow-hover transition-glow border-0">
                      <Plus className="h-4 w-4" />
                      Tambah Album
                    </Button>
                  </div>
                  {editedGroup.discography.albums.length === 0 ? (
                    <Card className="glass border-border/50">
                      <CardContent className="p-8 text-center">
                        <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Belum ada album. Klik tombol "Tambah Album" untuk menambahkan.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {editedGroup.discography.albums.map((album, index) => (
                        <Card key={index} className="glass border-border/50 hover:border-primary/50 transition-all">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-semibold text-primary">Album {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveAlbum(index)}
                                className="h-8 w-8 p-0 hover:text-destructive transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-3">
                              <div>
                                <Label>Judul</Label>
                                <Input
                                  value={album.title}
                                  onChange={(e) => handleUpdateAlbum(index, 'title', e.target.value)}
                                  placeholder="Judul album"
                                  className="glass-input"
                                />
                              </div>
                              <div>
                                <Label>Tanggal Rilis</Label>
                                <Input
                                  type="date"
                                  value={format(Number(album.releaseDate) / 1000000, 'yyyy-MM-dd')}
                                  onChange={(e) => {
                                    const date = new Date(e.target.value);
                                    handleUpdateAlbum(index, 'releaseDate', BigInt(date.getTime() * 1000000));
                                  }}
                                  className="glass-input"
                                />
                              </div>
                              <div>
                                <Label>Tracklist (satu per baris)</Label>
                                <textarea
                                  value={album.tracks.join('\n')}
                                  onChange={(e) => handleUpdateAlbum(index, 'tracks', e.target.value.split('\n').filter(t => t.trim()))}
                                  placeholder="Masukkan judul lagu, satu per baris"
                                  className="glass-input min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Setlists Tab */}
              <TabsContent value="setlists" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Setlist Theater ({editedGroup.setlists.length})</h3>
                  <Button onClick={handleAddSetlist} className="gap-2 gradient-secondary hover:neon-glow-hover transition-glow border-0">
                    <Plus className="h-4 w-4" />
                    Tambah Setlist
                  </Button>
                </div>
                {editedGroup.setlists.length === 0 ? (
                  <Card className="glass border-border/50">
                    <CardContent className="p-8 text-center">
                      <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Belum ada setlist. Klik tombol "Tambah Setlist" untuk menambahkan.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {editedGroup.setlists.map((setlist, index) => (
                      <Card key={index} className="glass border-border/50 hover:border-primary/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold text-primary">Setlist {index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveSetlist(index)}
                              className="h-8 w-8 p-0 hover:text-destructive transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-3">
                            <div>
                              <Label>Judul Setlist</Label>
                              <Input
                                value={setlist.title}
                                onChange={(e) => handleUpdateSetlist(index, 'title', e.target.value)}
                                placeholder="Nama setlist"
                                className="glass-input"
                              />
                            </div>
                            <div>
                              <Label>Tracklist (satu per baris)</Label>
                              <textarea
                                value={setlist.tracks.join('\n')}
                                onChange={(e) => handleUpdateSetlist(index, 'tracks', e.target.value.split('\n').filter(t => t.trim()))}
                                placeholder="Masukkan judul lagu, satu per baris"
                                className="glass-input min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
