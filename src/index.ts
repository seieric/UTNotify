import { app, input, output, InvocationContext } from "@azure/functions";
import { DateTime } from "luxon";

import NewsFetcher from "./lib/NewsFetcher";
import NewsPoster from "./lib/NewsPoster";
import { createStorageJsonString, detectNewNewsItem } from "./lib/utils";

const storageBlobOptions = {
  path: "utnotify/newsitems.json",
  connection: process.env.BLOB_STORAGE_CONNECTION,
};
const blobInput = input.storageBlob(storageBlobOptions);
const blobOutput = output.storageBlob(storageBlobOptions);

app.timer("checkNewsAndPost", {
  schedule: "0 */5 * * * *",
  handler: async (myTimer, context: InvocationContext) => {
    const now = DateTime.now().setZone("Asia/Tokyo");
    context.log(`Execution started. Current time: ${now.toISO()}`);

    // 最新のお知らせを取得
    const newsFetcher = new NewsFetcher();
    const newsItems = await newsFetcher.fetch();
    context.log(`Total fetched items: ${newsItems.length}`);

    // 本日のお知らせを絞り込む
    const today = now.startOf("day");
    const latestItems = newsItems.filter((item) => item.isNewerThan(today));
    context.log(`Today's items: ${latestItems.length}`);

    // ストレージから本日配信したお知らせを取得
    const blobContent = await context.extraInputs.get(blobInput);
    const previousItems = blobContent ? JSON.parse(blobContent as string) : [];
    context.log(`Previously posted items: ${previousItems.length}`);
    for (const item of previousItems) {
      context.log(`[Previous News]${item.toString()} (${item.date.toISO()})`);
    }

    // 新しいお知らせを検出
    const newItems = detectNewNewsItem(previousItems, latestItems);

    // 本日のお知らせをストレージに保存
    context.extraOutputs.set(
      blobOutput,
      createStorageJsonString(previousItems, newItems)
    );

    // お知らせを投稿
    const newsPoster = new NewsPoster();
    for (const item of newItems) {
      context.log(`[New News]${item.toString()} (${item.date.toISO()})`);
      newsPoster.post(item);
    }
    context.log(
      `Posted items: ${newItems.length}/${
        latestItems.length
      } Total items posted today: ${previousItems.length + newItems.length}`
    );
  },
});
