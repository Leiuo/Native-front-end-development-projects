// 一次性播放所有进度条
function animateProgressBars() {
    const progressBars = document.querySelectorAll(".progress"); // 拿到所有进度条的 div

    progressBars.forEach((progressBar) => {
        const percent = progressBar.getAttribute("data-percent"); // 获取进度条百分比
        progressBar.style.width = percent + "%"; // 设置进度条宽度

        // 更新对应百分比数字
        const skillItem = progressBar.closest(".skill-item");
        const percentSpan = skillItem.querySelector(".skill-percent");
        animateNumber(percentSpan, 0, Number(percent), 800); // 百分比数字递增动画
    });
}

// 数字递增动画
function animateNumber(element, start, end, time) {
    let startTimestamp = null; // 开始时间戳
    const step = (timestamp) => {
        if (!startTimestamp) {
            startTimestamp = timestamp;
        }
        const progress = Math.min((timestamp - startTimestamp) / time, 1); // 计算进度
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = currentValue + "%";
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 重置所有进度条
function resetProgressBars() {
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach((bar) => {
        bar.style.width = "0";
        const skillItem = bar.closest(".skill-item");
        const percentSpan = skillItem.querySelector(".skill-percent");
        percentSpan.textContent = "0%";
    });
}

// 页面加载时自动播放动画
window.addEventListener("load", () => {
    setTimeout(animateProgressBars, 500);
});