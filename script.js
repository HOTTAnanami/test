// ==========================================
// 1. 画像リスト（1〜40）の生成
// ==========================================
const baseImages = [];
for (let i = 1; i <= 40; i++) {
    const num = String(i).padStart(2, '0'); 
    baseImages.push(`img/image${num}.png`); 
}

// ==========================================
// 2. ランダム選出＆30枚上限コントロール
// ==========================================
const heroArea = document.getElementById("hero-area");
const container = document.getElementById("trail-container");

let lastX = 0;
let lastY = 0;
const distanceThreshold = 45; // 画像生成の間隔(px)
const maxOnScreen = 30;       // 画面上の最大保持数

function createTrailImage(x, y) {
    const heroRect = heroArea.getBoundingClientRect();
    if (y > heroRect.bottom) return;

    const distance = Math.hypot(x - lastX, y - lastY);
    if (distance < distanceThreshold) return;

    lastX = x;
    lastY = y;

    // 40枚からランダム抽出
    const randomIndex = Math.floor(Math.random() * baseImages.length);
    const randomSrc = baseImages[randomIndex];

    const img = document.createElement("img");
    img.src = randomSrc;
    img.classList.add("trail-image");
    
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    // 浮遊スピードとタイミングに少し変化をつけて自然な揺れに
    img.style.animationDelay = `0s`;
    img.style.animationDuration = `${(3.8 + Math.random() * 1.5).toFixed(2)}s`;

    container.appendChild(img);

    // ★30枚を超えたら、一番古い画像からフェードアウトして削除
    const activeImages = container.querySelectorAll(".trail-image:not(.is-fading)");
    if (activeImages.length > maxOnScreen) {
        const oldestImg = activeImages[0];
        oldestImg.classList.add("is-fading");
        
        // 0.8秒のフェードアウト後にDOMから完全削除
        setTimeout(() => {
            oldestImg.remove();
        }, 800);
    }
}

// PC用：マウス移動
heroArea.addEventListener("mousemove", (e) => {
    createTrailImage(e.clientX, e.clientY);
});

// スマホ用：指でなぞる
heroArea.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    createTrailImage(touch.clientX, touch.clientY);
}, { passive: true });

// ==========================================
// 3. スクロール時の背景色カラーシフト (#ffffff -> #FCF36A)
// ==========================================
const messageSection = document.querySelector(".message-section");

window.addEventListener("scroll", () => {
    const rect = messageSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.6) {
        document.body.style.backgroundColor = "#FCF36A";
    } else {
        document.body.style.backgroundColor = "#ffffff";
    }
});