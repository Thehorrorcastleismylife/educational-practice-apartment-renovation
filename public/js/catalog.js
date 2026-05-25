/* ============================================
   КАТАЛОГ УСЛУГ (catalog.js)
   ============================================ */

// --- Мок-данные: 9 услуг по 3 категориям ---
const servicesData = [
  // ОТДЕЛОЧНЫЕ РАБОТЫ
  {
    id: 1,
    title: 'Поклейка обоев',
    pricePerSqm: 350,
    durationDays: 2,
    type: 'отделочные',
    image: 'media/пример-поклейки-обоев.png',
    description: 'Профессиональная поклейка обоев любого типа: бумажные, виниловые, флизелиновые, текстильные. Идеально ровные стены без пузырей и складок.',
    includedWorks: ['Подготовка стен', 'Нанесение клея', 'Поклейка обоев', 'Установка бордюров']
  },
  {
    id: 2,
    title: 'Обои под покраску',
    pricePerSqm: 400,
    durationDays: 3,
    type: 'отделочные',
    image: 'media/обои-под-покраску.png',
    description: 'Поклейка стеклообоев или флизелиновых обоев под последующую покраску. Долговечное решение для современных интерьеров.',
    includedWorks: ['Шпаклевка', 'Поклейка обоев', 'Грунтовка', 'Покраска (опционально)']
  },
  {
    id: 3,
    title: 'Покраска стен',
    pricePerSqm: 300,
    durationDays: 2,
    type: 'отделочные',
    image: 'media/покраска стен.jpeg',
    description: 'Качественная покраска стен водоэмульсионными, латексными или акриловыми красками. Ровный цвет без разводов и подтёков.',
    includedWorks: ['Очистка стен', 'Грунтовка', 'Шпаклевка', 'Покраска в 2 слоя']
  },
  {
    id: 4,
    title: 'Декоративная штукатурка',
    pricePerSqm: 1200,
    durationDays: 5,
    type: 'отделочные',
    image: 'media/декоративаня штукатурка.jpg',
    description: 'Нанесение декоративной штукатурки с различными фактурами: венецианская, шёлк, марсельский воск, травертино.',
    includedWorks: ['Подготовка основания', 'Нанесение штукатурки', 'Покрытие воском', 'Финишная полировка']
  },
  // ПЛИТОЧНЫЕ РАБОТЫ
  {
    id: 5,
    title: 'Укладка плитки на полах (кроме санузлов)',
    pricePerSqm: 900,
    durationDays: 3,
    type: 'плиточные',
    image: 'media/плитка в комнате.jpg',
    description: 'Профессиональная укладка керамической, керамогранитной или мозаичной плитки на полах в жилых комнатах, коридорах, на кухне.',
    includedWorks: ['Выравнивание основания', 'Разметка', 'Укладка плитки', 'Затирка швов']
  },
  // РАБОТЫ ПО САНУЗЛАМ
  {
    id: 6,
    title: 'Выравнивание стен (в санузлах)',
    pricePerSqm: 800,
    durationDays: 3,
    type: 'санузел',
    image: 'media/выравнивание стен в ванной.jpg',
    description: 'Выравнивание стен в ванной комнате и туалете под укладку плитки. Идеально ровная поверхность для долговечной отделки.',
    includedWorks: ['Демонтаж старой плитки', 'Штукатурка', 'Шпаклевка', 'Грунтовка']
  },
  {
    id: 7,
    title: 'Установка ванны',
    pricePerSqm: 4500,
    durationDays: 1,
    type: 'санузел',
    image: 'media/установка ванны.jpg',
    description: 'Установка акриловой, чугунной или стальной ванны с подключением к канализации и водоснабжению. Герметичность гарантирована.',
    includedWorks: ['Демонтаж старой ванны', 'Установка новой', 'Подключение сифона', 'Проверка герметичности']
  },
  {
    id: 8,
    title: 'Установка раковины',
    pricePerSqm: 2500,
    durationDays: 1,
    type: 'санузел',
    image: 'media/установка раковины санузел.png',
    description: 'Монтаж раковины с тумбой или подвесной консоли. Подключение смесителя и сифона. Установка зеркала при необходимости.',
    includedWorks: ['Разметка', 'Крепление консоли', 'Установка раковины', 'Подключение смесителя']
  },
  {
    id: 9,
    title: 'Замена полотенцесушителя',
    pricePerSqm: 3500,
    durationDays: 1,
    type: 'санузел',
    image: 'media/замена полотенцесушителя.jpg',
    description: 'Демонтаж старого и установка нового полотенцесушителя. Работа с трубами ГВС и ХВС, проверка давления и отсутствие протечек.',
    includedWorks: ['Демонтаж старого', 'Монтаж нового', 'Сварка/резьбовое соединение', 'Проверка на протечки']
  }
];


function saveServicesData() {
  localStorage.setItem('remont_services', JSON.stringify(servicesData));
}

if (!localStorage.getItem('remont_services')) {
  saveServicesData();
}

function renderServices(services) {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  if (services.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">Услуги не найдены</p>';
    return;
  }

  grid.innerHTML = services.map(service => `
    <a href="detail.html?id=${service.id}" class="catalog-card">
      <img src="${service.image}" alt="${service.title}" class="catalog-card-image">
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

/**
 * Получить человекочитаемую метку типа
 */
function getTypeLabel(type) {
  const labels = {
    'отделочные': 'Отделочные работы',
    'плиточные': 'Плиточные работы',
    'санузел': 'Работы по санузлам'
  };
  return labels[type] || type;
}


// function escapeHtml(text) {
//   const div = document.createElement('div');
//   div.textContent = text;
//   return div.innerHTML;
// }


function applyFilters() {
  let filtered = [...servicesData];

  // Фильтр по цене
  const maxPrice = parseInt(document.getElementById('price-slider').value);
  filtered = filtered.filter(s => s.pricePerSqm <= maxPrice);

  // Фильтр по типу
  const finishing = document.getElementById('filter-finishing').checked;
  const tile = document.getElementById('filter-tile').checked;
  const bathroom = document.getElementById('filter-bathroom').checked;

  // Если хотя бы один чекбокс выбран — применяем фильтрацию по типам
  if (finishing || tile || bathroom) {
    filtered = filtered.filter(s => {
      if (finishing && s.type === 'отделочные') return true;
      if (tile && s.type === 'плиточные') return true;
      if (bathroom && s.type === 'санузел') return true;
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
  document.getElementById('filter-bathroom').checked = false;
  document.getElementById('duration-max').value = '';
  document.getElementById('sort-select').value = 'default';
  updatePriceDisplay();
  renderServices(servicesData);
}


document.addEventListener('DOMContentLoaded', () => {
  renderServices(servicesData);
  updatePriceDisplay();

  const priceSlider = document.getElementById('price-slider');
  if (priceSlider) {
    priceSlider.addEventListener('input', () => {
      updatePriceDisplay();
      applyFilters();
    });
  }

  document.getElementById('filter-finishing')?.addEventListener('change', applyFilters);
  document.getElementById('filter-tile')?.addEventListener('change', applyFilters);
  document.getElementById('filter-bathroom')?.addEventListener('change', applyFilters);
  document.getElementById('duration-max')?.addEventListener('input', applyFilters);
  document.getElementById('sort-select')?.addEventListener('change', applyFilters);
  document.getElementById('reset-btn')?.addEventListener('click', resetFilters);
});
