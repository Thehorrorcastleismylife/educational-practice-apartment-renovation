const API_URL = 'http://localhost:8000/index.php';

async function getCurrentUser() {
    try {
        const response = await fetch(`${API_URL}?action=getCurrentUser`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        if (data.success && data.user) {
            return data.user;
        }
        return null;
    } catch (e) {
        console.error('Ошибка получения пользователя:', e);
        return null;
    }
}

/**
 * Проверить авторизацию
 */
async function isLoggedIn() {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Выход
 */
async function logout() {
    try {
        await fetch(`${API_URL}?action=logout`, {
            credentials: 'include',
            method: 'POST'
        });
        
        window.location.href = 'index.html';
    } catch (e) {
        console.error(e);
    }
}

/**
 * Регистрация
 */
async function register(surname, name, middlename, email, password, phone) {
    const response = await fetch(`${API_URL}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ surname, name, middlename, email, password, phone })
    });
    const data = await response.json();
    if (data.success) {
        return true;
    } else {
        alert(data.error || 'Ошибка регистрации');
        return false;
    }
}

/**
 * Вход
 */
async function loginUser(email, password) {
    const response = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success) {
        return true;
    } else {
        alert(data.error || 'Неверный email или пароль');
        return false;
    }
}

/**
 * Обновить шапку: показать "Личный кабинет" или "Вход/Регистрация"
 */
async function updateHeader() {
    const loginBtn = document.getElementById('login-btn');
    const loginTxt = document.getElementById('login-txt');
    if (!loginBtn || !loginTxt) return;

    const user = await getCurrentUser();
    if (user) {
        loginTxt.textContent = 'Личный кабинет';
        loginBtn.onclick = () => { window.location.href = 'profile.html'; };
    } else {
        loginTxt.textContent = 'Вход / Регистрация';
        loginBtn.onclick = openAuthModal;
    }
}

function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.flxb-txts-header-main-page a, .flxb-txts-header-any a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function openAuthModal() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
        overlay.classList.add('active');
        if (typeof reinitPhoneMask === 'function') {
            setTimeout(() => reinitPhoneMask(), 50);
        }
    }
}

function closeAuthModal() {
    const overlay = document.getElementById('auth-overlay');
    if (overlay) overlay.classList.remove('active');
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    if (tab === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        if (typeof reinitPhoneMask === 'function') {
            setTimeout(() => reinitPhoneMask(), 50);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
    highlightCurrentPage();

    const authClose = document.querySelector('.auth-close');
    if (authClose) authClose.addEventListener('click', closeAuthModal);

    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    if (loginTab) loginTab.addEventListener('click', () => switchAuthTab('login'));
    if (registerTab) registerTab.addEventListener('click', () => switchAuthTab('register'));

    // Обработка входа
    const loginForm = document.getElementById('login-form-fields');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-input').value.trim();
            const password = document.getElementById('login-password').value;
            if (await loginUser(email, password)) {
                closeAuthModal();
                updateHeader();
                window.location.reload();
            }
        });
    }

    // Обработка регистрации
    const registerForm = document.getElementById('register-form-fields');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const surname = document.getElementById('register-surname').value.trim();
            const name = document.getElementById('register-name').value.trim();
            const middlename = document.getElementById('register-middlename').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const phoneInput = registerForm.querySelector('.order-telephone');
            const phone = getCleanPhone(phoneInput);

            if (!surname || !name || !middlename) {
                alert('Заполните фамилию, имя и отчество');
                return;
            }
            if (password.length < 8) {
                alert('Пароль должен быть не менее 8 символов');
                return;
            }
            if (phone.length < 11) {
                alert('Введите номер телефона полностью');
                return;
            }

            if (await register(surname, name, middlename, email, password, phone)) {
                closeAuthModal();
                updateHeader();
                window.location.reload();
            }
        });
    }
});