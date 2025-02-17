import { app, input, output, InvocationContext } from "@azure/functions";

import NewsFetcher from "./lib/NewsFetcher";
import NewsPoster from "./lib/NewsPoster";
import { detectNewNewsItem } from "./lib/utils";

const blobInput = input.storageBlob({
  path: "samples-workitems/newsitems.json",
  connection: "MyStorageConnectionAppSetting",
});

const blobOutput = output.storageBlob({
  // 任意のパスやファイル名を設定してください
  path: "samples-workitems/newsitems.json",
  connection: "MyStorageConnectionAppSetting",
});

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
    const updatedItems = previousItems.concat(newItems);
    context.extraOutputs.set(blobOutput, JSON.stringify(updatedItems));

    // お知らせを投稿
    const newsPoster = new NewsPoster();
    for (const item of newItems) {
      context.log(`[New News]${item.toString()}`);
      newsPoster.post(item);
    }
  },
});
