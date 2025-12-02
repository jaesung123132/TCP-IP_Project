document.addEventListener("DOMContentLoaded", async () => {
    const input = document.getElementById("chatInput");
    const box = document.getElementById("chatBox");
    const sendBtn = document.getElementById("sendBtn");

    // [추가] 입력 중 표시를 위한 DOM 생성
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerText = "상대방이 입력하고 있습니다...";
    document.querySelector('.chat-wrapper').appendChild(typingIndicator);

    let ws;
    let myId = null;
    let friendId = null;
    let roomId = null;
    let typingTimeout = null; // 입력 중지 감지용 타이머

    try {
        const params = new URLSearchParams(window.location.search);
        friendId = parseInt(params.get('friendId'));
        if (!friendId) throw new Error('상대방 정보 없음');

        const meResponse = await fetch('/playlist/api/me');
        const me = await meResponse.json();
        if (!me.isLoggedIn) {
            window.location.href = '/playlist/';
            return;
        }
        myId = me.userId;

        roomId = await getRoomId(myId, friendId);
        await loadChatHistory(roomId);
        connectWebSocket(roomId);

    } catch (error) {
        console.error("오류:", error);
        if (box) box.innerHTML = "<div style='text-align:center; padding:20px; color:#888;'>연결 실패</div>";
    }

    function extractYouTubeId(url) {
        if (!url) return null;
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
            if (u.hostname.includes('youtu.be')) return u.pathname.replace("/", "");
        } catch (e) { }
        return null;
    }

    async function getRoomId(myId, friendId) {
        const response = await fetch('/playlist/api/chat/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ myId, friendId })
        });
        const data = await response.json();
        const titleEl = document.querySelector('.chat-title');
        if (titleEl) titleEl.textContent = `${data.friendName}님`;
        return data.roomId;
    }

    async function loadChatHistory(roomId) {
        const response = await fetch(`/playlist/api/chat/history/${roomId}`);
        const messages = await response.json();
        box.innerHTML = '';
        messages.forEach(appendMessage);
        box.scrollTop = box.scrollHeight;
    }

    function connectWebSocket(roomId) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/playlist/`);

        ws.onopen = () => {
            console.log("WS 연결됨");
            ws.send(JSON.stringify({ type: 'join', roomId: roomId }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            // 일반 메시지 수신
            if (message.type === 'chat' && parseInt(message.room_id) === parseInt(roomId)) {
                appendMessage(message);
                // 상대가 메시지를 보내면 '입력 중' 문구 즉시 끄기
                typingIndicator.classList.remove('active');
            }

            // [변경됨] 상대방이 입력 중이라는 신호 수신
            if (message.type === 'typing_status' && parseInt(message.senderId) === parseInt(friendId)) {
                if (message.isTyping) {
                    typingIndicator.classList.add('active');
                } else {
                    typingIndicator.classList.remove('active');
                }
            }
        };
    }

    function sendMessage() {
        const msg = input.value.trim();
        if (!msg || !ws || ws.readyState !== WebSocket.OPEN) return;

        const messageData = {
            type: 'chat',
            roomId: roomId,
            content: msg,
            recipientId: friendId
        };
        ws.send(JSON.stringify(messageData));
        input.value = "";

        // 전송 후에는 '입력 멈춤' 신호 전송
        ws.send(JSON.stringify({ type: 'typing', roomId: roomId, isTyping: false }));
    }

    function appendMessage(msg) {
        const isMe = msg.sender_id === myId;
        const div = document.createElement("div");
        div.className = isMe ? "my-message" : "their-message";

        let timeStr = "";
        try {
            const date = new Date(msg.created_at);
            timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) { }

        // [변경됨] 읽음 확인(1) 관련 코드는 모두 삭제했습니다.

        const youtubeId = extractYouTubeId(msg.content);
        let contentHtml = msg.content;

        if (youtubeId) {
            contentHtml = `
            <div class="youtube-preview" data-id="${youtubeId}">
                <img src="https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg">
                <p>▶ 재생</p>
            </div>`;
        }

        if (isMe) {
            div.innerHTML = `
                <div class="msg-info">
                    <span class="msg-time">${timeStr}</span>
                </div>
                <div class="bubble">${contentHtml}</div>
            `;
        } else {
            div.innerHTML = `
                <div class="bubble">${contentHtml}</div>
                <div class="msg-info">
                    <span class="msg-time">${timeStr}</span>
                </div>
            `;
        }

        box.appendChild(div);
        box.scrollTop = box.scrollHeight;

        const preview = div.querySelector(".youtube-preview");
        if (preview) {
            preview.addEventListener("click", () => {
                const id = preview.dataset.id;
                window.open(`https://www.youtube.com/watch?v=${id}`, "_blank");
            });
        }
    }

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendMessage();
        });

        //  키보드 입력 감지 -> '입력 중' 신호 전송
        input.addEventListener("input", () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                // 입력 중이라고 알림
                ws.send(JSON.stringify({ type: 'typing', roomId: roomId, isTyping: true }));

                // 1초 동안 입력이 없으면 '입력 멈춤'으로 간주
                clearTimeout(typingTimeout);
                typingTimeout = setTimeout(() => {
                    ws.send(JSON.stringify({ type: 'typing', roomId: roomId, isTyping: false }));
                }, 1000);
            }
        });
    }
});
