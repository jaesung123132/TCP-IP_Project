const searchInput = document.querySelector(".search-container .search-area input");
const searchContainer = document.querySelector(".search-container");
const homepage = document.querySelector(".homepage");
const recentSearches = document.querySelector(".recent-searches");
const searchForm = document.getElementById('search-form');
const friendListUl = document.getElementById('friend-list-ul');
const requestListUl = document.getElementById('request-list-ul'); 
const requestArea = document.getElementById('friend-requests-area'); 

// [추가됨] 사이드바 및 알림 관련 요소
const friendSidebar = document.getElementById('friendSidebar');
const toggleBtn = document.getElementById('toggle-sidebar-btn');
const msgBadge = document.getElementById('msgBadge');
let isSidebarOpen = false;

let ws;
let myId = null;

// [추가됨] 사이드바 토글 함수
window.toggleSidebar = function() {
    isSidebarOpen = !isSidebarOpen;
    if (isSidebarOpen) {
        friendSidebar.classList.add('open');
        // 사이드바 열었으니 배지 알림 제거
        if(msgBadge) msgBadge.classList.remove('active');
    } else {
        friendSidebar.classList.remove('open');
    }
};

function getPlaylistIdFromUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('list');
    } catch (e) {
        return null;
    }
}

function getVideoIdFromUrl(url) {
    try {
        const urlObj = new URL(url);
        let videoId = urlObj.searchParams.get('v');
        if (videoId) return videoId;
        return null;
    } catch (e) {
        return null;
    }
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

document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = await fetchCurrentUser();
    if (!isLoggedIn) return;

    await Promise.all([
        loadAllSections(),
        loadFriendsList()
    ]);

    connectMainWebSocket();
    setupSearch();
    setupScrollButtons();
    setupLogoutButton();
});

async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) throw new Error('인증 정보 로드 실패');
        const user = await response.json();

        if (user.isLoggedIn) {
            myId = user.userId;
            return true;
        } else {
            alert('로그인이 필요합니다.');
            window.location.href = '/';
            return false;
        }
    } catch (error) {
        console.error(error);
        window.location.href = '/';
        return false;
    }
}

// [원본 유지] 섹션 로딩 로직
async function loadAllSections() {
    const recommendList = document.getElementById('list-recommend');
    const happyList = document.getElementById('list-happy');
    const sadList = document.getElementById('list-sad');
    const calmList = document.getElementById('list-calm');
    const excitedList = document.getElementById('list-excited');

    const [
        recommendResponse,
        happyResponse,
        sadResponse,
        calmResponse,
        excitedResponse
    ] = await Promise.all([
        fetch('/api/playlists'),
        fetch('/api/playlists/happy'),
        fetch('/api/playlists/sad'),
        fetch('/api/playlists/calm'),
        fetch('/api/playlists/excited')
    ]).catch(err => {
        console.error("플레이리스트 로드 중 오류:", err);
    });

    if (recommendResponse && recommendResponse.ok) {
        const playlists = await recommendResponse.json();
        loadAndInject(playlists, recommendList);
        setTimeout(() => initRecommendCarousel(), 80);
    }

    if (happyResponse?.ok) loadAndInject(await happyResponse.json(), happyList);
    if (sadResponse?.ok) loadAndInject(await sadResponse.json(), sadList);
    if (calmResponse?.ok) loadAndInject(await calmResponse.json(), calmList);
    if (excitedResponse?.ok) loadAndInject(await excitedResponse.json(), excitedList);
}

// [원본 유지] 플레이리스트 주입 로직
async function loadAndInject(playlists, targetUlElement) {
    if (!targetUlElement || !playlists) return;

    targetUlElement.innerHTML = '';

    playlists.forEach(playlist => {
        const videoId = getVideoIdFromUrl(playlist.youtube_url);
        const listId = getPlaylistIdFromUrl(playlist.youtube_url);
        const thumbnailUrl =
            videoId
                ? `https://img.youtube.com/vi/${videoId}/0.jpg`
                : '/images/default_thumbnail.jpg';

        const listItem = document.createElement('li');
        listItem.className = 'list';

        listItem.innerHTML = `
            <a href="#">
                <div class="musicprofile" data-list-id="${listId}" data-video-id="${videoId}">
                    <img src="${thumbnailUrl}" alt="${playlist.title}">
                </div>
                <div class="desc">
                    <p>${playlist.title}</p>
                    <p>EP • 
                        <a href="/singer_intro?id=${playlist.user_id}" class="singer">
                            ${playlist.username}
                        </a>
                    </p>
                </div>
            </a>
        `;

        listItem.querySelector('.musicprofile').addEventListener('click', () => {
            if (listId) playMusic(listId);
            else if (videoId) playMusic(videoId, true);
            else alert('유효하지 않은 재생목록입니다.');
        });

        targetUlElement.appendChild(listItem);
    });
}

async function loadFriendsList() {
    if (!friendListUl) return;
    try {
        const response = await fetch('/api/friends');
        if (!response.ok) throw new Error('친구 목록 로딩 실패');

        const data = await response.json();
        const friends = Array.isArray(data) ? data : data.friends;
        const requests = Array.isArray(data) ? [] : data.requests;

        // 친구 요청 목록
        if (requestArea && requestListUl) {
            if (requests && requests.length > 0) {
                requestArea.style.display = 'block';
                requestListUl.innerHTML = requests.map(req => {
                    const profileImg = req.profile_image || '/uploads/profile/Default_profile.png';
                    return `
                        <li class="request-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#222; margin-bottom:5px; border-radius:5px;">
                            <div class="request-info" onclick="location.href='/singer_intro?id=${req.friend_id}'" style="display:flex; align-items:center; cursor:pointer;">
                                <img src="${profileImg}" style="width:30px; height:30px; border-radius:50%; margin-right:8px; object-fit:cover;">
                                <span style="font-size:13px; color:white;">${req.friend_name}</span>
                            </div>
                            <div class="request-actions" style="display:flex; gap:5px;">
                                <button onclick="respondToRequest(${req.friend_id}, 'accept')" style="width:24px; height:24px; border-radius:50%; border:none; background:#4caf50; color:white; cursor:pointer; font-weight:bold;">V</button>
                                <button onclick="respondToRequest(${req.friend_id}, 'delete')" style="width:24px; height:24px; border-radius:50%; border:none; background:#f44336; color:white; cursor:pointer; font-weight:bold;">X</button>
                            </div>
                        </li>
                    `;
                }).join('');
            } else {
                requestArea.style.display = 'none';
            }
        }

        // [수정됨] 친구 목록 렌더링 (왼쪽 정렬 + 알림 벨 추가)
        friendListUl.innerHTML = '';
        
        if (!friends || friends.length === 0) {
            friendListUl.innerHTML = '<li style="padding:15px; color:#777; text-align:center;">친구가 없습니다.</li>';
        } else {
            friends.forEach(friend => {
                const li = document.createElement('li');
                li.className = 'friend-item offline';
                // [중요] 순서 변경을 위한 ID 저장
                li.id = `friend-${friend.friend_id}`;
                li.dataset.id = friend.friend_id; 

                const profileImg = friend.profile_image || '/uploads/profile/Default_profile.png';
                const youtubeId = extractYouTubeId(friend.status_message);

                // 유튜브 썸네일 HTML 생성
                let youtubeHtml = '';
                if (youtubeId) {
                    youtubeHtml = `
                    <div class="youtube-preview" onclick="event.stopPropagation(); window.open('https://www.youtube.com/watch?v=${youtubeId}', '_blank')">
                        <img src="https://img.youtube.com/vi/${youtubeId}/0.jpg" style="width:100%; border-radius:4px; display:block;">
                        <p style="margin:3px 0 0; font-size:11px; color:#aaa;">🎵 Listening</p>
                    </div>`;
                }

                // [수정됨] 왼쪽 정렬을 위한 HTML 구조 변경
                li.innerHTML = `
                    <img src="${profileImg}" 
                         onclick="event.stopPropagation(); location.href='/singer_intro?id=${friend.friend_id}'"
                         style="width:40px; height:40px; border-radius:50%; margin-right:0; object-fit:cover; cursor:pointer; border:1px solid #333;">
                    
                    <div class="text-info">
                        <div class="friend-name-row">
                            <span class="friend-name">${friend.friend_name}</span>
                            <span class="status-dot"></span>
                        </div>
                        <div class="friend-status">${friend.status_message || ''}</div>
                        ${youtubeHtml}
                    </div>

                    <div class="bell-wrapper">
                        <svg class="alert-bell" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path class="bell-path" d="M12 2C9.79 2 8 3.79 8 6V7.29C5.72 8.13 4 10.28 4 12.75V17L2.29 18.71C1.9 19.1 2.13 19.75 2.66 19.75H21.34C21.87 19.75 22.1 19.1 21.71 18.71L20 17V12.75C20 10.28 18.28 8.13 16 7.29V6C16 3.79 14.21 2 12 2Z" fill="#555"/>
                            <path class="bell-path" d="M10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20H10Z" fill="#555"/>
                        </svg>
                    </div>
                `;

                li.addEventListener("click", () => {
                    // 클릭 시 알림 끄기
                    const bell = li.querySelector('.alert-bell');
                    const bellPaths = li.querySelectorAll('.bell-path');

                    if (bell) {
                        bell.classList.remove("active");
                        li.classList.remove("alert-active");
                        bellPaths.forEach(path => {
                            path.setAttribute("fill", "#555");
                            path.style.fill = "#555";
                        });
                    }

                    window.location.href = `/chat?friendId=${friend.friend_id}`;
                });
                friendListUl.appendChild(li);
            });
        }
    } catch (error) {
        console.error(error);
        friendListUl.innerHTML = '<li>친구 목록 로딩 실패</li>';
    }
}


function connectMainWebSocket() {
    ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
        console.log("메인 웹소켓 연결 성공");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("웹소켓 메시지 수신:", data);

        if (data.type === 'friend_online') {
            updateFriendStatus(data.userId, true);
        } else if (data.type === 'friend_offline') {
            updateFriendStatus(data.userId, false);
        } else if (data.type === 'friend_status_list') {
            for (const [friendId, isOnline] of Object.entries(data.statuses)) {
                if (isOnline) updateFriendStatus(friendId, true);
            }
        } else if (data.type === 'new_message_notification') {
            // [중요] 메시지 수신 시 알림 함수 호출
            handleIncomingMessage(data.senderId);
        }
    };

    ws.onclose = () => {
        setTimeout(connectMainWebSocket, 5000);
    };

    ws.onerror = (error) => {
        console.error("웹소켓 오류:", error);
    };
}

// [추가됨] 메시지 수신 시 순서 변경 및 알림 처리 함수
function handleIncomingMessage(senderId) {
    // 1. 보낸 사람의 리스트 아이템 찾기 (ID 활용)
    const friendItem = document.getElementById(`friend-${senderId}`);

    if (friendItem) {
        // 2. 친구 목록 맨 위로 이동
        friendListUl.prepend(friendItem);

        // 3. 사이드바가 닫혀있으면 -> 토글 버튼에 배지 켜기
        if (!isSidebarOpen) {
            if(msgBadge) msgBadge.classList.add('active');
        } 
        
        // 4. 개별 친구의 알림 벨 활성화 (강제 빨강 + 애니메이션)
        const bell = friendItem.querySelector('.alert-bell');
        const bellPaths = friendItem.querySelectorAll('.bell-path');
        if (bell) {
            bell.classList.add("active");
            friendItem.classList.add("alert-active");
            // SVG 색상 강제 변경
            bellPaths.forEach(path => {
                path.setAttribute("fill", "#FF0000");
                path.style.fill = "#FF0000";
            });
        }
    }
}

function updateFriendStatus(friendId, isOnline) {
    const friendElement = document.getElementById(`friend-${friendId}`);
    if (friendElement) {
        if (isOnline) {
            friendElement.classList.add('online');
            friendElement.classList.remove('offline');
        } else {
            friendElement.classList.remove('online');
            friendElement.classList.add('offline');
        }
    }
}

// [원본 유지] 검색 기능
function setupSearch() {
    if (!searchInput || !searchContainer || !homepage) return;
    let blurTimeout;

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) performSearch(query);
            else alert('검색어를 입력하세요.');
        });
    }

    searchInput.addEventListener('focus', () => {
        clearTimeout(blurTimeout);
        searchContainer.classList.add('search-active');
        homepage.classList.add('search-active');
    });

    searchInput.addEventListener('blur', () => {
        blurTimeout = setTimeout(() => {
            searchContainer.classList.remove('search-active');
            homepage.classList.remove('search-active');
        }, 150);
    });
}

// [원본 유지] 검색 실행 로직
async function performSearch(query) {
    const contentContainer = document.querySelector('.content-container');
    if (!contentContainer) return;

    try {
        contentContainer.innerHTML = '<h1>검색 중...</h1>';
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('검색 서버 응답 실패');
        const results = await response.json();
        displaySearchResults(results, query, contentContainer);
    } catch (error) {
        contentContainer.innerHTML = `<h1>검색 결과 로딩 실패: ${error.message}</h1>`;
    }
}

// [원본 유지] 검색 결과 표시
function displaySearchResults(results, query, container) {
    container.innerHTML = '';
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';

    if (results.length === 0) {
        contentDiv.innerHTML = `
            <div class="content-header">
                <h1>'${query}' 검색 결과 (0건)</h1>
            </div>
            <p style="padding-left: 20px;">검색 결과가 없습니다.</p>
        `;
        container.appendChild(contentDiv);
        return;
    }

    const listItemsHtml = results.map(playlist => {
        const videoId = getVideoIdFromUrl(playlist.youtube_url);
        const listId = getPlaylistIdFromUrl(playlist.youtube_url);
        const thumbnailUrl =
            videoId
                ? `https://img.youtube.com/vi/${videoId}/0.jpg`
                : '/images/default_thumbnail.jpg';

        return `
            <li class="list">
                <a href="#">
                    <div class="musicprofile" data-list-id="${listId}" data-video-id="${videoId}">
                        <img src="${thumbnailUrl}" alt="${playlist.title}">
                    </div>
                    <div class="desc">
                        <p>${playlist.title}</p>
                        <p>EP • <a href="/singer_intro?id=${playlist.user_id}" class="singer">${playlist.username}</a></p>
                    </div>
                </a>
            </li>
        `;
    }).join('');

    contentDiv.innerHTML = `
        <div class="content-header">
            <h1>'${query}' 검색 결과 (${results.length}건)</h1>
        </div>
        <div class="list-box">
            <ul>${listItemsHtml}</ul>
        </div>
    `;

    container.appendChild(contentDiv);

    contentDiv.querySelectorAll('.musicprofile').forEach(profile => {
        profile.addEventListener('click', () => {
            const listId = profile.dataset.listId;
            const videoId = profile.dataset.videoId;
            if (listId) playMusic(listId);
            else if (videoId) playMusic(videoId, true);
        });
    });

    setupScrollButtons();
}

// [원본 유지] 음악 재생 모달
function playMusic(listId, isVideo = false) {
    const existingModal = document.getElementById('youtube-modal');
    if (existingModal) existingModal.remove();

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'youtube-modal';
    modalOverlay.style = `
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex; align-items: center; justify-content: center;
        z-index: 2000; /* 사이드바보다 위 */
    `;

    let src;
    if (isVideo && listId) {
        src = `https://www.youtube.com/embed/${listId}?autoplay=1`;
    } else {
        src = `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=1`;
    }

    modalOverlay.innerHTML = `
        <div style="position: relative; width: 60%; max-width: 800px;">
            <iframe width="100%" height="450"
                    src="${src}"
                    frameborder="0" allow="autoplay" allowfullscreen>
            </iframe>
            <button onclick="document.getElementById('youtube-modal').remove()" 
                    style="position:absolute; top:-40px; right:0; color:white; background:transparent; border:none; font-size:20px; cursor:pointer;">
                닫기 X
            </button>
        </div>
    `;

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
    document.body.appendChild(modalOverlay);
}

// [원본 유지] 스크롤 버튼 로직
function setupScrollButtons() {
    const sections = document.querySelectorAll('.content');

    sections.forEach(section => {
        if (section.dataset.category === "all") return;

        const listBox = section.querySelector('.list-box');
        const leftArrow = section.querySelector('.left-arrow');
        const rightArrow = section.querySelector('.right-arrow');

        if (!listBox || !leftArrow || !rightArrow) return;

        rightArrow.addEventListener("click", () => {
            listBox.scrollBy({ left: 300, behavior: "smooth" });
        });

        leftArrow.addEventListener("click", () => {
            listBox.scrollBy({ left: -300, behavior: "smooth" });
        });
    });
}

// [원본 유지] 추천 탭 캐러셀 로직
function initRecommendCarousel() {
    const track = document.getElementById('list-recommend');
    if (!track) {
        return;
    }

    const recommendSection = track.closest('.content[data-category="all"]');
    if (!recommendSection) {
        return;
    }

    const listContainer = recommendSection.querySelector('.list-box');
    const items = track.querySelectorAll('.list');
    const leftArrow = recommendSection.querySelector('.left-arrow');
    const rightArrow = recommendSection.querySelector('.right-arrow');

    if (items.length === 0 || !listContainer || !leftArrow || !rightArrow) {
        return;
    }

    let index = 0;
    let autoSlide;

    function updateSlidePosition() {
        const slideWidth = listContainer.offsetWidth;
        if (slideWidth === 0) return;
        track.style.transform = `translateX(-${index * slideWidth}px)`; 
        track.style.transition = "transform 0.5s ease";
    }

    setTimeout(updateSlidePosition, 0);

    function start() {
        autoSlide = setInterval(() => {
            index = (index + 1) % items.length;
            updateSlidePosition();
        }, 3000);
    }

    function stop() {
        clearInterval(autoSlide);
    }

    start();

    rightArrow.addEventListener('click', () => {
        stop();
        index = (index + 1) % items.length;
        updateSlidePosition();
        start();
    });

    leftArrow.addEventListener('click', () => {
        stop();
        index = (index - 1 + items.length) % items.length;
        updateSlidePosition();
        start();
    });

    track.addEventListener('click', stop);
    window.addEventListener('resize', updateSlidePosition);
}

// [원본 유지] 로그아웃 로직
function setupLogoutButton() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout', { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                    alert('로그아웃 되었습니다.');
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('로그아웃 오류:', error);
            }
        });
    }
}

// [원본 유지] 친구 요청 수락/거절
window.respondToRequest = async function(targetId, action) {
    if (!confirm(action === 'accept' ? '수락하시겠습니까?' : '거절하시겠습니까?')) return;

    try {
        const res = await fetch('/api/friends/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetId, action })
        });
        const data = await res.json();

        if (data.success) {
            alert(data.message);
            location.reload();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("서버 오류");
    }
};