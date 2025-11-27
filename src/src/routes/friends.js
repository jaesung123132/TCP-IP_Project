const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// 1. 친구 목록 + 받은 요청 목록 조회
router.get('/', async (req, res) => {
    const myId = req.session.userId;
    if (!myId) return res.status(401).json({ message: '로그인 필요' });

    try {
        //이미 친구인 목록 (ACCEPTED)
        const sqlFriends = `
            SELECT u.id AS friend_id, u.username AS friend_name, u.profile_image
            FROM friends f
            JOIN users u ON u.id = IF(f.user_one_id = ?, f.user_two_id, f.user_one_id)
            WHERE (f.user_one_id = ? OR f.user_two_id = ?) AND f.status = 'ACCEPTED'
        `;

        //나에게 온 친구 신청 목록 (PENDING & 내가 보낸 게 아님)
        const sqlRequests = `
            SELECT u.id AS friend_id, u.username AS friend_name, u.profile_image
            FROM friends f
            JOIN users u ON u.id = IF(f.user_one_id = ?, f.user_two_id, f.user_one_id)
            WHERE (f.user_one_id = ? OR f.user_two_id = ?) 
              AND f.status = 'PENDING'
              AND f.action_user_id != ? -- 내가 보낸 요청은 제외
        `;

        const [friends] = await pool.query(sqlFriends, [myId, myId, myId]);
        const [requests] = await pool.query(sqlRequests, [myId, myId, myId, myId]);

        // 두 데이터를 묶어서 전송
        res.json({ friends, requests });

    } catch (error) {
        console.error('친구 목록 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 2. 친구 관련 액션 (신청, 수락, 삭제) - 기존 유지
router.post('/action', async (req, res) => {
    const myId = req.session.userId;
    const { targetId, action } = req.body;

    if (!myId) return res.status(401).json({ success: false, message: '로그인 필요' });
    if (myId == targetId) return res.status(400).json({ success: false, message: '본인 불가' });

    const u1 = Math.min(myId, targetId);
    const u2 = Math.max(myId, targetId);

    try {
        if (action === 'request') {
            await pool.query(
                `INSERT INTO friends (user_one_id, user_two_id, status, action_user_id) 
                 VALUES (?, ?, 'PENDING', ?)`, [u1, u2, myId]
            );
            return res.json({ success: true, message: '친구 신청을 보냈습니다.' });

        } else if (action === 'accept') {
            await pool.query(
                `UPDATE friends SET status = 'ACCEPTED', action_user_id = ? 
                 WHERE user_one_id = ? AND user_two_id = ?`, [myId, u1, u2]
            );
            return res.json({ success: true, message: '친구 신청을 수락했습니다.' });

        } else if (action === 'delete') {
            await pool.query(
                `DELETE FROM friends WHERE user_one_id = ? AND user_two_id = ?`, [u1, u2]
            );
            return res.json({ success: true, message: '삭제되었습니다.' });
        }
        res.status(400).json({ success: false, message: '잘못된 요청' });
    } catch (error) {
        console.error('친구 액션 오류:', error);
        res.status(500).json({ success: false, message: '오류 발생' });
    }
});

module.exports = router;