const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // DB 연결 추가

// 1. 현재 로그인한 유저 정보 확인
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.json({ isLoggedIn: false });
    }

    res.json({
        isLoggedIn: true,
        userId: req.session.userId,
        username: req.session.username
    });
});

// 2. 로그아웃
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('세션 삭제 오류:', err);
            return res.status(500).json({ success: false, message: '로그아웃 실패' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// 실제 검색 API 구현
router.get('/search', async (req, res) => {
    const q = req.query.q; // 검색어

    // 검색어가 없으면 빈 배열 반환
    if (!q) {
        return res.json([]);
    }

    try {
        // DB에서 제목(title)에 검색어가 포함된 플레이리스트 찾기
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
              AND p.status = 'AVAILABLE'
            ORDER BY p.created_at DESC
        `;

        const searchQuery = `%${q}%`; // 앞뒤로 % 붙여서 부분 검색 허용
        const [results] = await pool.query(sql, [searchQuery]);

        res.json(results);

    } catch (error) {
        console.error('검색 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;