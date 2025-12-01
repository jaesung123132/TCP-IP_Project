// routes/main.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log("===== /main GET 라우터 진입 =====");
    console.log("세션 정보:", req.session);

    if (!req.session.userId) {
        console.log("→ userId 없음, /login 으로 리다이렉트함");
        return res.redirect('/playlist/login');
    }

    console.log("→ userId 존재! main.ejs 렌더링 시도");
    res.render('main', (err, html) => {
        if (err) {
            console.error("!!! main.ejs 렌더링 오류 발생 !!!");
            console.error(err);
            return res.status(500).send("main 렌더링 오류");
        }
        console.log("→ main.ejs 렌더 성공");
        res.send(html);
    });
});

module.exports = router;
