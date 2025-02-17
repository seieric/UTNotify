import NewsItem from "./NewsItem";

// 新しいお知らせを検出する関数
// URLが一致するお知らせが配信済みであるかを確認する
export function detectNewNewsItem(
  previousItems: Array<NewsItem>,
  latestItems: Array<NewsItem>
): Array<NewsItem> {
  const newItems: Array<NewsItem> = [];

  for (const latestItem of latestItems) {
    // URLが一致するお知らせが通知済みのお知らせにあるか
    const linkMatchItem = previousItems.find(
      (previousItem) => previousItem.link === latestItem.link
    );

    // URLが一致するお知らせがない場合、新しいお知らせとして扱う
    if (!linkMatchItem) newItems.push(latestItem);
  }

  return newItems;
}
