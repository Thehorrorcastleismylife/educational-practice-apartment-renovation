// catalog.js

async function loadServices() {
    try {
        const response = await fetch(`${API_URL}?action=getServices`, {
            credentials: 'include'
        });
        const services = await response.json();
        if (!Array.isArray(services)) return [];
        return services;
    } catch (e) {
        console.error('Ошибка загрузки услуг:', e);
        return [];
    }
}

function getTypeLabel(type) {
    const labels = {
        'finishing': 'Отделочные работы',
        'tile': 'Плиточные работы',
        'general': 'Санузел'
    };
    return labels[type] || type;
}

function renderServices(services) {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    if (services.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">Услуги не найдены</p>';
        return;
    }

    grid.innerHTML = services.map(service => `
        <a href="detail.html?id=${service.id}" class="catalog-card">
            <img src="${service.image || 'media/default.jpg'}" alt="${service.title}" class="catalog-card-image">
            <div class="catalog-card-body">
                <div class="catalog-card-price">${service.pricePerSqm.toLocaleString()} ₽/м²</div>
                <h3 class="catalog-card-title">${service.title}</h3>
                <div class="catalog-card-meta">
                    <span class="catalog-card-badge">${service.durationDays} дней</span>
                    <span class="catalog-card-type">${getTypeLabel(service.type)}</span>
                </div>
            </div>
        </a>
    `).join('');
}

let allServices = [];

async function applyFilters() {
    if (!allServices.length) return;
    let filtered = [...allServices];

    // Фильтр по цене
    const maxPrice = parseInt(document.getElementById('price-slider').value);
    filtered = filtered.filter(s => s.pricePerSqm <= maxPrice);

    // Фильтр по типу
    const finishing = document.getElementById('filter-finishing').checked;
    const tile = document.getElementById('filter-tile').checked;
    const general = document.getElementById('filter-general').checked; // вместо bathroom

    if (finishing || tile || general) {
        filtered = filtered.filter(s => {
            if (finishing && s.type === 'finishing') return true;
            if (tile && s.type === 'tile') return true;
            if (general && s.type === 'general') return true;
            return false;
        });
    }

    // Фильтр по сроку
    const maxDays = parseInt(document.getElementById('duration-max').value) || 999;
    filtered = filtered.filter(s => s.durationDays <= maxDays);

    // Сортировка
    const sort = document.getElementById('sort-select').value;
    if (sort === 'price-asc') {
        filtered.sort((a, b) => a.pricePerSqm - b.pricePerSqm);
    } else if (sort === 'price-desc') {
        filtered.sort((a, b) => b.pricePerSqm - a.pricePerSqm);
    }

    renderServices(filtered);
}

function updatePriceDisplay() {
    const slider = document.getElementById('price-slider');
    const display = document.getElementById('price-display');
    if (!slider || !display) return;
    display.textContent = `до ${parseInt(slider.value).toLocaleString()} ₽/м²`;
    const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--progress', percent + '%');
}

function resetFilters() {
    document.getElementById('price-slider').value = 10000;
    document.getElementById('filter-finishing').checked = false;
    document.getElementById('filter-tile').checked = false;
    document.getElementById('filter-general').checked = false;
    document.getElementById('duration-max').value = '';
    document.getElementById('sort-select').value = 'default';
    updatePriceDisplay();
    applyFilters();
}

document.addEventListener('DOMContentLoaded', async () => {
    allServices = await loadServices();
    renderServices(allServices);
    updatePriceDisplay();

    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) priceSlider.addEventListener('input', () => { updatePriceDisplay(); applyFilters(); });

    document.getElementById('filter-finishing')?.addEventListener('change', applyFilters);
    document.getElementById('filter-tile')?.addEventListener('change', applyFilters);
    document.getElementById('filter-general')?.addEventListener('change', applyFilters);
    document.getElementById('duration-max')?.addEventListener('input', applyFilters);
    document.getElementById('sort-select')?.addEventListener('change', applyFilters);
    document.getElementById('reset-btn')?.addEventListener('click', resetFilters);
});