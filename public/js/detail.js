/* ============================================
   ДЕТАЛЬНАЯ СТРАНИЦА УСЛУГИ (detail.js)
   ============================================ */

/**
 * Получить ID услуги из URL-параметра
 */
function getServiceIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

/**
 * Получить данные услуги по ID
 */
function getServiceById(id) {
  const data = localStorage.getItem('remont_services');
  const services = data ? JSON.parse(data) : [];
  return services.find(s => s.id === id);
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

/**
 * Отрисовать страницу услуги
 */
function renderServiceDetail() {
  const id = getServiceIdFromUrl();
  const service = getServiceById(id);

  if (!service) {
    document.getElementById('detail-container').innerHTML = `
      <p style="text-align: center; padding: 40px; color: #999;">Услуга не найдена</p>
    `;
    return;
  }

  // Заголовок страницы
  document.title = `${service.title} — Ремонт квартир`;

  // Главное фото
  const heroImg = document.getElementById('detail-hero-img');
  if (heroImg) heroImg.src = service.image;

  // Информация
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

  // Список работ
  const worksList = document.getElementById('works-list');
  if (worksList) {
    worksList.innerHTML = service.includedWorks.map(w => 
      `<li>${escapeHtml(w)}</li>`
    ).join('');
  }

  // Скрытое поле с ID услуги
  const serviceIdInput = document.getElementById('service-id');
  if (serviceIdInput) serviceIdInput.value = service.id;
}

/**
 * Защита от XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ============================================
   МАСКА ТЕЛЕФОНА — современная реализация
   ============================================ */

const PHONE_MASK = '+7 (___) ___-__-__';

/**
 * Инициализировать поле ввода телефона с маской
 */
function initPhoneMask() {
  const phoneInput = document.getElementById('order-telephone');
  if (!phoneInput) return;

  // Установить начальное значение
  phoneInput.value = PHONE_MASK;

  phoneInput.addEventListener('focus', () => {
    // Если поле пустое или содержит только маску — сбросить курсор в начало
    if (phoneInput.value === PHONE_MASK || !phoneInput.value) {
      phoneInput.value = PHONE_MASK;
      setCaretPosition(phoneInput, 4); // после "+7 ("
    }
  });

  phoneInput.addEventListener('blur', () => {
    // Если не введено ни одной цифры — сбросить маску
    const digits = extractDigits(phoneInput.value);
    if (digits.length === 0) {
      phoneInput.value = PHONE_MASK;
    }
  });

  phoneInput.addEventListener('keydown', (e) => {
    handlePhoneKeyDown(e, phoneInput);
  });

  phoneInput.addEventListener('input', (e) => {
    // Предотвращаем стандартное поведение input
    e.preventDefault();
  });

  // Запретить вставку
  phoneInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const digits = pasted.replace(/\D/g, '');
    insertDigits(phoneInput, digits);
  });
}

/**
 * Обработка нажатия клавиши в поле телефона
 */
function handlePhoneKeyDown(e, input) {
  const key = e.key;
  const isDigit = /^[0-9]$/.test(key);
  const isBackspace = key === 'Backspace';
  const isDelete = key === 'Delete';
  const isArrow = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key);
  const isTab = key === 'Tab';
  const isCtrl = e.ctrlKey || e.metaKey;

  // Разрешить навигацию и системные комбинации
  if (isArrow || isTab || isCtrl) return;

  e.preventDefault();

  let pos = getCaretPosition(input);

  if (isDigit) {
    // Найти позицию первого "_" справа от курсора
    let insertPos = findNextUnderscore(input.value, pos);
    if (insertPos === -1) return; // Все слоты заполнены

    // Заменить "_" на цифру
    const arr = input.value.split('');
    arr[insertPos] = key;
    input.value = arr.join('');

    // Переместить курсор после вставленной цифры
    const nextPos = findNextUnderscore(input.value, insertPos + 1);
    if (nextPos !== -1) {
      setCaretPosition(input, nextPos);
    } else {
      // Все цифры введены — переместить в конец
      setCaretPosition(input, input.value.length);
    }
  }

  if (isBackspace || isDelete) {
    // Найти позицию последнего заполненного слота (не символа маски)
    let deletePos = findLastFilledSlot(input.value);
    if (deletePos === -1) return;

    const arr = input.value.split('');
    arr[deletePos] = '_';
    input.value = arr.join('');

    setCaretPosition(input, deletePos);
  }
}

/**
 * Найти позицию следующего "_" начиная с указанной позиции
 */
function findNextUnderscore(str, startPos) {
  for (let i = startPos; i < str.length; i++) {
    if (str[i] === '_') return i;
  }
  return -1;
}

/**
 * Найти позицию последнего заполненного слота (цифры, не символа маски)
 */
function findLastFilledSlot(str) {
  // Символы маски, которые нельзя удалять
  const maskChars = new Set(['+', ' ', '(', ')', '-']);
  for (let i = str.length - 1; i >= 0; i--) {
    const ch = str[i];
    if (ch !== '_' && !maskChars.has(ch)) {
      return i;
    }
  }
  return -1;
}

/**
 * Вставить несколько цифр (при вставке из буфера)
 */
function insertDigits(input, digits) {
  for (const digit of digits) {
    let pos = getCaretPosition(input);
    let insertPos = findNextUnderscore(input.value, pos);
    if (insertPos === -1) break;

    const arr = input.value.split('');
    arr[insertPos] = digit;
    input.value = arr.join('');
    setCaretPosition(input, insertPos + 1);
  }
}

/**
 * Извлечь все цифры из строки
 */
function extractDigits(str) {
  return str.replace(/\D/g, '');
}

/**
 * Получить позицию курсора
 */
function getCaretPosition(input) {
  return input.selectionStart || 0;
}

/**
 * Установить позицию курсора
 */
function setCaretPosition(input, pos) {
  input.setSelectionRange(pos, pos);
}

/**
 * Получить чистый номер телефона (11 цифр)
 */
function getCleanPhone() {
  const phoneInput = document.getElementById('order-telephone');
  if (!phoneInput) return '';
  const digits = extractDigits(phoneInput.value);
  // Убедиться, что первая цифра — 7 (код страны)
  if (digits.length > 0 && digits[0] !== '7') {
    return '7' + digits.slice(0, 10);
  }
  return digits.slice(0, 11);
}

/* ============================================
   ОБРАБОТКА ФОРМЫ ЗАЯВКИ
   ============================================ */

/**
 * Обработка отправки формы заявки
 */
function handleOrderSubmit(e) {
  e.preventDefault();

  // Проверка авторизации
  const user = getCurrentUser ? getCurrentUser() : null;
  if (!user) {
    alert('Для оформления заявки необходимо войти в аккаунт');
    openAuthModal();
    return;
  }

  const area = parseFloat(document.getElementById('order-area').value);
  const budget = parseFloat(document.getElementById('order-budget').value);
  const wishes = document.getElementById('order-wishes').value.trim();
  const serviceId = parseInt(document.getElementById('service-id').value);

  // Получаем номер телефона
  const phone = getCleanPhone();

  // Валидация площади
  if (!area || area < 10) {
    alert('Площадь квартиры должна быть не менее 10 м²');
    return;
  }
  // Валидация бюджета
  if (!budget || budget > 2000000) {
    alert('Бюджет не может превышать 2 000 000 ₽');
    return;
  }

  // Валидация телефона
  if (phone.length < 11) {
    alert('Введите полный номер телефона (11 цифр)');
    return;
  }

  const service = getServiceById(serviceId);

  // Создаём заявку
  const order = {
    id: Date.now(),
    serviceId: serviceId,
    serviceTitle: service ? service.title : 'Неизвестная услуга',
    area: area,
    budget: budget,
    phone: phone,           // ← добавлен номер телефона
    wishes: wishes,
    date: new Date().toLocaleDateString('ru-RU'),
    status: 'Оформлено'
  };

  // Сохраняем заявку
  const submitBtn = document.getElementById('order-submit');
  submitBtn.disabled = true;

  // Используем функцию addOrder из auth.js
  if (typeof addOrder === 'function') {
    addOrder(order);
  } else {
    // Fallback если auth.js не загружен
    const users = JSON.parse(localStorage.getItem('remont_users') || '[]');
    const current = JSON.parse(localStorage.getItem('remont_auth') || 'null');
    if (current) {
      const idx = users.findIndex(u => u.login === current.login);
      if (idx !== -1) {
        users[idx].orders.push(order);
        localStorage.setItem('remont_users', JSON.stringify(users));
        localStorage.setItem('remont_auth', JSON.stringify(users[idx]));
      }
    }
  }

  alert('Заявка оформлена');
  window.location.href = 'profile.html';
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  renderServiceDetail();
  initPhoneMask();

  const orderForm = document.getElementById('order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderSubmit);
  }
});
