const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 업로드 페이지
router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/playlist/login');
    }
    res.render('upload');
});

// 업로드 처리
router.post('/', async (req, res) => {
    const userId = req.session.userId;
    const { title, url, emotion } = req.body;

    if (!userId) {
        return res.json({ success: false, message: "로그인 필요" });
    }
    if (!title || !url || !emotion) {
        return res.json({ success: false, message: "모든 항목 입력 필요" });
    }

    try {
        const sqlPlaylist = `
            INSERT INTO user_playlists (title, youtube_url, user_id, status)
            VALUES (?, ?, ?, 'AVAILABLE')
        `;
        const [result] = await pool.query(sqlPlaylist, [title, url, userId]);
        const playlistId = result.insertId;

        const [emoRows] = await pool.query(
            'SELECT emotion_id FROM emotions WHERE emotion_key = ?',
            [emotion]
        );

        if (emoRows.length > 0) {
            const emotionId = emoRows[0].emotion_id;
            await pool.query(
                'INSERT INTO playlist_emotions (playlist_id, emotion_id) VALUES (?, ?)',
                [playlistId, emotionId]
            );
        }

        return res.json({ success: true });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "서버 오류" });
    }
});

module.exports = router;
