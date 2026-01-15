import { useIsCallerAdmin, useGetUnarchivedArticles, useGetUnarchivedRumors, useGetUnarchivedDiscussions, useGetAllGroups, useGetAllTrending } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import AdminArticles from '../components/admin/AdminArticles';
import AdminRumors from '../components/admin/AdminRumors';
import AdminDiscussions from '../components/admin/AdminDiscussions';
import AdminTrending from '../components/admin/AdminTrending';
import AdminGroups from '../components/admin/AdminGroups';
import { Shield, Newspaper, Radio, MessageSquare, Users, TrendingUp, Plus, BarChart3, Sparkles, Settings } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const { data: articles } = useGetUnarchivedArticles();
  const { data: rumors } = useGetUnarchivedRumors();
  const { data: discussions } = useGetUnarchivedDiscussions();
  const { data: groups } = useGetAllGroups();
  const { data: trending } = useGetAllTrending();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: '/' });
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-8 h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const stats = [
    {
      title: 'Total Artikel',
      value: articles?.length || 0,
      icon: Newspaper,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Total Rumor',
      value: rumors?.length || 0,
      icon: Radio,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Total Diskusi',
      value: discussions?.length || 0,
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      title: 'Total Groups',
      value: groups?.length || 0,
      icon: Users,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    },
    {
      title: 'Trending Items',
      value: trending?.length || 0,
      icon: TrendingUp,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10',
      iconColor: 'text-pink-500'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl glass neon-glow">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Kelola konten dan trending dengan antarmuka futuristik
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Ringkasan</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="glass-strong border-border/50 hover:border-primary/50 hover:neon-glow-hover transition-glow group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Aksi Cepat</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              className="h-auto py-6 gradient-primary hover:neon-glow-hover transition-glow border-0"
              onClick={() => {
                const tab = document.querySelector('[data-state="active"]');
                if (tab?.textContent === 'Artikel') {
                  const createBtn = document.querySelector('[data-create-article]') as HTMLButtonElement;
                  createBtn?.click();
                }
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span className="font-semibold">Buat Artikel Baru</span>
              </div>
            </Button>
            <Button 
              className="h-auto py-6 gradient-secondary hover:neon-glow-hover transition-glow border-0"
              onClick={() => {
                const tab = document.querySelector('[data-state="active"]');
                if (tab?.textContent === 'Rumor') {
                  const createBtn = document.querySelector('[data-create-rumor]') as HTMLButtonElement;
                  createBtn?.click();
                }
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <Plus className="h-6 w-6" />
                <span className="font-semibold">Buat Rumor Baru</span>
              </div>
            </Button>
            <Button 
              className="h-auto py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:neon-glow-hover transition-glow border-0"
              onClick={() => navigate({ to: '/discuss' })}
            >
              <div className="flex flex-col items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                <span className="font-semibold">Lihat Diskusi</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Content Management Tabs */}
        <Card className="glass-strong border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Manajemen Konten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="articles" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 glass p-1">
                <TabsTrigger 
                  value="articles"
                  className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Artikel
                </TabsTrigger>
                <TabsTrigger 
                  value="rumors"
                  className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow"
                >
                  <Radio className="h-4 w-4 mr-2" />
                  Rumor
                </TabsTrigger>
                <TabsTrigger 
                  value="discussions"
                  className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Diskusi
                </TabsTrigger>
                <TabsTrigger 
                  value="trending"
                  className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger 
                  value="groups"
                  className="data-[state=active]:glass-strong data-[state=active]:neon-glow transition-glow"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Groups
                </TabsTrigger>
              </TabsList>

              <TabsContent value="articles" className="space-y-4">
                <AdminArticles />
              </TabsContent>

              <TabsContent value="rumors" className="space-y-4">
                <AdminRumors />
              </TabsContent>

              <TabsContent value="discussions" className="space-y-4">
                <AdminDiscussions />
              </TabsContent>

              <TabsContent value="trending" className="space-y-4">
                <AdminTrending />
              </TabsContent>

              <TabsContent value="groups" className="space-y-4">
                <AdminGroups />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
