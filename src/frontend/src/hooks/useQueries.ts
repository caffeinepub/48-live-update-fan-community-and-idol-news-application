import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Article,
  Comment,
  CreateArticleRequest,
  CreateDiscussionRequest,
  CreateRumorRequest,
  Discussion,
  Group,
  Rumor,
  ScheduleWithGroup,
  Status,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Articles
export function useGetUnarchivedArticles() {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnarchivedArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArticle(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Article>({
    queryKey: ["article", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getArticle(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateArticleRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createArticle(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUpdateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: { id: bigint; title: string; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateArticle(id, title, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
}

export function useDeleteArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteArticle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

// Rumors
export function useGetUnarchivedRumors() {
  const { actor, isFetching } = useActor();

  return useQuery<Rumor[]>({
    queryKey: ["rumors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnarchivedRumors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRumor(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Rumor>({
    queryKey: ["rumor", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getRumor(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRumor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRumorRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createRumor(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rumors"] });
    },
  });
}

export function useUpdateRumor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      status,
    }: { id: bigint; title: string; content: string; status: Status }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateRumor(id, title, content, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rumors"] });
      queryClient.invalidateQueries({ queryKey: ["rumor"] });
    },
  });
}

export function useUpdateRumorStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: Status }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateRumorStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rumors"] });
      queryClient.invalidateQueries({ queryKey: ["rumor"] });
    },
  });
}

export function useDeleteRumor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteRumor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rumors"] });
    },
  });
}

// Discussions
export function useGetUnarchivedDiscussions() {
  const { actor, isFetching } = useActor();

  return useQuery<Discussion[]>({
    queryKey: ["discussions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnarchivedDiscussions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDiscussion(id: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Discussion>({
    queryKey: ["discussion", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDiscussion(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateDiscussion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateDiscussionRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createDiscussion(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
}

export function useDeleteDiscussion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteDiscussion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
  });
}

// Comments
export function useGetCommentsByContentId(contentId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ["comments", contentId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsByContentId(contentId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      content,
    }: { contentId: bigint; content: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addComment(contentId, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.contentId.toString()],
      });
    },
  });
}

export function useArchiveComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.archiveComment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

// Upcoming Events
export function useGetAllUpcomingEvents() {
  const { actor, isFetching } = useActor();

  return useQuery<ScheduleWithGroup[]>({
    queryKey: ["upcomingEvents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUpcomingEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

// Search
export function useSearchContent(query: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchContent(query);
    },
    enabled: !!actor && !isFetching && query.length > 0,
  });
}

// Groups
export function useGetAllGroups() {
  const { actor, isFetching } = useActor();

  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllGroups();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGroup(name: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Group>({
    queryKey: ["group", name],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getGroup(name);
    },
    enabled: !!actor && !isFetching && !!name,
  });
}

export function useCreateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (group: Group) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createGroup(group);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
    },
  });
}

export function useUpdateGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (group: Group) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateGroup(group);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", variables.name] });
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
    },
  });
}

export function useDeleteGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteGroup(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
    },
  });
}

export function useRenameGroup() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      oldName,
      newName,
    }: { oldName: string; newName: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.renameGroup(oldName, newName);
      return { oldName, newName };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", data.oldName] });
      queryClient.invalidateQueries({ queryKey: ["group", data.newName] });
      queryClient.removeQueries({ queryKey: ["group", data.oldName] });
      queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
    },
  });
}
