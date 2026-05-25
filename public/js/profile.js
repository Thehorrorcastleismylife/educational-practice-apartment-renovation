/* ============================================
   ЛИЧНЫЙ КАБИНЕТ (profile.js)
   ============================================ */

/**
 * Проверить авторизацию и перенаправить если не авторизован
 */
function checkAuth() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

/**
 * Отрисовать список заказов
 */
function renderOrders() {
  const user = checkAuth();
  if (!user) return;
  
  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;
  
  const orders = user.orders || [];
  
  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="empty-orders">У вас пока нет оформленных заявок</p>';
    return;
  }
  
  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <span class="order-badge">${order.status}</span>
      <h4>${order.serviceTitle}</h4>
      <p><strong>Площадь:</strong> ${order.area} м²</p>
      <p><strong>Бюджет:</strong> ${order.budget.toLocaleString()} ₽</p>
      ${order.wishes ? `<p><strong>Пожелания:</strong> ${order.wishes}</p>` : ''}
      <p class="order-date">Оформлено: ${order.date}</p>
    </div>
  `).join('');
}

/**
 * Заполнить форму данных пользователя
 */
function fillUserData() {
  const user = checkAuth();
  if (!user) return;
  
  const loginInput = document.getElementById('data-login');
  const passInput = document.getElementById('data-password');
  const emailInput = document.getElementById('data-email');
  
  if (loginInput) loginInput.value = user.login;
  if (passInput) passInput.value = user.password;
  if (emailInput) emailInput.value = user.email || '';
}

/**
 * Сохранить данные пользователя
 */
function handleSaveData(e) {
  e.preventDefault();
  
  const login = document.getElementById('data-login').value.trim();
  const password = document.getElementById('data-password').value;
  const email = document.getElementById('data-email').value.trim();
  
  if (login.length < 3) {
    alert('Логин должен быть не менее 3 символов');
    return;
  }
  if (password.length < 8) {
    alert('Пароль должен быть не менее 8 символов');
    return;
  }
  
  if (typeof updateUserData === 'function') {
    if (updateUserData(login, password, email)) {
      alert('Данные сохранены');
    }
  }
}


// function escapeHtml(text) {
//   const div = document.createElement('div');
//   div.textContent = text;
//   return div.innerHTML;
// }

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  renderOrders();
  fillUserData();
  
  const dataForm = document.getElementById('data-form');
  if (dataForm) {
    dataForm.addEventListener('submit', handleSaveData);
  }
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (typeof logout === 'function') {
        logout();
      } else {
        localStorage.removeItem('remont_auth');
        window.location.href = 'index.html';
      }
    });
  }
});
