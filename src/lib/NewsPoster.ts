import NewsItem, { NotifyTarget } from "./NewsItem";
import TwitterApi from "twitter-api-v2";

export default class NewsPoster {
  private xclient: TwitterApi;

  constructor() {
    this.xclient = new TwitterApi({
      appKey: process.env.X_API_KEY,
      appSecret: process.env.X_API_SECRET,
      accessToken: process.env.X_ACCESS_TOKEN,
      accessSecret: process.env.X_ACCESS_SECRET,
    });
  }

  public post(item: NewsItem): void {
    const text = item.toString() + "\n" + this.getNotifyTargetTag(item.target);
    this.xclient.v2.tweet(text);
  }

  private getNotifyTargetTag(type: NotifyTarget) {
    switch (type) {
      case NotifyTarget.FIRST_YEAR:
        return "#東大教養1年生向けお知らせ";
      case NotifyTarget.SECOND_YEAR:
        return "#東大教養2年生向けお知らせ";
      case NotifyTarget.ALL:
      default:
        return "#東大教養1年生向けお知らせ #東大教養2年生向けお知らせ";
    }
  }
}
