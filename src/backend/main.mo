import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  public type Role = {
    #admin;
    #user;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  public type Article = {
    id : Nat;
    title : Text;
    image : ?Storage.ExternalBlob;
    content : Text;
    date : Time.Time;
    archived : Bool;
  };

  module Article {
    public func compare(article1 : Article, article2 : Article) : Order.Order {
      Nat.compare(article1.id, article2.id);
    };
  };

  public type Rumor = {
    id : Nat;
    title : Text;
    content : Text;
    status : Status;
    date : Time.Time;
    archived : Bool;
  };

  module Rumor {
    public func compare(rumor1 : Rumor, rumor2 : Rumor) : Order.Order {
      Nat.compare(rumor1.id, rumor2.id);
    };
  };

  public type Status = {
    #waiting;
    #confirm;
    #unconfirm;
  };

  public type Discussion = {
    id : Nat;
    title : Text;
    category : Text;
    content : Text;
    author : Principal;
    timestamp : Time.Time;
    archived : Bool;
  };

  module Discussion {
    public func compare(discussion1 : Discussion, discussion2 : Discussion) : Order.Order {
      Nat.compare(discussion1.id, discussion2.id);
    };
  };

  public type Comment = {
    id : Nat;
    contentId : Nat;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
    archived : Bool;
  };

  module Comment {
    public func compare(comment1 : Comment, comment2 : Comment) : Order.Order {
      Nat.compare(comment1.id, comment2.id);
    };
  };

  public type Trending = {
    id : Nat;
    contentId : Nat;
    contentType : Text;
    timestamp : Time.Time;
  };

  public type Group = {
    name : Text;
    formationDate : Time.Time;
    baseLocation : Text;
    theaterLocation : Text;
    memberCount : Nat;
    members : [Member];
    schedules : [Schedule];
    news : [GroupNews];
    discography : Discography;
    setlists : [Setlist];
  };

  public type Member = {
    fullName : Text;
    nickname : Text;
    birthdate : Time.Time;
    generation : Text;
    team : Text;
    bio : Text;
  };

  public type Schedule = {
    date : Time.Time;
    event : Text;
    location : Text;
  };

  public type GroupNews = {
    id : Nat;
    title : Text;
    content : Text;
    date : Time.Time;
  };

  public type Discography = {
    singles : [Single];
    albums : [Album];
  };

  public type Single = {
    title : Text;
    releaseDate : Time.Time;
    tracks : [Text];
  };

  public type Album = {
    title : Text;
    releaseDate : Time.Time;
    tracks : [Text];
  };

  public type Setlist = {
    title : Text;
    tracks : [Text];
  };

  public type CreateArticleRequest = {
    title : Text;
    image : ?Storage.ExternalBlob;
    content : Text;
  };

  public type CreateRumorRequest = {
    title : Text;
    content : Text;
    status : Status;
  };

  public type CreateDiscussionRequest = {
    title : Text;
    category : Text;
    content : Text;
  };

  public type HomepageContent = {
    articles : [Article];
    rumors : [Rumor];
    discussions : [Discussion];
    trending : [Trending];
    trendingTable : [TrendingTable];
    latestArticlesTable : [LatestArticleTable];
  };

  public type TrendingTable = {
    itemType : Text; // "Update", "Rumor", or "Discuss"
    itemId : Nat;
    timestamp : Time.Time;
  };

  public type LatestArticleTable = {
    itemType : Text; // "Update", "Rumor", or "Discuss"
    itemId : Nat;
    uploadDate : Time.Time;
  };

  var articleIdCounter = 0;
  var rumorIdCounter = 0;
  var discussionIdCounter = 0;
  var commentIdCounter = 0;
  var trendingIdCounter = 0;

  let articles = Map.empty<Nat, Article>();
  let rumors = Map.empty<Nat, Rumor>();
  let discussions = Map.empty<Nat, Discussion>();
  let comments = Map.empty<Nat, Comment>();
  let trending = Map.empty<Nat, Trending>();
  let groups = Map.empty<Text, Group>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createArticle(request : CreateArticleRequest) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create articles");
    };
    let id = articleIdCounter;
    let article : Article = {
      id;
      title = request.title;
      image = request.image;
      content = request.content;
      date = Time.now();
      archived = false;
    };
    articles.add(id, article);
    articleIdCounter += 1;
    id;
  };

  public shared ({ caller }) func createRumor(request : CreateRumorRequest) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create rumors");
    };
    let id = rumorIdCounter;
    let rumor : Rumor = {
      id;
      title = request.title;
      content = request.content;
      status = request.status;
      date = Time.now();
      archived = false;
    };
    rumors.add(id, rumor);
    rumorIdCounter += 1;
    id;
  };

  public shared ({ caller }) func createDiscussion(request : CreateDiscussionRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can create discussions");
    };
    let id = discussionIdCounter;
    let discussion : Discussion = {
      id;
      title = request.title;
      category = request.category;
      content = request.content;
      author = caller;
      timestamp = Time.now();
      archived = false;
    };
    discussions.add(id, discussion);
    discussionIdCounter += 1;
    id;
  };

  public shared ({ caller }) func addComment(contentId : Nat, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only logged-in users can comment");
    };
    let id = commentIdCounter;
    let comment : Comment = {
      id;
      contentId;
      author = caller;
      content;
      timestamp = Time.now();
      archived = false;
    };
    comments.add(id, comment);
    commentIdCounter += 1;
    id;
  };

  public shared ({ caller }) func addTrending(contentId : Nat, contentType : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can add trending content");
    };
    let id = trendingIdCounter;
    let trend : Trending = {
      id;
      contentId;
      contentType;
      timestamp = Time.now();
    };
    trending.add(id, trend);
    trendingIdCounter += 1;
    id;
  };

  public shared ({ caller }) func createGroup(group : Group) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create groups");
    };
    groups.add(group.name, group);
  };

  public shared ({ caller }) func updateArticle(id : Nat, title : Text, image : ?Storage.ExternalBlob, content : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update articles");
    };
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) {
        let updatedArticle : Article = {
          id;
          title;
          image;
          content;
          date = Time.now();
          archived = article.archived;
        };
        articles.add(id, updatedArticle);
      };
    };
  };

  public shared ({ caller }) func updateRumor(id : Nat, title : Text, content : Text, status : Status) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update rumors");
    };
    switch (rumors.get(id)) {
      case (null) { Runtime.trap("Rumor not found") };
      case (?rumor) {
        let updatedRumor : Rumor = {
          id;
          title;
          content;
          status;
          date = Time.now();
          archived = rumor.archived;
        };
        rumors.add(id, updatedRumor);
      };
    };
  };

  public shared ({ caller }) func updateDiscussion(id : Nat, title : Text, category : Text, content : Text) : async () {
    switch (discussions.get(id)) {
      case (null) { Runtime.trap("Discussion not found") };
      case (?discussion) {
        if (caller != discussion.author and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only author or admin can update discussion");
        };

        let updatedDiscussion : Discussion = {
          id;
          title;
          category;
          content;
          author = discussion.author;
          timestamp = Time.now();
          archived = discussion.archived;
        };
        discussions.add(id, updatedDiscussion);
      };
    };
  };

  public shared ({ caller }) func updateComment(id : Nat, content : Text) : async () {
    switch (comments.get(id)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        if (caller != comment.author and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only author or admin can update comment");
        };

        let updatedComment : Comment = {
          id;
          contentId = comment.contentId;
          author = comment.author;
          content;
          timestamp = Time.now();
          archived = comment.archived;
        };
        comments.add(id, updatedComment);
      };
    };
  };

  public shared ({ caller }) func updateGroup(group : Group) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update groups");
    };
    if (not groups.containsKey(group.name)) {
      Runtime.trap("Group not found");
    };
    groups.add(group.name, group);
  };

  public shared ({ caller }) func deleteGroup(name : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete groups");
    };
    if (not groups.containsKey(name)) {
      Runtime.trap("Group not found");
    };
    groups.remove(name);
  };

  public shared ({ caller }) func archiveArticle(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can archive articles");
    };
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) {
        let archivedArticle : Article = {
          id;
          title = article.title;
          image = article.image;
          content = article.content;
          date = article.date;
          archived = true;
        };
        articles.add(id, archivedArticle);
      };
    };
  };

  public shared ({ caller }) func archiveRumor(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can archive rumors");
    };
    switch (rumors.get(id)) {
      case (null) { Runtime.trap("Rumor not found") };
      case (?rumor) {
        let archivedRumor : Rumor = {
          id;
          title = rumor.title;
          content = rumor.content;
          status = rumor.status;
          date = rumor.date;
          archived = true;
        };
        rumors.add(id, archivedRumor);
      };
    };
  };

  public shared ({ caller }) func archiveDiscussion(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can archive discussions");
    };
    switch (discussions.get(id)) {
      case (null) { Runtime.trap("Discussion not found") };
      case (?discussion) {
        let archivedDiscussion : Discussion = {
          id;
          title = discussion.title;
          category = discussion.category;
          content = discussion.content;
          author = discussion.author;
          timestamp = discussion.timestamp;
          archived = true;
        };
        discussions.add(id, archivedDiscussion);
      };
    };
  };

  public shared ({ caller }) func archiveComment(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can archive comments");
    };
    switch (comments.get(id)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        let archivedComment : Comment = {
          id;
          contentId = comment.contentId;
          author = comment.author;
          content = comment.content;
          timestamp = comment.timestamp;
          archived = true;
        };
        comments.add(id, archivedComment);
      };
    };
  };

  public query func getArticle(id : Nat) : async Article {
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) { article };
    };
  };

  public query func getRumor(id : Nat) : async Rumor {
    switch (rumors.get(id)) {
      case (null) { Runtime.trap("Rumor not found") };
      case (?rumor) { rumor };
    };
  };

  public query func getDiscussion(id : Nat) : async Discussion {
    switch (discussions.get(id)) {
      case (null) { Runtime.trap("Discussion not found") };
      case (?discussion) { discussion };
    };
  };

  public query func getComment(id : Nat) : async Comment {
    switch (comments.get(id)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) { comment };
    };
  };

  public query func getTrending(id : Nat) : async Trending {
    switch (trending.get(id)) {
      case (null) { Runtime.trap("Trending not found") };
      case (?trend) { trend };
    };
  };

  public query func getGroup(name : Text) : async Group {
    switch (groups.get(name)) {
      case (null) { Runtime.trap("Group not found") };
      case (?group) { group };
    };
  };

  public query func getAllArticles() : async [Article] {
    articles.values().toArray().sort();
  };

  public query func getAllRumors() : async [Rumor] {
    rumors.values().toArray().sort();
  };

  public query func getAllDiscussions() : async [Discussion] {
    discussions.values().toArray().sort();
  };

  public query func getAllComments() : async [Comment] {
    comments.values().toArray().sort();
  };

  public query func getAllTrending() : async [Trending] {
    trending.values().toArray();
  };

  public query func getAllGroups() : async [Group] {
    groups.values().toArray();
  };

  public query func getHomepageContent() : async HomepageContent {
    let allArticles = articles.values().toArray().filter(func(article) { not article.archived }).sort();
    let allRumors = rumors.values().toArray().filter(func(rumor) { not rumor.archived }).sort();
    let allDiscussions = discussions.values().toArray().filter(func(discussion) { not discussion.archived }).sort();
    let allTrending = trending.values().toArray();

    let trendingTable = allTrending.map(
      func(trend) {
        { itemType = trend.contentType; itemId = trend.contentId; timestamp = trend.timestamp };
      }
    );

    let latestArticlesUnsorted = allArticles.map(
      func(article) {
        { itemType = "Update"; itemId = article.id; uploadDate = article.date };
      }
    );

    let allLatest = latestArticlesUnsorted.concat(
      allRumors.map(
        func(rumor) {
          { itemType = "Rumor"; itemId = rumor.id; uploadDate = rumor.date };
        }
      )
    ).concat(
      allDiscussions.map(
        func(discussion) {
          { itemType = "Discuss"; itemId = discussion.id; uploadDate = discussion.timestamp };
        }
      )
    );

    func compareLatestArticles(a : LatestArticleTable, b : LatestArticleTable) : Order.Order {
      if (a.uploadDate < b.uploadDate) { #less } else if (a.uploadDate > b.uploadDate) { #greater } else {
        #equal;
      };
    };

    let latestArticlesTable = allLatest.sort(compareLatestArticles);

    {
      articles = allArticles;
      rumors = allRumors;
      discussions = allDiscussions;
      trending = allTrending;
      trendingTable;
      latestArticlesTable;
    };
  };

  public query func getUnarchivedArticles() : async [Article] {
    let filtered = articles.values().toArray().filter(func(article) { not article.archived });
    filtered.sort();
  };

  public query func getUnarchivedRumors() : async [Rumor] {
    let filtered = rumors.values().toArray().filter(func(rumor) { not rumor.archived });
    filtered.sort();
  };

  public query func getUnarchivedDiscussions() : async [Discussion] {
    let filtered = discussions.values().toArray().filter(func(discussion) { not discussion.archived });
    filtered.sort();
  };

  public query func getUnarchivedComments() : async [Comment] {
    let filtered = comments.values().toArray().filter(func(comment) { not comment.archived });
    filtered.sort();
  };

  public query func getCommentsByContentId(contentId : Nat) : async [Comment] {
    let unarchived = comments.values().toArray().filter(func(comment) { not comment.archived });
    unarchived.values().filter(func(comment) { comment.contentId == contentId }).toArray();
  };

  public query func filterArticlesByTitle(title : Text) : async [Article] {
    let unarchived = articles.values().toArray().filter(func(article) { not article.archived });
    let filtered = unarchived.values().filter(func(article) { Text.equal(article.title, title) });
    filtered.toArray();
  };

  public query func filterRumorsByStatus(status : Status) : async [Rumor] {
    let unarchived = rumors.values().toArray().filter(func(rumor) { not rumor.archived });
    let filtered = unarchived.values().filter(func(rumor) { rumor.status == status });
    filtered.toArray();
  };

  public query func filterDiscussionsByCategory(category : Text) : async [Discussion] {
    let unarchived = discussions.values().toArray().filter(func(discussion) { not discussion.archived });
    let filtered = unarchived.values().filter(func(discussion) { Text.equal(discussion.category, category) });
    filtered.toArray();
  };

  public shared ({ caller }) func restoreArticle(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can restore articles");
    };
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) {
        let restoredArticle : Article = {
          id;
          title = article.title;
          image = article.image;
          content = article.content;
          date = article.date;
          archived = false;
        };
        articles.add(id, restoredArticle);
      };
    };
  };

  public shared ({ caller }) func restoreRumor(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can restore rumors");
    };
    switch (rumors.get(id)) {
      case (null) { Runtime.trap("Rumor not found") };
      case (?rumor) {
        let restoredRumor : Rumor = {
          id;
          title = rumor.title;
          content = rumor.content;
          status = rumor.status;
          date = rumor.date;
          archived = false;
        };
        rumors.add(id, restoredRumor);
      };
    };
  };

  public shared ({ caller }) func restoreDiscussion(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can restore discussions");
    };
    switch (discussions.get(id)) {
      case (null) { Runtime.trap("Discussion not found") };
      case (?discussion) {
        let restoredDiscussion : Discussion = {
          id;
          title = discussion.title;
          category = discussion.category;
          content = discussion.content;
          author = discussion.author;
          timestamp = discussion.timestamp;
          archived = false;
        };
        discussions.add(id, restoredDiscussion);
      };
    };
  };

  public shared ({ caller }) func restoreComment(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can restore comments");
    };
    switch (comments.get(id)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        let restoredComment : Comment = {
          id;
          contentId = comment.contentId;
          author = comment.author;
          content = comment.content;
          timestamp = comment.timestamp;
          archived = false;
        };
        comments.add(id, restoredComment);
      };
    };
  };

  public shared ({ caller }) func removeTrending(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can remove trending content");
    };
    if (not trending.containsKey(id)) {
      Runtime.trap("Trending content not found");
    };
    trending.remove(id);
  };
};
