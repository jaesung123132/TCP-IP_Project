const express = require('express');
const path = require('path');
const net = require('net');
const http = require('http');
const session = require('express-session');
const { WebSocketServer } = require('ws');
const pool = require('./config/db');
const uploadRouter = require('./routes/upload');

const app = express();
const port = 3000;

// 세션 설정
const sessionMiddleware = session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
app.use(sessionMiddleware);

// ==========================================
// [추가됨] 모든 페이지에서 내 프로필 사진을 쓸 수 있게 해주는 미들웨어
// ==========================================
app.use(async (req, res, next) => {
    res.locals.myProfileImg = null; // 기본값 (비로그인 상태)

    if (req.session.userId) {
        try {
            // DB에서 현재 로그인한 유저의 프로필 이미지 조회
            const [rows] = await pool.query('SELECT profile_image FROM users WHERE id = ?', [req.session.userId]);
            
            if (rows.length > 0) {
                // 이미지가 있으면 사용, 없으면 기본 이미지(Default_profile) 사용
                // (만약 실제 파일이 .jpg라면 아래 확장자를 .jpg로 수정해주세요!)
                res.locals.myProfileImg = rows[0].profile_image || '/uploads/profile/Default_profile.png';
            }
        } catch (err) {
            console.error('프로필 이미지 조회 실패:', err);
        }
    }
    next();
});

// 정적 파일 / 파서 / 뷰 엔진 설정
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 라우터 등록
const loginRouter = require('./routes/login');
const authRouter = require('./routes/auth');
const mainRouter = require('./routes/main');
const friendsRouter = require('./routes/friends');
const playlistsRouter = require('./routes/playlists');
const mypageRouter = require('./routes/mypage');
const chatRouter = require('./routes/chat');

app.use('/login', loginRouter);
app.use('/api', authRouter);
app.use('/main', mainRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/playlists', playlistsRouter);
app.use('/singer_intro', mypageRouter);
app.use('/api/chat', chatRouter);
app.use('/upload', uploadRouter);

app.get('/chat', (req, res) => res.render('chat'));

// 404
app.use((req, res) => res.status(404).render('404'));

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    sessionMiddleware(request, new http.ServerResponse(request), () => {
        if (!request.session.userId) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
            ws.session = request.session;
            wss.emit('connection', ws, request);
        });
    });
});

const chatRooms = new Map();
const userConnections = new Map();

wss.on('connection', (ws, req) => {
    const currentUserId = ws.session.userId;

    if (!userConnections.has(currentUserId)) {
        userConnections.set(currentUserId, new Set());
    }
    userConnections.get(currentUserId).add(ws);
    console.log(`[WS 서버] 유저 ${currentUserId}가 인증되었습니다. (현재 ${userConnections.get(currentUserId).size}개 연결)`);

    broadcastStatusToFriends(currentUserId, true);

    getFriendsOnlineStatus(currentUserId).then(statuses => {
        ws.send(JSON.stringify({ type: 'friend_status_list', statuses: statuses }));
    });

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'join') {
                const currentRoomId = data.roomId;
                if (!chatRooms.has(currentRoomId)) {
                    chatRooms.set(currentRoomId, new Set());
                }
                chatRooms.get(currentRoomId).add(ws);
                console.log(`[WS 서버] 클라이언트가 ${currentRoomId}번 방에 참여했습니다.`);
            }

            if (data.type === 'chat') {
                const { roomId, content, recipientId } = data;
                const senderId = currentUserId;

                const sql = 'INSERT INTO chat_messages (room_id, sender_id, content) VALUES (?, ?, ?)';
                const [result] = await pool.query(sql, [roomId, senderId, content]);
                const messageId = result.insertId;

                const savedMessage = {
                    type: 'chat',
                    message_id: messageId,
                    room_id: roomId,
                    sender_id: senderId,
                    content: content,
                    created_at: new Date().toISOString()
                };

                if (chatRooms.has(roomId)) {
                    chatRooms.get(roomId).forEach(client => {
                        if (client.readyState === ws.OPEN) {
                            client.send(JSON.stringify(savedMessage));
                        }
                    });
                }

                const recipientSocketSet = userConnections.get(recipientId);
                if (recipientSocketSet) {
                    let recipientIsInRoom = false;
                    if (chatRooms.has(roomId)) {
                        recipientSocketSet.forEach(clientWs => {
                            if (chatRooms.get(roomId).has(clientWs)) {
                                recipientIsInRoom = true;
                            }
                        });
                    }

                    if (!recipientIsInRoom) {
                        recipientSocketSet.forEach(clientWs => {
                            clientWs.send(JSON.stringify({
                                type: 'new_message_notification',
                                senderId: senderId
                            }));
                        });
                    }
                }
            }
        } catch (error) {
            console.error('[WS 서버] 메시지 처리 오류:', error);
        }
    });

    ws.on('close', () => {
        if (currentUserId) {
            const userSockets = userConnections.get(currentUserId);
            if (userSockets) {
                userSockets.delete(ws);
                if (userSockets.size === 0) {
                    userConnections.delete(currentUserId);
                    console.log(`[WS 서버] 유저 ${currentUserId} 연결 모두 종료.`);
                    broadcastStatusToFriends(currentUserId, false);
                }
            }
        }
    });
});

async function broadcastStatusToFriends(userId, isOnline) {
    try {
        const statusType = isOnline ? 'friend_online' : 'friend_offline';

        const sql = `
            SELECT IF(user_one_id = ?, user_two_id, user_one_id) AS friend_id
            FROM friends
            WHERE (user_one_id = ? OR user_two_id = ?) AND status = 'ACCEPTED'
        `;
        const [friends] = await pool.query(sql, [userId, userId, userId]);

        friends.forEach(friend => {
            const friendSocketSet = userConnections.get(friend.friend_id);
            if (friendSocketSet) {
                friendSocketSet.forEach(friendWs => {
                    if (friendWs && friendWs.readyState === friendWs.OPEN) {
                        friendWs.send(JSON.stringify({ type: statusType, userId: userId }));
                    }
                });
            }
        });
    } catch (error) {
        console.error('친구 상태 브로드캐스트 오류:', error);
    }
}

async function getFriendsOnlineStatus(userId) {
    const statuses = {};
    const sql = `
        SELECT IF(user_one_id = ?, user_two_id, user_one_id) AS friend_id
        FROM friends
        WHERE (user_one_id = ? OR user_two_id = ?) AND status = 'ACCEPTED'
    `;
    const [friends] = await pool.query(sql, [userId, userId, userId]);
    friends.forEach(friend => {
        statuses[friend.friend_id] = userConnections.has(friend.friend_id);
    });
    return statuses;
}

server.listen(port, () => {
    console.log(`Express 웹 서버가 http://localhost:${port}/login 에서 실행중입니다.`);
});

const allClients = [];
const tcpServer = net.createServer((socket) => {
    console.log('[TCP 서버] 클라이언트가 접속했습니다.');
    socket.write('서버 상태 모니터링을 시작합니다.\n');
    allClients.push(socket);
    socket.on('data', (data) => {
        console.log(`[TCP 서버] 클라이언트로부터 받음: ${data.toString().trim()}`);
    });
    socket.on('end', () => {
        console.log('[TCP 서버] 클라이언트 접속이 종료되었습니다.');
        allClients.splice(allClients.indexOf(socket), 1);
    });
    socket.on('error', (err) => {
        console.log(`[TCP 서버] 에러: ${err.message}`);
        allClients.splice(allClients.indexOf(socket), 1);
    });
});
setInterval(() => {
    const statusMessage = `[서버 푸시] 상태: OK (시간: ${new Date().toLocaleTimeString()})\n`;
    allClients.forEach((client) => {
        client.write(statusMessage);
    });
}, 5000);
tcpServer.listen(5000, () => {
    console.log('TCP 소켓 서버가 5000번 포트에서 실행 중입니다.');
}); 