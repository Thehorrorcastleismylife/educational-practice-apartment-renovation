function getServiceIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

async function loadServiceById(id) {
    try {
        const response = await fetch(`${API_URL}?action=getServiceById&id=${id}`, {
            credentials: 'include'
        });
        
        const service = await response.json();
        if (service.error) throw new Error(service.error);
        return service;
    } catch (e) {
        console.error(e);
        return null;
    }
}

function getTypeLabel(type) {
    const labels = {
        'finishing': 'Отделочные работы',
        'tile': 'Плиточные работы',
        'general': 'Работы по санузлам'
    };
    return labels[type] || type;
}

async function renderServiceDetail() {
    const id = getServiceIdFromUrl();
    const service = await loadServiceById(id);

    if (!service) {
        document.getElementById('detail-container').innerHTML = `<p style="text-align: center; padding: 40px;">Услуга не найдена</p>`;
        return;
    }

    document.title = `${service.title} — Ремонт квартир`;

    const heroImg = document.getElementById('detail-hero-img');
    if (heroImg) heroImg.src = service.image || 'media/default.jpg';

    const title = document.getElementById('detail-title');
    if (title) title.textContent = service.title;

    const price = document.getElementById('detail-price');
    if (price) price.textContent = `${service.pricePerSqm.toLocaleString()} ₽/м²`;

    const duration = document.getElementById('detail-duration');
    if (duration) duration.textContent = `${service.durationDays} дней`;

    const type = document.getElementById('detail-type');
    if (type) type.textContent = getTypeLabel(service.type);

    const desc = document.getElementById('detail-description');
    if (desc) desc.textContent = service.description;

    const serviceIdInput = document.getElementById('service-id');
    if (serviceIdInput) serviceIdInput.value = service.id;
}

async function handleOrderSubmit(e) {
     console.log('handleOrderSubmit called!');
    e.preventDefault();

    // Проверка авторизации
    const user = await getCurrentUser();
    if (!user) {
        alert('Для оформления заявки необходимо войти в аккаунт');
        openAuthModal();
        return;
    }

    const area = parseFloat(document.getElementById('order-area').value);
    const wishes = document.getElementById('order-wishes').value;
    const address = document.getElementById('order-address').value.trim();
    const serviceId = parseInt(document.getElementById('service-id').value);

    if (!area || area < 10) {
        alert('Площадь квартиры должна быть не менее 10 м²');
        return;
    }
    if (!address) {
        alert('Введите адрес');
        return;
    }

    const submitBtn = document.getElementById('order-submit');
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}?action=createOrder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({ serviceId, area, wishes, address })
        });
        const data = await response.json();
        if (data.success) {
            // alert('Заявка оформлена');
            window.location.href = 'profile.html';
        } else {
            alert(data.error || 'Ошибка при оформлении');
            submitBtn.disabled = false;
        }
    } catch (err) {
        console.error('ERROR DETAILS:', err.name, err.message, err.stack);
        alert('Ошибка соединения');
        submitBtn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderServiceDetail();
    initPhoneMask();

    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
});