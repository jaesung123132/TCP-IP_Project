// 유튜브 videoId 추출 함수
function getVideoId(url) {
    try {
        const u = new URL(url);
        return u.searchParams.get("v") || null;
    } catch { return null; }
}

const form = document.getElementById("uploadForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const url = document.getElementById("url").value;
    const emotion = document.getElementById("emotion").value;

    const videoId = getVideoId(url);

    const res = await fetch("/playlist/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, emotion })
    });

    const data = await res.json();
    if (!data.success) {
        alert("업로드 실패: " + data.message);
        return;
    }

    const alertBox = document.getElementById("upload-alert");
    alertBox.style.display = "block";

    alertBox.innerHTML = `
            <img src="https://img.youtube.com/vi/${videoId}/0.jpg">
            <div class="alert-title">${title}</div>
            <div class="alert-sub">플레이리스트가 등록되었습니다</div>
        `;

    // 2초 후 fade-out
    setTimeout(() => {
        alertBox.classList.add("fade-out");
    }, 2000);

    // 3.8초 후 메인으로 이동
    setTimeout(() => {
        window.location.href = "/playlist/singer_intro";
    }, 2000);
});
