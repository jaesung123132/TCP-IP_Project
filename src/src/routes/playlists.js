const express = require('express');
const pool = require('../config/db');

const router = express.Router();

/** 1. 전체 플레이리스트 */
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.playlist_id, 
                p.title, 
                p.youtube_url, 
                p.user_id,
                u.username 
            FROM user_playlists p
            JOIN users u ON p.user_id = u.id
            WHERE p.status = "AVAILABLE"
        `;
        const [playlists] = await pool.query(sql);
        res.json(playlists);
    } catch (error) {
        console.error('재생목록 API 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});


/** 2. 제목 검색 API */
router.get('/search/title', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ message: '검색어가 필요합니다.' });
    }

    try {
        const searchQuery = `%${q}%`;
        const sql = `
            SELECT 
                p.playlist_id, 
                p.title, 
                p.youtube_url, 
                p.user_id,
                u.username 
            FROM user_playlists p
            JOIN users u ON p.user_id = u.id
            WHERE p.title LIKE ? 
              AND p.status = "AVAILABLE"
            LIMIT 50
        `;
        const [results] = await pool.query(sql, [searchQuery]);
        res.json(results);

    } catch (error) {
        console.error('검색 API 오류:', error);
        res.status(500).json({ message: '서버 오류 발생' });
    }
});


/** 3. 감정별 플레이리스트 */
router.get('/:emotion', async (req, res) => {
    const emotion = req.params.emotion;

    const allowed = ['happy', 'sad', 'calm', 'excited'];
    if (!allowed.includes(emotion)) {
        return res.status(400).json({ message: '잘못된 감정 유형입니다.' });
    }

    try {
        const sql = `
            SELECT 
                p.playlist_id, 
                p.title, 
                p.youtube_url, 
                p.user_id,
                u.username
            FROM user_playlists p
            JOIN playlist_emotions pe ON p.playlist_id = pe.playlist_id
            JOIN emotions e ON pe.emotion_id = e.emotion_id
            JOIN users u ON p.user_id = u.id
            WHERE e.emotion_key = ? 
              AND p.status = 'AVAILABLE'
        `;

        const emotionKey = emotion.charAt(0).toUpperCase() + emotion.slice(1);

        const [playlists] = await pool.query(sql, [emotionKey]);
        res.json(playlists);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;
