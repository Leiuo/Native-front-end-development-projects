// DOM 元素
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabBtns = document.querySelectorAll('.tab-btn');
const passwordToggles = document.querySelectorAll('.password-toggle');

// 登录表单元素
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const rememberMe = document.getElementById('rememberMe');

// 注册表单元素
const regUsername = document.getElementById('regUsername');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regConfirmPassword = document.getElementById('regConfirmPassword');
const agreeTerms = document.getElementById('agreeTerms');

/* ===== 表单切换功能 ===== */
tabBtns.forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
        const tabName = tabBtn.getAttribute('data-tab');

        // 更新选项卡样式
        tabBtns.forEach((btn) => btn.classList.remove('active'));
        tabBtn.classList.add('active');

        // 切换表单
        if (tabName === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else if (tabName === 'register') {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }

        // 清除所有错误提示
        clearAllErrors();
    });
});

// 清除所有输入框错误
function clearAllErrors() {
    const allInputs = document.querySelectorAll('.input-group input'); // 获取所有输入框

    allInputs.forEach((input) => {
        const inputId = input.id;
        if (inputId) {
            clearError(inputId);
        }
    });
}

// 清除单个输入框错误
function clearError(inputId) {
    const inputGroup = document.getElementById(inputId).closest('.input-group');
    const errorDiv = document.getElementById(`${inputId}Error`);

    inputGroup.classList.remove('error');
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
}

/* ===== 密码可见性切换 ===== */
passwordToggles.forEach((toggle) => {
    toggle.addEventListener('click', function () {
        // console.log(e.target);
        const targetInputId = toggle.getAttribute('data-target');
        const targetInput = document.getElementById(targetInputId);

        if (targetInput.type === 'password') { // 如果输入框是密码输入框
            targetInput.type = 'text'; // 显示密码

            // 打开小眼睛
            this.classList.replace('fa-eye-slash', 'fa-eye');
        } else { // 如果密码已经可见，将其切换成不可见
            targetInput.type = 'password';

            // 关闭小眼睛
            this.classList.replace('fa-eye', 'fa-eye-slash');
        }
    });
});

/* ===== 输入密码后检测密码强度 ===== */
regPassword.addEventListener('input', function () {
    const password = this.value;
    // console.log(password);
    const strength = checkPasswordStrength(password);
    updateStrengthIndicator(strength);
});

// 检查密码强度
function checkPasswordStrength(password) {
    let strength = 0;

    // 密码长度检查
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // 包含数字
    if (/\d/.test(password)) strength++;

    // 包含小写字母
    if (/[a-z]/.test(password)) strength++;

    // 包含大写字母
    if (/[A-Z]/.test(password)) strength++;

    // 包含特殊字符
    if (/[!@#$%^&*]/.test(password)) strength++;

    // 返回最终密码强度等级
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

// 更新密码强度
function updateStrengthIndicator(strength) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const strengthTextSpan = document.querySelector('.strength-text span');

    strengthBar.classList.remove('weak', 'medium', 'strong'); // 移除所有类

    switch (strength) {
        case 'weak':
            strengthBar.style.width = '33%';
            strengthBar.style.background = '#dc3545';
            strengthTextSpan.textContent = '弱';
            strengthText.style.color = '#dc3545';
            break;
        case 'medium':
            strengthBar.style.width = '66%';
            strengthBar.style.background = '#ffc107';
            strengthTextSpan.textContent = '中';
            strengthText.style.color = '#ffc107';
            break;
        case 'strong':
            strengthBar.style.width = '100%';
            strengthBar.style.background = '#28a745';
            strengthTextSpan.textContent = '强';
            strengthText.style.color = '#28a745';
            break;
        default:
            strengthBar.style.width = '0';
            strengthBar.style.background = '#e9ecef';
            strengthTextSpan.textContent = '弱';
            strengthText.style.color = '#6c757d';
    }
}

/* ===== 表单验证方法 ===== */
// 邮箱验证
function validateEmail(email) {
    const emailRegExp = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/; // 验证邮箱的正则表达式
    return emailRegExp.test(email);
}

// 用户名验证
function validateUsername(username) {
    if (username.length < 3) return '用户名至少需要3个字符';
    if (username.length > 20) return '用户名不能超过20个字符';

    const usernameRegExp = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
    if (!usernameRegExp.test(username)) return '用户名只能包含数字、字母、下划线或中文';
    return '';
}

// 密码验证
function validatePassword(password) {
    if (password.length < 6) return '密码至少需要6个字符';
    if (password.length > 20) return '密码不能超过20个字符';
    return '';
}

// 显示错误
function showError(inputId, message) {
    const inputGroup = document.getElementById(inputId).closest('.input-group');
    const errorDiv = document.getElementById(`${inputId}Error`);

    inputGroup.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

/* ===== 注册校验 ===== */
function validateRegisterForm() {
    let isValid = true; // 注册表单是否合法

    // 验证用户名
    const username = regUsername.value.trim();
    const usernameError = validateUsername(username);
    if (usernameError) {
        showError('regUsername', usernameError);
        isValid = false;
    } else {
        clearError('regUsername');
    }

    // 验证邮箱
    const email = regEmail.value.trim();
    if (!validateEmail(email)) {
        showError('regEmail', '请输入有效的邮箱地址');
        isValid = false;
    } else {
        clearError('regEmail');
    }

    // 验证密码
    const password = regPassword.value;
    const passwordError = validatePassword(password);
    if (passwordError) {
        showError('regPassword', passwordError);
        isValid = false;
    } else {
        clearError('regPassword');
    }

    // 验证确认密码
    const confirmPassword = regConfirmPassword.value;
    if (password !== confirmPassword) {
        showError('regConfirmPassword', '两次输入的密码不一致');
        isValid = false;
    } else {
        clearError('regConfirmPassword');
    }

    // 验证协议是否勾选
    if (!agreeTerms.checked) {
        alert('请阅读并同意用户协议');
        isValid = false;
    }

    return isValid;
}

/* ===== 登录校验 ===== */
function validateLoginForm() {
    let isValid = true;

    // 验证邮箱
    const email = loginEmail.value.trim();
    if (!validateEmail(email)) {
        showError('loginEmail', '请输入有效的邮箱地址');
        isValid = false;
    } else {
        clearError('loginEmail');
    }

    // 验证密码
    const password = loginPassword.value;
    if (!password) {
        showError('loginPassword', '请输入密码');
        isValid = false;
    } else {
        clearError('loginPassword');
    }

    return isValid;
}

/* ===== 本地存储操作 ===== */
// 保存用户数据
function saveUser(userData) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');

    // 检查邮箱是否已存在
    if (users.some((user) => user.email === userData.email)) {
        alert('该邮箱已被注册');
        return false;
    }

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

// 验证登录
function verifyLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    const errorUser = users.find(u => !(u.email === email && u.password === password));

    if (user) {
        // 保存登录状态
        if (rememberMe.checked) {
            localStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                username: user.username,
                password: user.password,
                loginTime: new Date().toISOString()
            }));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                username: user.username
            }));
        }
        return true;
    }
    // return false;

    if (errorUser) {
        if (errorUser.email !== email && errorUser.password === password) {
            return 'emailError';
        } else if (errorUser.password !== password && errorUser.email === email) {
            return 'passwordError';
        } else {
            return false;
        }
    }
}

/* ===== 表单提交处理 ===== */
// 注册表单提交
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (validateRegisterForm()) { // 注册校验通过
        // 用户数据
        const userData = {
            username: regUsername.value.trim(),
            email: regEmail.value.trim(),
            password: regPassword.value,
            registerTime: new Date().toISOString()
        }

        if (saveUser(userData)) { // 用户数据保存成功
            alert('注册成功！请登录');
            document.querySelector('[data-tab="login"]').click(); // 切换到登录表单
            registerForm.reset(); // 清空注册表单
            updateStrengthIndicator(''); // 重置密码强度
        }
    }
})

// 登录表单提交
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (validateLoginForm()) { // 登录校验通过
        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        // if (verifyLogin(email, password)) { // 登录验证成功
        //     alert('登录成功！');
        //     console.log('用户已经登录');
        // } else {
        //     showError('loginEmail', '邮箱错误');
        //     showError('loginPassword', '密码错误');
        // }

        const verifyLoginRes = verifyLogin(email, password);
        if (verifyLoginRes === true) { // 登录验证成功
            alert('登录成功！');
            console.log('用户已经登录');
        } else if (verifyLoginRes === 'emailError') {
            showError('loginEmail', '邮箱错误');
        } else if (verifyLoginRes === 'passwordError') {
            showError('loginPassword', '密码错误');
        } else if (!verifyLoginRes) {
            showError('loginEmail', '邮箱错误');
            showError('loginPassword', '密码错误');
        }
    }
})

/* ===== 实时验证 ===== */
// 登录表单实时验证
loginEmail.addEventListener('blur', function () {
    const email = this.value.trim();
    if (email && !validateEmail(email)) {
        showError('loginEmail', '请输入有效的邮箱地址');
    }
});

// 注册表单实时邮箱验证
regEmail.addEventListener('blur', function () {
    const email = this.value.trim();
    if (email && !validateEmail(email)) {
        showError('regEmail', '请输入有效的邮箱地址');
    }
});

// 注册表单实时密码验证
regPassword.addEventListener('blur', function () {
    const password = this.value;
    if (password && validatePassword(password)) {
        clearError('regPassword');
    }
});

// 注册表单实时确认密码验证
regConfirmPassword.addEventListener('input', function () {
    const confirmPassword = this.value;
    const password = regPassword.value;

    if (confirmPassword && password !== confirmPassword) {
        showError('regConfirmPassword', '两次输入的密码不一致');
    } else if (confirmPassword) {
        clearError('regConfirmPassword');
    }
});

/* ===== 自动填充记住的登录信息 ===== */
function loadRememberedUser() {
    const rememberedUser = localStorage.getItem('currentUser');
    if (rememberedUser) {
        const user = JSON.parse(rememberedUser);
        loginEmail.value = user.email;
        loginPassword.value = user.password;
        rememberMe.checked = true;
    }
}
loadRememberedUser(); // 页面加载时执行

// 添加输入框聚焦时清除错误
document.querySelectorAll('.input-group input').forEach((input) => {
    input.addEventListener('focus', function () {
        const inputId = this.id;
        if (inputId) {
            clearError(inputId);
        }
    })
})