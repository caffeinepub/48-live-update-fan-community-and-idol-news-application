import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    articles : Map.Map<Nat, Article>;
  };

  type Article = {
    id : Nat;
    title : Text;
    image : Storage.ExternalBlob;
    content : Text;
    date : Time.Time;
    archived : Bool;
  };

  type NewArticle = {
    id : Nat;
    title : Text;
    image : ?Storage.ExternalBlob;
    content : Text;
    date : Time.Time;
    archived : Bool;
  };

  type NewActor = {
    articles : Map.Map<Nat, NewArticle>;
  };

  public func run(old : OldActor) : NewActor {
    let newArticles = old.articles.map<Nat, Article, NewArticle>(
      func(_id, oldArticle) {
        { oldArticle with image = ?oldArticle.image };
      }
    );
    { articles = newArticles };
  };
};
