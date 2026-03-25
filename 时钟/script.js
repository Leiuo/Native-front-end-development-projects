const hour = document.querySelector('.hour');
const minute = document.querySelector('.minute');
const second = document.querySelector('.second');
const timeEl = document.querySelector('.time');
const dateEl = document.querySelector('.date');
const toggle = document.querySelector('.toggle');

// 星期
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// 月份
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// 给按钮添加点击事件，切换黑暗模式
toggle.addEventListener("click", (e) => {
    const html = document.querySelector("html");
    // console.log(e);

    if (html.classList.contains("dark")) {
        html.classList.remove("dark"); // 如果当前是黑暗模式，移除dark类名
        e.target.innerHTML = "Dark Mode";
    } else {
        html.classList.add("dark"); // 如果当前是白天模式，添加dark类名
        e.target.innerHTML = "Light Mode";
    }
});

// 获取时间
function setTime() {
    const time = new Date();
    const month = time.getMonth();
    const day = time.getDay();
    const date = time.getDate();
    const hours = time.getHours();
    const hoursForClock = hours >= 13 ? hours % 12 : hours; // 小时采用12小时制
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";

    hour.style.transform = `translate(-50%, -100%) rotate(${scale(hoursForClock, 0, 12, 0, 360)}deg)`; // 时针转动
    minute.style.transform = `translate(-50%, -100%) rotate(${scale(minutes, 0, 60, 0, 360)}deg)`; // 分针转动
    second.style.transform = `translate(-50%, -100%) rotate(${scale(seconds, 0, 60, 0, 360)}deg)`; // 秒针转动

    timeEl.innerHTML = `${hoursForClock}: ${minutes < 10 ? `0${minutes}` : minutes} ${ampm}`;
    dateEl.innerHTML = `${days[day]}, ${months[month]} <span class="circle">${date}</span>`;
}

const scale = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

setTime();

setInterval(setTime, 1000);