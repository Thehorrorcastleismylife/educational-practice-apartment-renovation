// profile.js


async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

async function renderOrders() {
    const user = await checkAuth();
    if (!user) return;

    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;

    try {
        const response = await fetch(`${API_URL}?action=getUserOrders`, {
            credentials: 'include'
        });
        const orders = await response.json();
        if (!Array.isArray(orders) || orders.length === 0) {
            ordersList.innerHTML = '<p class="empty-orders">У вас пока нет оформленных заявок</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <span class="order-badge ${order.status}">${order.status === 'in_progress' ? 'В работе' : 'Выполнено'}</span>
                <h4>${order.serviceTitle}</h4>
                <p><strong>Площадь:</strong> ${order.area} м²</p>
                <p><strong>Адрес:</strong> ${order.address}</p>
                ${order.wishes ? `<p><strong>Пожелания:</strong> ${order.wishes}</p>` : ''}
                <p class="order-date">Оформлено: ${new Date(order.date).toLocaleDateString('ru-RU')}</p>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
        ordersList.innerHTML = '<p class="empty-orders">Ошибка загрузки заказов</p>';
    }
}
async function fillUserData() {
    const user = await checkAuth();
    if (!user) return;

    const nameSpan = document.getElementById('user-name');
    const emailSpan = document.getElementById('user-email');
    const phoneSpan = document.getElementById('user-phone');

    if (nameSpan) nameSpan.textContent = `${user.surname} ${user.name} ${user.middlename}`;
    if (emailSpan) emailSpan.textContent = user.email;
    if (phoneSpan) phoneSpan.textContent = user.phone;
}

document.addEventListener('DOMContentLoaded', async () => {
    await renderOrders();
    await fillUserData();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
        });
    }
});