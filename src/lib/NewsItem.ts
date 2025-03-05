import { DateTime } from "luxon";

// お知らせの対象学年
export enum NotifyTarget {
  ALL = 0,
  FIRST_YEAR = 1,
  SECOND_YEAR = 2,
}

// お知らせのクラス
export default class NewsItem {
  public title: string;
  public link: string | undefined;
  public target: NotifyTarget;
  public date: DateTime;

  constructor(
    title: string,
    link: string | undefined,
    target: NotifyTarget,
    date: DateTime
  ) {
    this.title = title;
    this.link = link;
    this.target = target;
    this.date = date;
  }

  public isNewerThan(date: DateTime): boolean {
    return this.date >= date;
  }

  public toString(): string {
    return `${this.title}(${this.link})`;
  }
}
