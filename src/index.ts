import { app } from '@azure/functions';

import NewsFetcher from './lib/NewsFetcher';

app.timer('checkNewsAndPost', {
    schedule: '0 */5 * * * *',
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');
        const newsFetcher = new NewsFetcher();
        const newsItems = await newsFetcher.fetch();
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const latestItems = newsItems.filter((item) => item.isNewerThan(today));
        for (const newsItem of latestItems) {
            context.log(newsItem.toString());
        }
    },
});