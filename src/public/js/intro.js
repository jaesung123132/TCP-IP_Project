document.addEventListener("DOMContentLoaded", () => {

    // 1. 유튜브 재생 (기존 유지)
    function playPlaylist(listId) {
        const modal = document.createElement("div");
        modal.id = "youtube-modal";
        modal.style = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 999;`;
        modal.innerHTML = `<div style="width:60%; max-width:800px;"><iframe width="100%" height="450" src="https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=1" frameborder="0" allow="autoplay" allowfullscreen></iframe></div>`;
        modal.addEventListener("click", () => modal.remove());
        document.body.appendChild(modal);
    }
    function playVideo(videoId) {
        const modal = document.createElement("div");
        modal.id = "youtube-modal";
        modal.style = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 999;`;
        modal.innerHTML = `<div style="width:60%; max-width:800px;"><iframe width="100%" height="450" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="autoplay" allowfullscreen></iframe></div>`;
        modal.addEventListener("click", () => modal.remove());
        document.body.appendChild(modal);
    }
    document.querySelectorAll(".musicprofile").forEach(el => {
        el.addEventListener("click", () => {
            const listId = el.dataset.listId;
            const videoId = el.dataset.videoId;
            if (listId) return playPlaylist(listId);
            if (videoId) return playVideo(videoId);
            alert("재생할 수 있는 URL이 없습니다.");
        });
    });

    // 2. 프로필 업로드 (기존 유지)
    const profileImg = document.getElementById("profileImg");
    const fileInput = document.getElementById("profileUpload");
    if (profileImg && fileInput) {
        profileImg.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", async () => {
            const file = fileInput.files[0];
            if (!file) return;
            const fd = new FormData();
            fd.append("profile", file);
            try {
                const res = await fetch("/singer_intro/profile/upload", { method: "POST", body: fd });
                const data = await res.json();
                if (data.success) { alert("프로필 사진이 변경되었습니다!"); location.reload(); } 
                else { alert("업로드 실패: " + data.message); }
            } catch (e) { console.error(e); alert("오류 발생"); }
        });
    }

    // 3. 로그아웃 (기존 유지)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout', { 
                    method: 'POST', headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                if (result.success) { alert('로그아웃 되었습니다.'); window.location.href = '/login'; } 
                else { alert('로그아웃 실패'); }
            } catch (error) { console.error(error); }
        });
    }

    // 4. [핵심] 친구 신청/수락/삭제 버튼 통합 처리
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action; // request, accept, delete
            const targetId = btn.dataset.targetId;

            if (!confirm("정말 진행하시겠습니까?")) return;

            try {
                const res = await fetch('/api/friends/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId, action })
                });
                const data = await res.json();

                if (data.success) {
                    alert(data.message);
                    location.reload(); // 상태 업데이트를 위해 새로고침
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error(err);
                alert("요청 처리 중 오류 발생");
            }
        });
    });

});