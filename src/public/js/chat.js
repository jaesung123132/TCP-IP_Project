document.addEventListener("DOMContentLoaded", async () => {
    const input = document.getElementById("chatInput");
    const box = document.getElementById("chatBox");
    const sendBtn = document.getElementById("sendBtn");

    let ws;
    let myId = null;
    let friendId = null;
    let roomId = null;

    try {
        const params = new URLSearchParams(window.location.search);
        friendId = parseInt(params.get('friendId'));
        if (!friendId) {
            throw new Error('채팅 상대를 찾을 수 없습니다.');
        }

        const meResponse = await fetch('/api/me');
        const me = await meResponse.json();
        if (!me.isLoggedIn) {
            window.location.href = '/';
            return;
        }
        myId = me.userId;

        roomId = await getRoomId(myId, friendId);

        await loadChatHistory(roomId);

        connectWebSocket(roomId);

    } catch (error) {
        console.error("채팅방 초기화 오류:", error);
        if (box) box.innerHTML = "채팅방을 불러오는 데 실패했습니다.";
    }

    function extractYouTubeId(url) {
        try {
            const u = new URL(url);
            if (u.hostname.includes('youtube.com')) {
                return u.searchParams.get('v');
            }
            if (u.hostname.includes('youtu.be')) {
                return u.pathname.replace("/", "");
            }
        } catch (e) { }
        return null;
    }

    async function getRoomId(myId, friendId) {
        const response = await fetch('/api/chat/room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ myId, friendId })
        });
        if (!response.ok) throw new Error('채팅방 ID를 가져오지 못했습니다.');
        const data = await response.json();

        document.querySelector('.chat-title').textContent = `${data.friendName}님과의 채팅`;
        return data.roomId;
    }

    async function loadChatHistory(roomId) {
        const response = await fetch(`/api/chat/history/${roomId}`);
        if (!response.ok) throw new Error('대화 내역을 불러오지 못했습니다.');
        const messages = await response.json();

        box.innerHTML = '';
        messages.forEach(appendMessage);
        box.scrollTop = box.scrollHeight;
    }

    function connectWebSocket(roomId) {
        ws = new WebSocket(`ws://${window.location.host}`);
        ws.onopen = () => {
            console.log("웹소켓 연결 성공");
            ws.send(JSON.stringify({ type: 'join', roomId: roomId }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'chat' && message.room_id === roomId) {
                appendMessage(message);
            }
        };
        ws.onclose = () => {
            console.log("웹소켓 연결 종료");
        };

        ws.onerror = (error) => {
            console.error("웹소켓 오류:", error);
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
    }

    // [수정됨] 메시지 추가 함수 (시간, 읽음 표시 적용)
    function appendMessage(msg) {
        const isMe = msg.sender_id === myId;
        const div = document.createElement("div");
        div.className = isMe ? "my-message" : "their-message";

        // 시간 포맷 (오전/오후 HH:MM)
        const date = new Date(msg.created_at);
        const timeStr = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

        // 읽음 확인 (내가 보낸 메시지이고, is_read가 0이면 '1' 표시)
        const unreadMark = (isMe && !msg.is_read) ? '<span class="read-check">1</span>' : '';

        const youtubeId = extractYouTubeId(msg.content);
        let contentHtml = msg.content;

        if (youtubeId) {
            contentHtml = `
            <div class="youtube-preview" data-id="${youtubeId}">
                <img src="https://img.youtube.com/vi/${youtubeId}/0.jpg" alt="thumbnail">
                <p>유튜브 영상 보기</p>
            </div>`;
        }

        // HTML 구조 조립
        if (isMe) {
            div.innerHTML = `
                <div class="msg-info">
                    ${unreadMark}
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

        // 유튜브 프리뷰 클릭 이벤트
        const preview = div.querySelector(".youtube-preview");
        if (preview) {
            preview.addEventListener("click", () => {
                const id = preview.dataset.id;
                window.open(`https://www.youtube.com/watch?v=${id}`, "_blank");
            });
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});