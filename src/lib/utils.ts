import { DateTime } from "luxon";
import NewsItem from "./NewsItem";
import { existsSync, readFileSync, writeFileSync } from "fs";

// 新しいお知らせを検出する関数
// URLが一致するお知らせが配信済みであるかを確認する
export function detectNewNewsItem(
  previousItems: Array<NewsItem>,
  latestItems: Array<NewsItem>
): Array<NewsItem> {
  const newItems: Array<NewsItem> = [];

  for (const latestItem of latestItems) {
    // URLと日付が一致するお知らせが通知済みのお知らせにあるか
    const linkMatchItem = previousItems.find(
      (previousItem) =>
        previousItem.link === latestItem.link &&
        previousItem.date.hasSame(latestItem.date, "day")
    );

    // 一致するお知らせがない場合、新しいお知らせとして扱う
    if (!linkMatchItem) newItems.push(latestItem);
  }

  return newItems;
}

// ストレージ保存用のJSON文字列を作成する関数
export function setPreviousItems(
  newsJsonPath: string,
  previousItems: Array<NewsItem>,
  newItems: Array<NewsItem>
): void {
  // 日付が本日でないものは削除
  const today = DateTime.now().setZone("Asia/Tokyo").startOf("day");
  const updatedItems = previousItems.filter((item) => item.isNewerThan(today));

  // 新しいお知らせを追加
  updatedItems.push(...newItems);

  writeFileSync(newsJsonPath, JSON.stringify(updatedItems));
}

export function getPreviousItems(newsJsonPath: string): Array<NewsItem> {
  if (!existsSync(newsJsonPath)) return [];
  const jsonInput = readFileSync(newsJsonPath, "utf-8");
  const rawItems = JSON.parse(jsonInput, (key, value) => {
    if (key === "date") return DateTime.fromISO(value);
    return value;
  });
  return rawItems.map((item: any) => new NewsItem(item.title, item.link, item.target, item.date));
}
