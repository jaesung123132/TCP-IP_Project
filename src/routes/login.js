// routes/login.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const router = express.Router();

// 로그인 페이지 GET
router.get('/', (req, res) => {
    res.render('index');
});

// 로그인 POST(JSON 방식)
router.post('/', async (req, res) => {
    const { _id, _pwd } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [users] = await pool.query(sql, [_id]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "아이디 또는 비밀번호가 틀립니다."
            });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(_pwd, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "아이디 또는 비밀번호가 틀립니다."
            });
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        return res.json({
            success: true,
            redirect: "/playlist/main"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "서버 오류"
        });
    }
});

module.exports = router;
