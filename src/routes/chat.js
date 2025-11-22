// routes/chat.js
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

/* 채팅방 생성 or 가져오기 */
router.post('/room', async (req, res) => {
    const myId = req.session.userId;
    const { friendId } = req.body;

    if (!myId || !friendId) {
        return res.status(400).json({ message: '사용자 ID가 필요합니다.' });
    }

    const [u1, u2] = [Math.min(myId, friendId), Math.max(myId, friendId)];

    try {
        let [room] = await pool.query(
            'SELECT room_id FROM chat_rooms WHERE user_one_id = ? AND user_two_id = ?',
            [u1, u2]
        );

        let roomId;
        if (room.length > 0) roomId = room[0].room_id;
        else {
            const [result] = await pool.query(
                'INSERT INTO chat_rooms (user_one_id, user_two_id) VALUES (?, ?)',
                [u1, u2]
            );
            roomId = result.insertId;
        }

        const [friend] = await pool.query('SELECT username FROM users WHERE id = ?', [friendId]);

        res.json({
            roomId,
            friendName: friend.length > 0 ? friend[0].username : '알 수 없음'
        });
    } catch {
        res.status(500).json({ message: '서버 오류' });
    }
});

/* 채팅 메시지 기록 */
router.get('/history/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const myId = req.session.userId;

    if (!myId) return res.status(401).json({ message: '로그인이 필요합니다.' });

    try {
        const sql = 'SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC';
        const [messages] = await pool.query(sql, [roomId]);
        res.json(messages);
    } catch {
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;
