const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log("mypage 라우트 로딩됨");

// ==========================================
// 1. Multer 설정 (프로필 사진 업로드용)
// ==========================================
const uploadDir = path.join(__dirname, '../public/uploads/profile');

if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.error(`[System] 폴더 생성 실패: ${err}`);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profile_${req.session.userId}_${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });


// ==========================================
// 2. 프로필(=singer_intro) 페이지 조회 라우터
// ==========================================
router.get('/', async (req, res) => {
    const userId = req.session.userId; // 나
    const pageUserId = req.query.id || userId; // 보고 있는 프로필 주인

    if (!userId) return res.redirect('/playlist/login');

    try {
        // [A] 유저 정보
        const [[user]] = await pool.query(
            `SELECT id, username, profile_image FROM users WHERE id = ?`,
            [pageUserId]
        );

        // [B] 플레이리스트
        const [playlists] = await pool.query(
            `SELECT playlist_id, title, youtube_url, created_at 
             FROM user_playlists
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [pageUserId]
        );

        const processed = playlists.map(p => {
            try {
                const u = new URL(p.youtube_url);
                return {
                    ...p,
                    videoId: u.searchParams.get("v") || "",
                    listId: u.searchParams.get("list") || ""
                };
            } catch {
                return { ...p, videoId: "", listId: "" };
            }
        });

        // [C] 친구 관계 상태 정밀 분석
        let relationStatus = 'NONE'; // 기본값

        if (userId != pageUserId) {
            const [[relation]] = await pool.query(
                `SELECT * FROM friends 
                 WHERE (user_one_id = ? AND user_two_id = ?) 
                    OR (user_one_id = ? AND user_two_id = ?)`,
                [userId, pageUserId, pageUserId, userId]
            );

            if (relation) {
                if (relation.status === 'ACCEPTED') {
                    relationStatus = 'FRIEND';
                } else if (relation.status === 'PENDING') {
                    if (relation.action_user_id == userId) {
                        relationStatus = 'PENDING_SENT'; // 내가 보냄
                    } else {
                        relationStatus = 'PENDING_RECEIVED'; // 내가 받음
                    }
                }
            }
        }

        const profileName = user ? user.username : "알 수 없음";
        const profileImage = (user && user.profile_image)
            ? user.profile_image
            : "/uploads/profile/Default_profile.png";

        // [D] 데이터 전달
        res.render("singer_intro", {
            profileName: profileName,
            profileImage: profileImage,
            playlists: processed,
            isMe: userId == pageUserId,
            relationStatus: relationStatus,
            targetUserId: pageUserId
        });

    } catch (err) {
        console.error("Singer_intro Load Error:", err);
        res.status(500).send("서버 오류");
    }
});


// ==========================================
// 3. 프로필 사진 업로드 처리
// ==========================================
router.post('/profile/upload', upload.single('profile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "파일이 없습니다." });
        }
        const filePath = `/uploads/profile/${req.file.filename}`;

        await pool.query(
            "UPDATE users SET profile_image = ? WHERE id = ?",
            [filePath, req.session.userId]
        );

        res.json({ success: true, image: filePath });
    } catch (err) {
        console.error("프로필 업로드 오류:", err);
        res.status(500).json({ success: false, message: "업로드 실패" });
    }
});

module.exports = router;