/* ============================================
   МОДУЛЬ АВТОРИЗАЦИИ (auth.js)
   ============================================ */

// --- Инициализация данных ---
const AUTH_KEY = 'remont_auth';
const USERS_KEY = 'remont_users';

// Дефолтные пользователи (админ + пустой массив)
const defaultUsers = [
  { login: 'admin', password: 'admin', email: 'admin@remont.ru', role: 'admin', orders: [] }
];

/**
 * Получить массив всех пользователей из localStorage
 */
function getUsers() {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [...defaultUsers];
}

/**
 * Сохранить массив пользователей
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Инициализировать пользователей при первом запуске
if (!localStorage.getItem(USERS_KEY)) {
  saveUsers([...defaultUsers]);
}

/**
 * Получить текущего авторизованного пользователя
 */
function getCurrentUser() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Установить текущего пользователя
 */
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

/**
 * Проверить, авторизован ли пользователь
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Проверить, является ли текущий пользователь админом
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

/**
 * Выйти из аккаунта
 */
function logout() {
  setCurrentUser(null);
  window.location.href = 'index.html';
}

/**
 * Валидация регистрации
 */
function validateRegistration(login, password) {
  if (login.length < 3) {
    alert('Логин должен быть не менее 3 символов');
    return false;
  }
  if (password.length < 8) {
    alert('Пароль должен быть не менее 8 символов');
    return false;
  }
  return true;
}

/**
 * Регистрация нового пользователя
 */
function register(login, password, email) {
  const users = getUsers();
  
  // Проверка уникальности логина
  if (users.some(u => u.login === login)) {
    alert('Этот логин уже занят');
    return false;
  }
  
  const newUser = {
    login,
    password,
    email: email || '',
    role: 'user',
    orders: []
  };
  
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  return true;
}

/**
 * Вход пользователя
 */
function loginUser(login, password) {
  const users = getUsers();
  const user = users.find(u => u.login === login && u.password === password);
  
  if (!user) {
    alert('Неверный логин или пароль');
    return false;
  }
  
  // Если админ — перенаправляем на страницу админа
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
    return true;
  }
  
  setCurrentUser(user);
  return true;
}

/**
 * Обновить данные пользователя
 */
function updateUserData(login, password, email) {
  const users = getUsers();
  const current = getCurrentUser();
  
  if (!current) return false;
  
  const idx = users.findIndex(u => u.login === current.login);
  if (idx === -1) return false;
  
  users[idx] = { ...users[idx], login, password, email };
  saveUsers(users);
  setCurrentUser(users[idx]);
  return true;
}

/**
 * Добавить заявку текущему пользователю
 */
function addOrder(order) {
  const current = getCurrentUser();
  if (!current) return false;
  
  const users = getUsers();
  const idx = users.findIndex(u => u.login === current.login);
  if (idx === -1) return false;
  
  users[idx].orders.push(order);
  saveUsers(users);
  setCurrentUser(users[idx]);
  return true;
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ХЕДЕРА
// ============================================

/**
 * Обновить хедер в зависимости от состояния авторизации
 */
function updateHeader() {
  const loginBtn = document.getElementById('login-btn');
  const loginTxt = document.getElementById('login-txt');
  if (!loginBtn || !loginTxt) return;
  
  const user = getCurrentUser();
  
  if (user) {
    loginTxt.textContent = 'Личный кабинет';
    loginBtn.onclick = () => { window.location.href = 'profile.html'; };
  } else {
    loginTxt.textContent = 'Вход / Регистрация';
    loginBtn.onclick = openAuthModal;
  }
}

/**
 * Выделить текущую страницу в навигации 
 */
function highlightCurrentPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.flxb-txts-main-page a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ============================================
// МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ
// ============================================

function openAuthModal() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) {
    overlay.classList.add('active');
  }
}

function closeAuthModal() {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
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
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateHeader();
  highlightCurrentPage();
  
  // Обработчики модального окна
  const authClose = document.querySelector('.auth-close');
  if (authClose) {
    authClose.addEventListener('click', closeAuthModal);
  }
  
  
  // Переключение табов
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  if (loginTab) loginTab.addEventListener('click', () => switchAuthTab('login'));
  if (registerTab) registerTab.addEventListener('click', () => switchAuthTab('register'));

  // Обработка входа
  const loginFormEl = document.getElementById('login-form-fields');
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const login = document.getElementById('login-input').value.trim();
      const password = document.getElementById('login-password').value;
      
      if (loginUser(login, password)) {
        if (!isAdmin()) {
          closeAuthModal();
          updateHeader();
          // Перезагрузить страницу для обновления интерфейса
          window.location.reload();
        }
      }
    });
  }
  
  // Обработка регистрации
  const registerFormEl = document.getElementById('register-form-fields');
  if (registerFormEl) {
    registerFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const login = document.getElementById('register-login').value.trim();
      const password = document.getElementById('register-password').value;
      const email = document.getElementById('register-email').value.trim();
      
      if (validateRegistration(login, password)) {
        if (register(login, password, email)) {
          closeAuthModal();
          updateHeader();
          window.location.reload();
        }
      }
    });
  }
});
