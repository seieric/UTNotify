import { app, input, output, InvocationContext } from "@azure/functions";

import NewsFetcher from "./lib/NewsFetcher";
import NewsPoster from "./lib/NewsPoster";
import { createStorageJsonString, detectNewNewsItem } from "./lib/utils";

const storageBlobOptions = {
    path: "newsitems.json",
    connection: process.env.BLOB_STORAGE_CONNECTION,
}
const blobInput = input.storageBlob(storageBlobOptions);
const blobOutput = output.storageBlob(storageBlobOptions);

app.timer("checkNewsAndPost", {
  schedule: "0 */5 * * * *",
  handler: async (myTimer, context: InvocationContext) => {
    // 最新のお知らせを取得
    const newsFetcher = new NewsFetcher();
    const newsItems = await newsFetcher.fetch();

    // 本日のお知らせを絞り込む
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const latestItems = newsItems.filter((item) => item.isNewerThan(today));

    if (latestItems.length === 0) return;

    // ストレージから本日配信したお知らせを取得
    const blobContent = await context.extraInputs.get(blobInput);
    const previousItems = blobContent ? JSON.parse(blobContent as string) : [];

    // 新しいお知らせを検出
    const newItems = detectNewNewsItem(previousItems, latestItems);

    // 本日のお知らせをストレージに保存
    context.extraOutputs.set(blobOutput, createStorageJsonString(previousItems, newItems));

    // お知らせを投稿
    const newsPoster = new NewsPoster();
    for (const item of newItems) {
      context.log(`[New News]${item.toString()}`);
      newsPoster.post(item);
    }
    context.log(`Posted ${newItems.length}/${latestItems.length} news items. Total ${previousItems.length + newItems.length} news items posted today.`);
  },
});
