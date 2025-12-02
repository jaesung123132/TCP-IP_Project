const express = require('express');
const path = require('path');
const net = require('net');
const http = require('http');
const session = require('express-session');
const { WebSocketServer } = require('ws');
const pool = require('./config/db');
const uploadRouter = require('./routes/upload');

const app = express();
const port = 3003;

// 세션 설정
const sessionMiddleware = session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
app.use(sessionMiddleware);

// 프로필 이미지 로드 미들웨어
app.use(async (req, res, next) => {
    res.locals.myProfileImg = null;

    if (req.session.userId) {
        try {
            const [rows] = await pool.query('SELECT profile_image FROM users WHERE id = ?', [req.session.userId]);
            if (rows.length > 0) {
                res.locals.myProfileImg = rows[0].profile_image || '/playlist/uploads/profile/Default_profile.png';
            }
        } catch (err) {
            console.error('프로필 이미지 조회 실패:', err);
        }
    }
    next();
});

// 정적 파일 / 파서 / 뷰 엔진 설정
app.use('/playlist', express.static(path.join(__dirname, 'public')));
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

app.use('/playlist/login', loginRouter);
app.use('/playlist/api', authRouter);
app.use('/playlist/main', mainRouter);
app.use('/playlist/api/friends', friendsRouter);
app.use('/playlist/api/playlists', playlistsRouter);
app.use('/playlist/singer_intro', mypageRouter);
app.use('/playlist/api/chat', chatRouter);
app.use('/playlist/upload', uploadRouter);

app.get('/playlist/chat', (req, res) => res.render('chat'));

// 404 처리
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

// 웹소켓 연결 처리
wss.on('connection', (ws, req) => {
    const currentUserId = ws.session.userId;

    if (!userConnections.has(currentUserId)) {
        userConnections.set(currentUserId, new Set());
    }
    userConnections.get(currentUserId).add(ws);
    console.log(`[WS 서버] 유저 ${currentUserId} 접속`);

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
            }

            // [입력 중 상태 전송] 
            if (data.type === 'typing') {
                const { roomId, isTyping } = data;
                if (chatRooms.has(roomId)) {
                    chatRooms.get(roomId).forEach(client => {

                        if (client !== ws && client.readyState === ws.OPEN) {
                            client.send(JSON.stringify({
                                type: 'typing_status',
                                senderId: currentUserId,
                                isTyping: isTyping
                            }));
                        }
                    });
                }
            }

            // [채팅 메시지 전송]
            if (data.type === 'chat') {
                const { roomId, content, recipientId } = data;
                const senderId = currentUserId;

                // DB 저장
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

                // 같은 방에 있는 사람들에게 전송
                if (chatRooms.has(roomId)) {
                    chatRooms.get(roomId).forEach(client => {
                        if (client.readyState === ws.OPEN) {
                            client.send(JSON.stringify(savedMessage));
                        }
                    });
                }

                // 채팅방 밖에 있는 친구에게 알림 전송
                const recipientSocketSet = userConnections.get(recipientId);
                if (recipientSocketSet) {
                    let recipientIsInRoom = false;
                    if (chatRooms.has(roomId)) {
                        recipientSocketSet.forEach(clientWs => {
                            if (chatRooms.get(roomId).has(clientWs)) recipientIsInRoom = true;
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
                    broadcastStatusToFriends(currentUserId, false);
                }
            }

            chatRooms.forEach((clients, roomId) => {
                if (clients.has(ws)) clients.delete(ws);
            });
        }
    });
});

async function broadcastStatusToFriends(userId, isOnline) {
    try {
        const statusType = isOnline ? 'friend_online' : 'friend_offline';
        const sql = `SELECT IF(user_one_id = ?, user_two_id, user_one_id) AS friend_id FROM friends WHERE (user_one_id = ? OR user_two_id = ?) AND status = 'ACCEPTED'`;
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
        console.error('친구 상태 오류:', error);
    }
}

async function getFriendsOnlineStatus(userId) {
    const statuses = {};
    const sql = `SELECT IF(user_one_id = ?, user_two_id, user_one_id) AS friend_id FROM friends WHERE (user_one_id = ? OR user_two_id = ?) AND status = 'ACCEPTED'`;
    const [friends] = await pool.query(sql, [userId, userId, userId]);
    friends.forEach(friend => {
        statuses[friend.friend_id] = userConnections.has(friend.friend_id);
    });
    return statuses;
}

// // 핫스팟 IP로 서버 실행
server.listen(port, () => {
    console.log(`Express 웹 서버가 실행중입니다.`);
    console.log(`- 내부 접속: http://localhost:${port}`);
    //     console.log(`- 외부 접속: http://172.20.10.3:${port}`);
});

// TCP 서버 (모니터링용)
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
