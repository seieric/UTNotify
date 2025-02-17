import NewsItem from "./NewsItem";

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
        previousItem.date === latestItem.date
    );

    // 一致するお知らせがない場合、新しいお知らせとして扱う
    if (!linkMatchItem) newItems.push(latestItem);
  }

  return newItems;
}

// ストレージ保存用のJSON文字列を作成する関数
export function createStorageJsonString(
  previousItems: Array<NewsItem>,
  newItems: Array<NewsItem>
): string {
  // 日付が本日でないものは削除
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const updatedItems = previousItems.filter((item) => item.isNewerThan(today));

  // 新しいお知らせを追加
  updatedItems.push(...newItems);
  return JSON.stringify(updatedItems);
}
