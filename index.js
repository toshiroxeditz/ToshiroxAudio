const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Optional: Video info endpoint
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

// Video Download (highest quality with audio)
app.get('/download/video', async (req, res) => {
    const { url } = req.query;
    if (!url || !ytdl.validateURL(url)) return res.status(400).send('Invalid URL');

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_') || 'video';

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        ytdl(url, {
            quality: 'highestvideo',
            filter: 'videoandaudio' // merged video + audio
        }).pipe(res);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

// Audio Download (highest audio as mp3-like)
app.get('/download/audio', async (req, res) => {
    const { url } = req.query;
    if (!url || !ytdl.validateURL(url)) return res.status(400).send('Invalid URL');

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '_') || 'audio';

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'audio/mp4'); // ytdl-core mp4 audio দেয় (m4a)

        ytdl(url, {
            quality: 'highestaudio',
            filter: 'audioonly'
        }).pipe(res);
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});

app.get('/', (req, res) => {
    res.send('YouTube Downloader API (ytdl-core) Running! Use /download/video?url=... or /download/audio?url=...');
});

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});