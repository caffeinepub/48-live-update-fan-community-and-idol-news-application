import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";



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
    content : Text;
    date : Time.Time;
    archived : Bool;
  };

  module Article {
    public func compare(a : Article, b : Article) : Order.Order {
      if (a.id < b.id) { #less } else if (a.id > b.id) { #greater } else { #equal };
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
    public func compare(a : Rumor, b : Rumor) : Order.Order {
      if (a.id < b.id) { #less } else if (a.id > b.id) { #greater } else { #equal };
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
    public func compare(a : Discussion, b : Discussion) : Order.Order {
      if (a.id < b.id) { #less } else if (a.id > b.id) { #greater } else { #equal };
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
    public func compare(a : Comment, b : Comment) : Order.Order {
      if (a.id < b.id) { #less } else if (a.id > b.id) { #greater } else { #equal };
    };
  };

  public type Group = {
    name : Text;
    formationDate : Time.Time;
    baseLocation : Text;
    theaterLocation : Text;
    memberCount : Nat;
    members : [Member];
    schedules : [ScheduleWithGroup];
    news : [GroupNews];
    discography : Discography;
    setlists : [Setlist];
    active : Bool;
  };

  public type Member = {
    fullName : Text;
    nickname : Text;
    birthdate : Time.Time;
    generation : Text;
    team : Text;
    bio : Text;
  };

  public type ScheduleWithGroup = {
    date : Time.Time;
    event : Text;
    location : Text;
    groupName : Text;
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

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var articleIdCounter = 0;
  var rumorIdCounter = 0;
  var discussionIdCounter = 0;
  var commentIdCounter = 0;

  let articles = Map.empty<Nat, Article>();
  let rumors = Map.empty<Nat, Rumor>();
  let discussions = Map.empty<Nat, Discussion>();
  let comments = Map.empty<Nat, Comment>();
  let groups = Map.empty<Text, Group>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions - Require user authentication
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

  // Article Functions
  public shared ({ caller }) func createArticle(request : CreateArticleRequest) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create articles");
    };
    let id = articleIdCounter;
    let article : Article = {
      id;
      title = request.title;
      content = request.content;
      date = Time.now();
      archived = false;
    };
    articles.add(id, article);
    articleIdCounter += 1;
    id;
  };

  public shared ({ caller }) func updateArticle(id : Nat, title : Text, content : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update articles");
    };
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) {
        let updatedArticle : Article = {
          id;
          title;
          content;
          date = Time.now();
          archived = article.archived;
        };
        articles.add(id, updatedArticle);
      };
    };
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
          content = article.content;
          date = article.date;
          archived = true;
        };
        articles.add(id, archivedArticle);
      };
    };
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
          content = article.content;
          date = article.date;
          archived = false;
        };
        articles.add(id, restoredArticle);
      };
    };
  };

  // Rumor Functions
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

  public shared ({ caller }) func updateRumorStatus(id : Nat, status : Status) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update rumor status");
    };
    switch (rumors.get(id)) {
      case (null) { Runtime.trap("Rumor not found") };
      case (?rumor) {
        let updatedRumor : Rumor = {
          id = rumor.id;
          title = rumor.title;
          content = rumor.content;
          status;
          date = rumor.date;
          archived = rumor.archived;
        };
        rumors.add(id, updatedRumor);
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

  // Discussion Functions
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

  // Comment Functions
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
          timestamp = comment.timestamp;
          archived = comment.archived;
        };
        comments.add(id, updatedComment);
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

  // Group Functions
  public shared ({ caller }) func createGroup(group : Group) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create groups");
    };
    groups.add(group.name, group);
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

  public shared ({ caller }) func renameGroup(oldName : Text, newName : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can rename groups");
    };
    if (groups.containsKey(newName)) {
      Runtime.trap("Already exists: Cannot rename because " # newName # " already exists");
    };
    switch (groups.get(oldName)) {
      case (null) { Runtime.trap("Group not found: " # oldName) };
      case (?group) {
        let newGroup : Group = { group with name = newName };
        groups.add(newName, newGroup);
        groups.remove(oldName);
      };
    };
  };

  // Public Query Functions - No authentication required (accessible to guests)
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

  public query func getAllGroups() : async [Group] {
    let groupEntries = groups.toArray();
    let sortedEntries = groupEntries.sort(func(a, b) { Text.compare(a.0, b.0) });
    let sortedGroups = sortedEntries.map(func((name, group)) { group });
    sortedGroups;
  };

  func compareByDate(a : { date : Time.Time }, b : { date : Time.Time }) : Order.Order {
    if (a.date < b.date) { #greater } else if (a.date > b.date) {
      #less;
    } else {
      #equal;
    };
  };

  func compareByTimestamp(a : { timestamp : Time.Time }, b : { timestamp : Time.Time }) : Order.Order {
    if (a.timestamp < b.timestamp) { #greater } else if (a.timestamp > b.timestamp) {
      #less;
    } else {
      #equal;
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

  public shared ({ caller }) func deleteArticle(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete articles");
    };
    if (not articles.containsKey(id)) {
      Runtime.trap("Article not found");
    };
    articles.remove(id);
  };

  public shared ({ caller }) func deleteRumor(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete rumors");
    };
    if (not rumors.containsKey(id)) {
      Runtime.trap("Rumor not found");
    };
    rumors.remove(id);
  };

  public shared ({ caller }) func deleteDiscussion(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete discussions");
    };
    switch (discussions.get(id)) {
      case (null) { Runtime.trap("Discussion not found") };
      case (?_) {
        if (not discussions.containsKey(id)) {
          Runtime.trap("Discussion NOT FOUND");
        };
        discussions.remove(id);
      };
    };
  };

  public query func searchContent(search : Text) : async {
    articles : [Article];
    rumors : [Rumor];
    discussions : [Discussion];
    groups : [Group];
    members : [Member];
  } {
    let matchingArticles = articles.values().toArray().filter(
      func(article) { Text.equal(article.title, search) }
    );
    let matchingRumors = rumors.values().toArray().filter(
      func(rumor) { Text.equal(rumor.title, search) }
    );
    let matchingDiscussions = discussions.values().toArray().filter(
      func(discussion) { Text.equal(discussion.title, search) }
    );
    let matchingGroups = groups.values().toArray().filter(
      func(group) { Text.equal(group.name, search) }
    );
    let matchingMembers = groups.values().toArray().map(
      func(group) {
        group.members.filter(
          func(member) { Text.equal(member.fullName, search) }
        );
      }
    ).flatten();

    {
      articles = matchingArticles;
      rumors = matchingRumors;
      discussions = matchingDiscussions;
      groups = matchingGroups;
      members = matchingMembers;
    };
  };

  public query func getAllUpcomingEvents() : async [ScheduleWithGroup] {
    let allSchedules : List.List<ScheduleWithGroup> = List.empty<ScheduleWithGroup>();

    for ((groupName, group) in groups.entries()) {
      for (schedule in group.schedules.values()) {
        let scheduleWithGroup : ScheduleWithGroup = {
          schedule with groupName;
        };
        allSchedules.add(scheduleWithGroup);
      };
    };

    let currentTime = Time.now();
    let filteredSchedules = allSchedules.toArray().filter(
      func(schedule) { schedule.date > currentTime }
    );

    filteredSchedules.sort(
      func(a, b) {
        if (a.date < b.date) { #less } else if (a.date > b.date) {
          #greater;
        } else { #equal };
      }
    );
  };
};
