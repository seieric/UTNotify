import { app } from '@azure/functions';

import NewsFetcher from './lib/NewsFetcher';

app.timer('checkNewsAndPost', {
    schedule: '0 */5 * * * *',
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');
        const newsFetcher = new NewsFetcher();
        const newsItems = await newsFetcher.fetch();
        for (const newsItem of newsItems) {
            context.log(newsItem.toString());
        }
    },
});