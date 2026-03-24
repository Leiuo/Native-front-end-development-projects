const searchInput = document.querySelector(".search-input");

searchInput.addEventListener("input", (e) => {
    // console.log(e.target.value);
    const value = e.target.value; // 输入框的值
    if (value.length > 0) {
        // console.log('搜索建议：', value);
        alert(`搜索建议：${value}`);
    }
});