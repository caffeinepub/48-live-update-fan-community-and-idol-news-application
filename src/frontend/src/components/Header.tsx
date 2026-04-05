import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Moon, Search, Shield, Sun, User, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useIsCallerAdmin,
  useSearchContent,
} from "../hooks/useQueries";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { data: searchResults, isLoading: isSearching } =
    useSearchContent(debouncedQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Show results when query is present
  useEffect(() => {
    setShowResults(debouncedQuery.length >= 2);
  }, [debouncedQuery]);

  // Close results on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        console.error("Login error:", error);
        if (
          error instanceof Error &&
          error.message === "User is already authenticated"
        ) {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleResultClick = (type: string, id: bigint | string) => {
    setShowSearch(false);
    setShowResults(false);
    setSearchQuery("");
    setDebouncedQuery("");

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
    } else if (type === "group") {
      navigate({
        to: "/groups/$groupName",
        params: { groupName: id.toString() },
      });
    } else if (type === "member") {
      navigate({
        to: "/groups/$groupName",
        params: { groupName: id.toString() },
      });
    }
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "48 LIVE UPDATE", path: "/news" },
    { label: "48 LIVE RUMOR", path: "/rumors" },
    { label: "48 LIVE DISCUSS", path: "/discuss" },
    { label: "48Group", path: "/groups" },
  ];

  const currentPath = routerState.location.pathname;

  const hasSearchResults =
    searchResults &&
    (searchResults.articles.length > 0 ||
      searchResults.rumors.length > 0 ||
      searchResults.discussions.length > 0 ||
      searchResults.groups.length > 0 ||
      searchResults.members.length > 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 transition-smooth hover:opacity-80"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <span className="text-lg font-bold text-gradient">
                48 LIVE UPDATE
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-smooth ${
                  currentPath === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Auth & Theme Toggle & Search */}
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery("");
                  setDebouncedQuery("");
                  setShowResults(false);
                }
              }}
              className="rounded-full hover:bg-primary/10"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-primary/10"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {isAuthenticated && userProfile && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary/30 to-accent/20 border border-secondary/30 text-sm">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{userProfile.name}</span>
              </div>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/admin" })}
                className="gap-2 rounded-full border-primary/40 hover:bg-primary/10"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? "outline" : "default"}
              size="sm"
              className={`gap-2 rounded-full ${
                isAuthenticated
                  ? "border-primary/30 hover:bg-primary/10"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Keluar
                </>
              ) : (
                "Masuk Penggemar"
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="rounded-full"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="pb-4 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                autoFocus
                placeholder="Cari artikel, rumor, diskusi, grup, atau member... (min. 2 karakter)"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() =>
                  debouncedQuery.length >= 2 && setShowResults(true)
                }
                className="pl-10 rounded-full border-2 border-primary/30 focus:border-primary"
              />
              {isSearching && debouncedQuery.length >= 2 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && hasSearchResults && (
              <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto rounded-2xl border-2 border-primary/20 bg-card shadow-xl z-50">
                <CardContent className="p-4 space-y-4">
                  {searchResults.articles.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Artikel ({searchResults.articles.length})
                      </h3>
                      <div className="space-y-1">
                        {searchResults.articles.slice(0, 5).map((article) => (
                          <button
                            type="button"
                            key={article.id.toString()}
                            onClick={() =>
                              handleResultClick("article", article.id)
                            }
                            className="w-full text-left p-3 rounded-xl hover:bg-primary/10 transition-smooth"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full shrink-0">
                                Artikel
                              </Badge>
                              <p className="font-medium line-clamp-1">
                                {article.title}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.rumors.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Rumor ({searchResults.rumors.length})
                      </h3>
                      <div className="space-y-1">
                        {searchResults.rumors.slice(0, 5).map((rumor) => (
                          <button
                            type="button"
                            key={rumor.id.toString()}
                            onClick={() => handleResultClick("rumor", rumor.id)}
                            className="w-full text-left p-3 rounded-xl hover:bg-accent/10 transition-smooth"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className="bg-accent/20 text-accent border-accent/30 rounded-full shrink-0">
                                Rumor
                              </Badge>
                              <p className="font-medium line-clamp-1">
                                {rumor.title}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.discussions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Diskusi ({searchResults.discussions.length})
                      </h3>
                      <div className="space-y-1">
                        {searchResults.discussions
                          .slice(0, 5)
                          .map((discussion) => (
                            <button
                              type="button"
                              key={discussion.id.toString()}
                              onClick={() =>
                                handleResultClick("discussion", discussion.id)
                              }
                              className="w-full text-left p-3 rounded-xl hover:bg-secondary/10 transition-smooth"
                            >
                              <div className="flex items-center gap-2">
                                <Badge className="bg-secondary/20 text-secondary border-secondary/30 rounded-full shrink-0">
                                  Diskusi
                                </Badge>
                                <p className="font-medium line-clamp-1">
                                  {discussion.title}
                                </p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {searchResults.groups.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Grup ({searchResults.groups.length})
                      </h3>
                      <div className="space-y-1">
                        {searchResults.groups.map((group) => (
                          <button
                            type="button"
                            key={group.name}
                            onClick={() =>
                              handleResultClick("group", group.name)
                            }
                            className="w-full text-left p-3 rounded-xl hover:bg-primary/10 transition-smooth"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/20 text-primary border-primary/30 rounded-full shrink-0">
                                Grup
                              </Badge>
                              <p className="font-medium">{group.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.members.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Member ({searchResults.members.length})
                      </h3>
                      <div className="space-y-1">
                        {searchResults.members.slice(0, 8).map((member) => (
                          <div
                            key={`${member.fullName}-${member.team}`}
                            className="p-3 rounded-xl bg-muted/20 border border-border/40"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className="bg-accent/20 text-accent border-accent/30 rounded-full shrink-0">
                                Member
                              </Badge>
                              <p className="font-medium">{member.fullName}</p>
                              {member.team && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {member.team}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showResults &&
              debouncedQuery.length >= 2 &&
              !isSearching &&
              !hasSearchResults && (
                <Card className="absolute top-full mt-2 w-full rounded-2xl border-2 border-primary/20 bg-card shadow-lg z-50">
                  <CardContent className="p-4 text-center text-muted-foreground">
                    Tidak ada hasil ditemukan untuk "{debouncedQuery}"
                  </CardContent>
                </Card>
              )}
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => {
                    navigate({ to: item.path });
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-4 py-2 text-sm font-medium rounded-lg transition-smooth ${
                    currentPath === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    navigate({ to: "/admin" });
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-smooth"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </button>
              )}
              <div className="flex flex-col gap-2 border-t pt-4 mt-2">
                {isAuthenticated && userProfile && (
                  <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-secondary/20 border border-secondary/30">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{userProfile.name}</span>
                  </div>
                )}
                <Button
                  onClick={handleAuth}
                  disabled={disabled}
                  variant={isAuthenticated ? "outline" : "default"}
                  size="sm"
                  className={`w-full gap-2 rounded-full ${
                    isAuthenticated
                      ? "border-primary/30"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isAuthenticated ? (
                    <>
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </>
                  ) : (
                    "Masuk Penggemar"
                  )}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
