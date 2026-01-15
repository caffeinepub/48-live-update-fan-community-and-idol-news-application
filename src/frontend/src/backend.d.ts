import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface LatestArticleTable {
    itemId: bigint;
    itemType: string;
    uploadDate: Time;
}
export interface Article {
    id: bigint;
    title: string;
    content: string;
    date: Time;
    image?: ExternalBlob;
    archived: boolean;
}
export type Time = bigint;
export interface Trending {
    id: bigint;
    contentId: bigint;
    contentType: string;
    timestamp: Time;
}
export interface Discussion {
    id: bigint;
    title: string;
    content: string;
    author: Principal;
    timestamp: Time;
    category: string;
    archived: boolean;
}
export interface Schedule {
    date: Time;
    event: string;
    location: string;
}
export interface GroupNews {
    id: bigint;
    title: string;
    content: string;
    date: Time;
}
export interface Group {
    schedules: Array<Schedule>;
    members: Array<Member>;
    discography: Discography;
    name: string;
    news: Array<GroupNews>;
    memberCount: bigint;
    baseLocation: string;
    formationDate: Time;
    setlists: Array<Setlist>;
    theaterLocation: string;
}
export interface CreateDiscussionRequest {
    title: string;
    content: string;
    category: string;
}
export interface Discography {
    albums: Array<Album>;
    singles: Array<Single>;
}
export interface Comment {
    id: bigint;
    contentId: bigint;
    content: string;
    author: Principal;
    timestamp: Time;
    archived: boolean;
}
export interface Rumor {
    id: bigint;
    status: Status;
    title: string;
    content: string;
    date: Time;
    archived: boolean;
}
export interface CreateRumorRequest {
    status: Status;
    title: string;
    content: string;
}
export interface Album {
    title: string;
    tracks: Array<string>;
    releaseDate: Time;
}
export interface Single {
    title: string;
    tracks: Array<string>;
    releaseDate: Time;
}
export interface CreateArticleRequest {
    title: string;
    content: string;
    image?: ExternalBlob;
}
export interface TrendingTable {
    itemId: bigint;
    timestamp: Time;
    itemType: string;
}
export interface Setlist {
    title: string;
    tracks: Array<string>;
}
export interface Member {
    bio: string;
    nickname: string;
    birthdate: Time;
    team: string;
    generation: string;
    fullName: string;
}
export interface HomepageContent {
    latestArticlesTable: Array<LatestArticleTable>;
    rumors: Array<Rumor>;
    articles: Array<Article>;
    trending: Array<Trending>;
    discussions: Array<Discussion>;
    trendingTable: Array<TrendingTable>;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum Status {
    unconfirm = "unconfirm",
    confirm = "confirm",
    waiting = "waiting"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(contentId: bigint, content: string): Promise<bigint>;
    addTrending(contentId: bigint, contentType: string): Promise<bigint>;
    archiveArticle(id: bigint): Promise<void>;
    archiveComment(id: bigint): Promise<void>;
    archiveDiscussion(id: bigint): Promise<void>;
    archiveRumor(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createArticle(request: CreateArticleRequest): Promise<bigint>;
    createDiscussion(request: CreateDiscussionRequest): Promise<bigint>;
    createGroup(group: Group): Promise<void>;
    createRumor(request: CreateRumorRequest): Promise<bigint>;
    deleteGroup(name: string): Promise<void>;
    filterArticlesByTitle(title: string): Promise<Array<Article>>;
    filterDiscussionsByCategory(category: string): Promise<Array<Discussion>>;
    filterRumorsByStatus(status: Status): Promise<Array<Rumor>>;
    getAllArticles(): Promise<Array<Article>>;
    getAllComments(): Promise<Array<Comment>>;
    getAllDiscussions(): Promise<Array<Discussion>>;
    getAllGroups(): Promise<Array<Group>>;
    getAllRumors(): Promise<Array<Rumor>>;
    getAllTrending(): Promise<Array<Trending>>;
    getArticle(id: bigint): Promise<Article>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComment(id: bigint): Promise<Comment>;
    getCommentsByContentId(contentId: bigint): Promise<Array<Comment>>;
    getDiscussion(id: bigint): Promise<Discussion>;
    getGroup(name: string): Promise<Group>;
    getHomepageContent(): Promise<HomepageContent>;
    getRumor(id: bigint): Promise<Rumor>;
    getTrending(id: bigint): Promise<Trending>;
    getUnarchivedArticles(): Promise<Array<Article>>;
    getUnarchivedComments(): Promise<Array<Comment>>;
    getUnarchivedDiscussions(): Promise<Array<Discussion>>;
    getUnarchivedRumors(): Promise<Array<Rumor>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeTrending(id: bigint): Promise<void>;
    restoreArticle(id: bigint): Promise<void>;
    restoreComment(id: bigint): Promise<void>;
    restoreDiscussion(id: bigint): Promise<void>;
    restoreRumor(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateArticle(id: bigint, title: string, image: ExternalBlob | null, content: string): Promise<void>;
    updateComment(id: bigint, content: string): Promise<void>;
    updateDiscussion(id: bigint, title: string, category: string, content: string): Promise<void>;
    updateGroup(group: Group): Promise<void>;
    updateRumor(id: bigint, title: string, content: string, status: Status): Promise<void>;
}
