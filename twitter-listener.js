const axios = require('axios');
const Parser = require('rss-parser');

class TwitterListener {
    constructor(username, checkOldTweets = false) {
        this.username = username;
        this.lastTweetId = null;
        this.lastTweetDate = null;
        this.checkOldTweets = checkOldTweets;
        this.parser = new Parser();
        this.instances = [
            'https://nitter.poast.org',//Good
            'https://xcancel.com',//Okay
            'https://nitter.privacydev.net',//Rarely working
            'https://nitter.lucabased.xyz',//Not working
            'https://nitter.woodland.cafe',//Not working
            'https://nitter.1d4.us' //Not working
            //Add more instances here
        ];
        this.instanceStatus = new Map(this.instances.map(instance => [instance, true]));
        this.retryDelay = 5000;
    }

    getRssUrls() {
        return this.instances.map(instance => `${instance}/${this.username}/rss`);
    }

    async checkRssFeed(rssUrl) {
        try {
            const instance = new URL(rssUrl).origin;
            const wasDown = !this.instanceStatus.get(instance);
            
            console.log(`Checking: ${rssUrl.split('/')[2]}`);
            const feed = await this.parser.parseURL(rssUrl);
            
            // If instance was down and is now up, log recovery
            if (wasDown) {
                console.log(`Instance recovered: ${new URL(rssUrl).hostname}`);
                this.instanceStatus.set(instance, true);
            }

            if (!feed.items || feed.items.length === 0) {
                return null;
            }

            const originalTweets = feed.items.filter(item => 
                !item.title.includes('RT by') && 
                !item.title.includes('retweeted') &&
                item.creator === `@${this.username}`
            );

            if (originalTweets.length === 0) {
                return null;
            }

            const latestTweet = originalTweets[0];
            const tweetId = latestTweet.link.split('/status/')[1].split('#')[0];

            return {
                text: latestTweet.content
                    .replace(/<[^>]+>/g, '')
                    .replace(/\n\n/g, '\n')
                    .trim(),
                id: tweetId,
                date: new Date(latestTweet.pubDate),
                link: latestTweet.link,
                creator: latestTweet.creator,
                instance: new URL(rssUrl).hostname
            };

        } catch (error) {
            const instance = new URL(rssUrl).origin;
            if (this.instanceStatus.get(instance)) {
                console.error(`Instance down: ${new URL(rssUrl).hostname} (${error.message})`);
                this.instanceStatus.set(instance, false);
            }
            return null;
        }
    }

    async getLatestTweet() {
        const rssUrls = this.getRssUrls();
        const results = await Promise.all(
            rssUrls.map(url => this.checkRssFeed(url))
        );

        const validTweets = results
            .filter(tweet => tweet !== null)
            .sort((a, b) => {
                return this.checkOldTweets ? 
                    a.date - b.date : 
                    b.date - a.date;
            });

        if (validTweets.length === 0) {
            console.log('No valid tweets found from any instance');
            return null;
        }

        const workingCount = Array.from(this.instanceStatus.values()).filter(status => status).length;
        console.log(`Working instances: ${workingCount}/${this.instances.length}`);

        return validTweets[0];
    }

    async checkForNewTweets() {
        const tweet = await this.getLatestTweet();
        
        if (!tweet) {
            return;
        }

        const isNewTweet = this.checkOldTweets ?
            // For old tweets: check if the date is older than the last tweet
            (!this.lastTweetDate || tweet.date < this.lastTweetDate) :
            // For new tweets: check if the ID is different and date is newer
            (tweet.id !== this.lastTweetId && (!this.lastTweetDate || tweet.date > this.lastTweetDate));

        if (isNewTweet) {
            if (this.lastTweetId) {
                console.log('\n=== ' + (this.checkOldTweets ? 'Old' : 'New') + ' Tweet Detected! ===');
                console.log('Content:', tweet.text);
                console.log('Tweet ID:', tweet.id);
                console.log('Date:', tweet.date);
                console.log('Source:', tweet.instance);
                console.log('URL:', `https://twitter.com/${this.username}/status/${tweet.id}`);
                console.log('========================\n');
            }
            this.lastTweetId = tweet.id;
            this.lastTweetDate = tweet.date;
        }
    }

    async start() {
        console.log(`Starting Twitter listener for @${this.username}`);
        console.log(`Mode: Looking for ${this.checkOldTweets ? 'old' : 'new'} tweets`);
        console.log(`Checking ${this.instances.length} RSS feeds every 30 seconds`);
        
        const initialTweet = await this.getLatestTweet();
        if (initialTweet) {
            this.lastTweetId = initialTweet.id;
            this.lastTweetDate = initialTweet.date;
            console.log('\n=== Initial Tweet ===');
            console.log('ID:', initialTweet.id);
            console.log('Content:', initialTweet.text);
            console.log('Date:', initialTweet.date);
            console.log('Source:', initialTweet.instance);
            console.log('==================\n');
        }

        setInterval(() => {
            this.checkForNewTweets();
        }, 30000);
    }
}

// Usage examples:
// For new tweets (default):
const listener = new TwitterListener('insert_username_here');
// Or for old tweets:
// const listener = new TwitterListener('insert_username_here', true);

listener.start().catch(console.error);

process.on('SIGINT', () => {
    console.log('Stopping Twitter listener...');
    process.exit();
});