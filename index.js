const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const youtubesearchapi = require('youtube-search-api');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// New Endpoint: Search YouTube (top 5 results)
app.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query (q) missing' });

    try {
        const result = await youtubesearchapi.GetListByKeyword(q, false, 5);
        const items = result.items.filter(item => item.type === 'video'); // only videos

        const formatted = items.map((item, index) => ({
            id: index + 1,
            title: item.title,
            duration: item.length?.simpleText || 'Unknown',
            channel: item.channelTitle || 'Unknown',
            url: `https://www.youtube.com/watch?v=${item.id}`
        }));

        res.json({ results: formatted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Existing: Video info (optional)
app.get('/info', async (req, res) => {
    const { url } = req.query;
    if (!url || !ytdl.validateURL(url)) return res.status(400).json({ error: 'Invalid URL' });

    try {
        const info = await ytdl.getInfo(url);
        res.json({
            title: info.videoDetails.title,
            duration: info.videoDetails.lengthSeconds,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Download Video
app.get('/download/video', async (req, res) => {
    const { url } = req.query;
    if (!url || !ytdl.validateURL(url)) return res.status(400).send('Invalid URL');

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_') || 'video';

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        ytdl(url, { quality: 'highestvideo', filter: 'videoandaudio' }).pipe(res);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// Download Audio
app.get('/download/audio', async (req, res) => {
    const { url } = req.query;
    if (!url || !ytdl.validateURL(url)) return res.status(400).send('Invalid URL');

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_') || 'audio';

        res.header('Content-Disposition', `attachment; filename="${title}.m4a"`);
        res.header('Content-Type', 'audio/mp4');

        ytdl(url, { quality: 'highestaudio', filter: 'audioonly' }).pipe(res);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

app.get('/', (req, res) => {
    res.send(`
        <h1>YouTube API with Search + Download 🔥</h1>
        <ul>
            <li>/search?q=faded → Top 5 results</li>
            <li>/download/audio?url=... → Audio stream</li>
            <li>/download/video?url=... → Video stream</li>
        </ul>
    `);
});

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
