import { app } from '@azure/functions';

import NewsFetcher from './lib/NewsFetcher';
import NewsPoster from './lib/NewsPoster';

app.timer('checkNewsAndPost', {
    schedule: '0 */5 * * * *',
    handler: async (myTimer, context) => {
        // お知らせを取得
        const newsFetcher = new NewsFetcher();
        const newsItems = await newsFetcher.fetch();

        // 本日のお知らせを絞り込む
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const latestItems = newsItems.filter((item) => item.isNewerThan(today));

        if (latestItems.length === 0) return;

        // お知らせを投稿
        const newsPoster = new NewsPoster();
        for (const newsItem of latestItems) {
            context.log(`[New News]${newsItem.toString()}`);
            newsPoster.post(newsItem);
        }
    },
});