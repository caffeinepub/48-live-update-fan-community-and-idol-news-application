import { useNavigate } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  useGetAllUpcomingEvents,
  useGetUnarchivedArticles,
  useGetUnarchivedDiscussions,
  useGetUnarchivedRumors,
} from "../hooks/useQueries";

export default function HomePage() {
  const { data: articles, isLoading: articlesLoading } =
    useGetUnarchivedArticles();
  const { data: rumors, isLoading: rumorsLoading } = useGetUnarchivedRumors();
  const { data: discussions, isLoading: discussionsLoading } =
    useGetUnarchivedDiscussions();
  const { data: upcomingEvents, isLoading: eventsLoading } =
    useGetAllUpcomingEvents();
  const navigate = useNavigate();

  const isLoading =
    articlesLoading || rumorsLoading || discussionsLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-96 w-full rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedArticles = [...(articles || [])].sort((a, b) =>
    Number(b.date - a.date),
  );
  const sortedRumors = [...(rumors || [])].sort((a, b) =>
    Number(b.date - a.date),
  );
  const sortedDiscussions = [...(discussions || [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  // Combine latest content from all types
  const latestContent = [
    ...sortedArticles.slice(0, 5).map((a) => ({
      type: "article",
      id: a.id,
      title: a.title,
      date: a.date,
    })),
    ...sortedRumors
      .slice(0, 5)
      .map((r) => ({ type: "rumor", id: r.id, title: r.title, date: r.date })),
    ...sortedDiscussions.slice(0, 5).map((d) => ({
      type: "discussion",
      id: d.id,
      title: d.title,
      date: d.timestamp,
    })),
  ]
    .sort((a, b) => Number(b.date - a.date))
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirm":
        return "bg-success/20 text-success border-success/30";
      case "unconfirm":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-warning/20 text-warning border-warning/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirm":
        return "Terkonfirmasi";
      case "unconfirm":
        return "Tidak Terkonfirmasi";
      default:
        return "Menunggu";
    }
  };

  const getContentTypeBadgeClass = (type: string) => {
    switch (type) {
      case "article":
        return "bg-primary/20 text-primary border-primary/30";
      case "rumor":
        return "bg-accent/20 text-accent border-accent/30";
      case "discussion":
        return "bg-secondary/20 text-secondary border-secondary/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "article":
        return "Berita";
      case "rumor":
        return "Rumor";
      case "discussion":
        return "Diskusi";
      default:
        return type;
    }
  };

  const handleContentClick = (type: string, id: bigint) => {
    if (type === "article") {
      navigate({
        to: "/news/$articleId",
        params: { articleId: id.toString() },
      });
    } else if (type === "rumor") {
      navigate({ to: "/rumors/$rumorId", params: { rumorId: id.toString() } });
    } else if (type === "discussion") {
      navigate({
        to: "/discuss/$discussionId",
        params: { discussionId: id.toString() },
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
        <img
          src="/assets/IMG_7494.webp"
          alt="48 LIVE UPDATE"
          className="h-[500px] w-full object-cover opacity-60"
          onError={(e) => {
            e.currentTarget.src = "/assets/IMG_7494-1.webp";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-gradient animate-fade-in">
              48 LIVE UPDATE
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 font-medium">
              Website Resmi 48 LIVE UPDATE
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Upcoming Events */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gradient mb-2">
              Upcoming Events
            </h2>
            <p className="text-muted-foreground">
              Acara dan event mendatang dari semua grup 48
            </p>
          </div>
          {!upcomingEvents || upcomingEvents.length === 0 ? (
            <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">
                    Belum Ada Event Mendatang
                  </h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Saat ini belum ada jadwal event yang akan datang
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.slice(0, 6).map((event) => (
                <Card
                  key={`${event.event}-${String(event.date)}`}
                  className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-3 min-w-[70px]">
                        <span className="text-2xl font-bold text-gradient">
                          {format(Number(event.date) / 1000000, "dd", {
                            locale: id,
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(Number(event.date) / 1000000, "MMM", {
                            locale: id,
                          })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 font-semibold text-foreground line-clamp-2">
                          {event.event} – {event.groupName}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 5 Konten Terbaru */}
        {latestContent.length > 0 && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gradient mb-2">
                5 Konten Terbaru
              </h2>
              <p className="text-muted-foreground">
                Unggahan terbaru dari semua kategori
              </p>
            </div>
            <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {latestContent.map((item) => (
                    <button
                      type="button"
                      key={`${item.type}-${String(item.id)}`}
                      className="w-full p-6 hover:bg-muted/30 cursor-pointer transition-smooth flex items-center justify-between gap-4 text-left"
                      onClick={() => handleContentClick(item.type, item.id)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Badge
                          className={`${getContentTypeBadgeClass(item.type)} rounded-full`}
                        >
                          {getContentTypeLabel(item.type)}
                        </Badge>
                        <p className="font-semibold text-foreground flex-1">
                          {item.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(Number(item.date) / 1000000, {
                          addSuffix: true,
                          locale: id,
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 48 LIVE UPDATE Terbaru */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gradient">
              48 LIVE UPDATE Terbaru
            </h2>
            <button
              type="button"
              onClick={() => navigate({ to: "/news" })}
              className="text-sm font-semibold text-primary hover:text-accent transition-smooth flex items-center gap-1 group"
            >
              Lihat Semua
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
          {sortedArticles.length === 0 ? (
            <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
              <CardContent className="p-8 text-center text-muted-foreground">
                Belum ada artikel tersedia
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {sortedArticles.slice(0, 3).map((article) => (
                <Card
                  key={article.id.toString()}
                  className="group cursor-pointer overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth"
                  onClick={() =>
                    navigate({
                      to: "/news/$articleId",
                      params: { articleId: article.id.toString() },
                    })
                  }
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary/30" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="mb-3 line-clamp-2 text-lg font-bold group-hover:text-primary transition-smooth">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(Number(article.date) / 1000000, {
                        addSuffix: true,
                        locale: id,
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 48 LIVE RUMOR Terbaru */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gradient">
              48 LIVE RUMOR Terbaru
            </h2>
            <button
              type="button"
              onClick={() => navigate({ to: "/rumors" })}
              className="text-sm font-semibold text-primary hover:text-accent transition-smooth flex items-center gap-1 group"
            >
              Lihat Semua
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
          {sortedRumors.length === 0 ? (
            <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
              <CardContent className="p-8 text-center text-muted-foreground">
                Belum ada rumor tersedia
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {sortedRumors.slice(0, 3).map((rumor) => (
                <Card
                  key={rumor.id.toString()}
                  className="cursor-pointer rounded-3xl border-2 border-accent/20 bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-smooth group"
                  onClick={() =>
                    navigate({
                      to: "/rumors/$rumorId",
                      params: { rumorId: rumor.id.toString() },
                    })
                  }
                >
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <Badge
                        className={`${getStatusColor(rumor.status)} rounded-full`}
                      >
                        {getStatusLabel(rumor.status)}
                      </Badge>
                    </div>
                    <h3 className="mb-3 line-clamp-2 text-lg font-bold group-hover:text-primary transition-smooth">
                      {rumor.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(Number(rumor.date) / 1000000, {
                        addSuffix: true,
                        locale: id,
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 48 LIVE DISCUSS Terbaru */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gradient">
              48 LIVE DISCUSS Terbaru
            </h2>
            <button
              type="button"
              onClick={() => navigate({ to: "/discuss" })}
              className="text-sm font-semibold text-primary hover:text-accent transition-smooth flex items-center gap-1 group"
            >
              Lihat Semua
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
          {sortedDiscussions.length === 0 ? (
            <Card className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card to-muted/30">
              <CardContent className="p-8 text-center text-muted-foreground">
                Belum ada diskusi tersedia
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedDiscussions.slice(0, 3).map((discussion) => (
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
                        <h3 className="mb-2 text-lg font-bold group-hover:text-primary transition-smooth">
                          {discussion.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(
                            Number(discussion.timestamp) / 1000000,
                            { addSuffix: true, locale: id },
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
