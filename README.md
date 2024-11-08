# XL (X Listener)

<div align="center">

![XL Logo](https://via.placeholder.com/150x150.png?text=XL)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/openseb/XL/graphs/commit-activity)

*A lightweight, resilient X/Twitter listener using Nitter RSS feeds*

</div>

## 🚨 Disclaimer

This project is for **educational purposes only**. It demonstrates RSS feed parsing, parallel processing, and error handling in Node.js. Please respect X/Twitter's terms of service and rate limits in production environments.

## ✨ Features

- 🔄 Real-time tweet monitoring
- 🔙 Backwards tweet discovery mode
- ⚡ Parallel processing of multiple Nitter instances
- 🔄 Automatic instance rotation and recovery
- 🛡️ Robust error handling
- 📊 Instance health monitoring
- 🚫 Retweet filtering
- ⏰ Configurable check intervals

## 🚀 Quick Start
Clone the repository
```bash
git clone https://github.com/openseb/XL.git
```
Install dependencies
```bash
cd XL
npm install
```
Start monitoring (new tweets)
```bash
node twitter-listener.js
```
Or monitor old tweets
Edit twitter-listener.js and set checkOldTweets to true

## 💻 Usage
```javascript
// Monitor new tweets (default)
const listener = new TwitterListener('username');
listener.start();
// Monitor old tweets
const listener = new TwitterListener('username', true);
listener.start();
```
## 🛠️ Configuration

The listener can be configured by modifying the following parameters:
```javascript
this.instances = [
'https://nitter.poast.org', // Primary
'https://xcancel.com', // Secondary
// Add more Nitter instances here
];
this.retryDelay = 5000; // Retry delay in ms
// Check interval in start() method (default: 30000ms)
```
## 📝 Output Example
```bash
Starting Twitter listener for @username
Mode: Looking for new tweets
Checking 6 RSS feeds every 30 seconds
=== Initial Tweet ===
ID: 1234567890123456789
Content: Hello, world!
Date: 2024-02-08T12:00:00.000Z
Source: nitter.poast.org
==================
Working instances: 2/6
```
## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Notes

- This project uses Nitter instances which may have varying reliability
- Some instances might be rate-limited or temporarily unavailable
- The script will automatically rotate through available instances
- For educational purposes only - not recommended for production use

## 🙏 Acknowledgments

- [Nitter](https://github.com/zedeus/nitter) - Alternative Twitter front-end
- [RSS Parser](https://github.com/rbren/rss-parser) - RSS feed parsing library
- Various Nitter instance maintainers

## 📚 Dependencies

- Node.js >= 18.x
- axios
- rss-parser

## 🔗 Related Projects

- [Nitter](https://github.com/zedeus/nitter)
- [RSS Parser](https://github.com/rbren/rss-parser)

---

<div align="center">
Made with ❤️ by <a href="https://github.com/openseb">OpenSeb</a>
</div>
