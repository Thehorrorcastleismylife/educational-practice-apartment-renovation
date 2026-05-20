/* ============================================================
   УСЛУГИ ПО РЕМОНТУ КВАРТИР — ОСНОВНАЯ ЛОГИКА
   Локальное хранилище (localStorage), авторизация,
   фильтрация, роутинг между страницами
   ============================================================ */

// —— ИМИТАЦИЯ БАЗЫ ДАННЫХ: массив пользователей ——
const DEFAULT_USERS = [
    {
        login: "admin",
        password: "admin",
        email: "admin@repair.ru",
        role: "admin",
        orders: []
    }
];

// —— ИМИТАЦИЯ БАЗЫ ДАННЫХ: каталог услуг по ремонту ——
const SERVICES_DB = [
    {
        id: 1,
        title: "Косметический ремонт",
        pricePerSqM: 1500,
        durationDays: 14,
        type: "cosmetic",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop",
        description: "Обновление интерьера без демонтажа стен и перепланировки. Включает покраску стен, поклейку обоев, замену напольного покрытия, обновление сантехники и электрики. Идеальный вариант для придания квартире свежего вида с минимальными затратами и в короткие сроки."
    },
    {
        id: 2,
        title: "Капитальный ремонт",
        pricePerSqM: 3500,
        durationDays: 45,
        type: "capital",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop",
        description: "Полная реконструкция помещения с демонтажем старых конструкций, выравниванием стен и полов, заменой электропроводки и труб. Включает штукатурку, стяжку пола, установку новых дверей и окон. Подходит для квартир, требующих кардинального обновления."
    },
    {
        id: 3,
        title: "Дизайнерский ремонт",
        pricePerSqM: 5500,
        durationDays: 60,
        type: "design",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop",
        description: "Уникальный интерьер, разработанный профессиональным дизайнером. Индивидуальный проект с подбором материалов премиум-класса, авторская мебель, декоративное освещение, нестандартные решения для каждой комнаты. Создаём пространство, отражающее вашу личность."
    },
    {
        id: 4,
        title: "Евроремонт",
        pricePerSqM: 4500,
        durationDays: 50,
        type: "euro",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
        description: "Современный ремонт по европейским стандартам качества. Ровные стены и потолки, скрытые двери, встроенная техника, тёплые полы, умный дом. Используем материалы высокого качества от проверенных производителей. Чистота и порядок на объекте гарантированы."
    },
    {
        id: 5,
        title: "Ремонт студии",
        pricePerSqM: 2800,
        durationDays: 30,
        type: "cosmetic",
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop",
        description: "Оптимизация пространства небольшой квартиры-студии. Зонирование с помощью перегородок, многофункциональная мебель, визуальное расширение пространства светом и цветом. Максимум комфорта на минимальной площади."
    },
    {
        id: 6,
        title: "VIP-ремонт под ключ",
        pricePerSqM: 8000,
        durationDays: 75,
        type: "design",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop",
        description: "Премиальный ремонт с полным сопровождением: от эскизного проекта до расстановки аксессуаров. Натуральный мрамор, паркет ручной укладки, дизайнерский свет, смарт-системы управления. Персональный менеджер контролирует каждый этап работы."
    }
];

// —— Ключи localStorage ——
const STORAGE_KEYS = {
    USERS: "repair_users",
    CURRENT_USER: "repair_current_user",
    SELECTED_SERVICE: "repair_selected_service",
    PENDING_REDIRECT: "repair_pending_redirect"
};

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ ХРАНИЛИЩА
   ============================================================ */

/**
 * Инициализирует localStorage: создаёт дефолтных пользователей,
 * если ранее не были сохранены.
 */
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
}

/** Возвращает массив всех пользователей из localStorage */
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}

/** Сохраняет массив пользователей в localStorage */
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/** Возвращает объект текущего авторизованного пользователя или null */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
}

/** Сохраняет текущего пользователя в localStorage */
function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

/** Удаляет текущего пользователя (выход из системы) */
function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/** Возвращает true, если пользователь авторизован */
function isAuthenticated() {
    return getCurrentUser() !== null;
}

/** Возвращает true, если текущий пользователь — админ */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === "admin";
}

/* ============================================================
   ОБНОВЛЕНИЕ HEADER (кнопка входа / личный кабинет / выход)
   ============================================================ */

/**
 * Обновляет кнопку в шапке в зависимости от состояния авторизации.
 * На главной — "Вход / Регистрация" или "Личный кабинет".
 * На остальных страницах — "Личный кабинет" или скрыта.
 */
function updateHeader() {
    const authBtn = document.getElementById("auth-toggle-btn");
    const user = getCurrentUser();

    if (!authBtn) return;

    if (user) {
        // Авторизован — показываем "Личный кабинет"
        authBtn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span id="login-txt">${user.login}</span>
        `;
        authBtn.onclick = () => {
            window.location.href = "profile.html";
        };
    } else {
        // Не авторизован — показываем "Вход / Регистрация"
        const isIndexPage = document.body.id === "index-page";
        if (isIndexPage) {
            authBtn.innerHTML = `
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span id="login-txt">Вход / Регистрация</span>
            `;
            authBtn.onclick = () => {
                toggleAuthBlock(true);
            };
        } else {
            // На других страницах без авторизации скрываем кнопку
            authBtn.style.display = "none";
        }
    }
}

/**
 * Обрабатывает выход из аккаунта.
 * Очищает currentUser и перенаправляет на главную.
 */
function handleLogout() {
    clearCurrentUser();
    localStorage.removeItem(STORAGE_KEYS.SELECTED_SERVICE);
    window.location.href = "index.html";
}

/* ============================================================
   БЛОК АВТОРИЗАЦИИ (вкладки Вход / Регистрация)
   ============================================================ */

/**
 * Показывает или скрывает блок авторизации.
 * @param {boolean} show — true для показа, false для скрытия
 */
function toggleAuthBlock(show) {
    const authSection = document.getElementById("auth-section");
    const mainContent = document.getElementById("main-content");
    if (!authSection) return;

    if (show) {
        authSection.classList.add("active");
        if (mainContent) mainContent.classList.add("hidden");
    } else {
        authSection.classList.remove("active");
        if (mainContent) mainContent.classList.remove("hidden");
    }
}

/**
 * Переключает между вкладками "Вход" и "Регистрация".
 * @param {string} tab — 'login' или 'register'
 */
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll(".auth-tab");
    const forms = document.querySelectorAll(".auth-form");

    tabs.forEach(t => t.classList.remove("active"));
    forms.forEach(f => f.classList.remove("active"));

    document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add("active");
    document.getElementById(`auth-form-${tab}`).classList.add("active");

    // Очищаем сообщения при переключении
    document.querySelectorAll(".auth-message").forEach(m => {
        m.className = "auth-message";
    });
}

/**
 * Обработка входа в систему.
 * Проверяет логин и пароль, устанавливает currentUser.
 * Для админа выводит сообщение в консоль.
 */
function handleLogin(e) {
    e.preventDefault();

    const login = document.getElementById("login-input").value.trim();
    const password = document.getElementById("password-input").value;
    const msgEl = document.getElementById("login-message");

    if (!login || !password) {
        showAuthMessage(msgEl, "Заполните все поля", "error");
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.login === login && u.password === password);

    if (!user) {
        showAuthMessage(msgEl, "Неверный логин или пароль", "error");
        return;
    }

    // Успешный вход
    setCurrentUser(user);

    if (user.role === "admin") {
        console.log("Вы админ");
    }

    showAuthMessage(msgEl, "Вход выполнен успешно!", "success");

    // Проверяем, есть ли отложенный редирект (например, после клика на карточку)
    const pendingServiceId = sessionStorage.getItem(STORAGE_KEYS.PENDING_REDIRECT);

    setTimeout(() => {
        if (pendingServiceId) {
            sessionStorage.removeItem(STORAGE_KEYS.PENDING_REDIRECT);
            window.location.href = `detail.html?id=${pendingServiceId}`;
        } else {
            // Обновляем страницу для применения изменений в хедере
            window.location.reload();
        }
    }, 600);
}

/**
 * Обработка регистрации нового пользователя.
 * Добавляет пользователя в массив и сразу авторизует.
 */
function handleRegister(e) {
    e.preventDefault();

    const login = document.getElementById("reg-login").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-password-confirm").value;
    const email = document.getElementById("reg-email").value.trim();
    const msgEl = document.getElementById("register-message");

    // Валидация
    if (!login || !password || !confirmPassword) {
        showAuthMessage(msgEl, "Заполните обязательные поля", "error");
        return;
    }

    if (password !== confirmPassword) {
        showAuthMessage(msgEl, "Пароли не совпадают", "error");
        return;
    }

    if (password.length < 4) {
        showAuthMessage(msgEl, "Пароль должен быть не менее 4 символов", "error");
        return;
    }

    const users = getUsers();

    // Проверка уникальности логина
    if (users.some(u => u.login === login)) {
        showAuthMessage(msgEl, "Пользователь с таким логином уже существует", "error");
        return;
    }

    // Создаём нового пользователя
    const newUser = {
        login: login,
        password: password,
        email: email || "",
        role: "user",
        orders: []
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    showAuthMessage(msgEl, "Регистрация прошла успешно!", "success");

    // Проверяем отложенный редирект
    const pendingServiceId = sessionStorage.getItem(STORAGE_KEYS.PENDING_REDIRECT);

    setTimeout(() => {
        if (pendingServiceId) {
            sessionStorage.removeItem(STORAGE_KEYS.PENDING_REDIRECT);
            window.location.href = `detail.html?id=${pendingServiceId}`;
        } else {
            window.location.reload();
        }
    }, 600);
}

/** Показывает сообщение в форме авторизации */
function showAuthMessage(element, text, type) {
    element.textContent = text;
    element.className = "auth-message " + type;
}

/* ============================================================
   ГЛАВНАЯ СТРАНИЦА (index.html)
   ============================================================ */

/**
 * Инициализирует главную страницу: привязывает обработчики
 * к кнопкам "Хочу!" для сохранения ID услуги и редиректа.
 */
function initIndexPage() {
    const wantButtons = document.querySelectorAll("[data-want-btn]");

    wantButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const serviceId = btn.getAttribute("data-service-id");
            if (serviceId) {
                localStorage.setItem(STORAGE_KEYS.SELECTED_SERVICE, serviceId);
            }
            window.location.href = "catalog.html";
        });
    });

    // Привязываем обработчики к формам авторизации
    const loginForm = document.getElementById("auth-form-login");
    const registerForm = document.getElementById("auth-form-register");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    // Переключение вкладок авторизации
    document.querySelectorAll(".auth-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            switchAuthTab(tab.getAttribute("data-tab"));
        });
    });

    // Если пользователь уже авторизован — скрываем блок авторизации
    if (isAuthenticated()) {
        toggleAuthBlock(false);
    }
}

/* ============================================================
   КАТАЛОГ УСЛУГ (catalog.html)
   ============================================================ */

/**
 * Инициализирует страницу каталога: рендерит карточки,
 * применяет фильтры, подсвечивает выбранную услугу.
 */
function initCatalogPage() {
    renderCatalog(SERVICES_DB);
    setupFilters();
    highlightSelectedService();
    setupServiceCardClicks();

    // Привязываем обработчики авторизации (для показа блока при клике без авторизации)
    const loginForm = document.getElementById("auth-form-login");
    const registerForm = document.getElementById("auth-form-register");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    document.querySelectorAll(".auth-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            switchAuthTab(tab.getAttribute("data-tab"));
        });
    });
}

/**
 * Рендерит сетку карточек услуг в каталоге.
 * @param {Array} services — массив услуг для отображения
 */
function renderCatalog(services) {
    const grid = document.getElementById("catalog-grid");
    if (!grid) return;

    if (services.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #999;">
                <p style="font-size: 18px;">Услуги не найдены</p>
                <p style="font-size: 14px; margin-top: 10px;">Попробуйте изменить параметры фильтров</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = services.map(service => `
        <div class="service-card" data-service-id="${service.id}">
            <img src="${service.image}" alt="${service.title}" class="service-card-img">
            <div class="service-card-body">
                <span class="service-badge">${service.durationDays} дней</span>
                <h3 class="service-title">${service.title}</h3>
                <div class="service-price">
                    ${service.pricePerSqM.toLocaleString('ru-RU')} ₽
                    <span class="service-price-unit">/ м²</span>
                </div>
                <div class="service-meta">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                    </svg>
                    ${getTypeLabel(service.type)}
                </div>
            </div>
        </div>
    `).join('');

    setupServiceCardClicks();
}

/** Возвращает русскую метку типа ремонта */
function getTypeLabel(type) {
    const labels = {
        cosmetic: "Косметический",
        capital: "Капитальный",
        design: "Дизайнерский",
        euro: "Евроремонт"
    };
    return labels[type] || type;
}

/**
 * Настраивает обработчики клика по карточкам услуг.
 * Если не авторизован — показывает блок авторизации.
 * Если авторизован — переходит на detail.html.
 */
function setupServiceCardClicks() {
    document.querySelectorAll(".service-card").forEach(card => {
        card.addEventListener("click", () => {
            const serviceId = card.getAttribute("data-service-id");

            if (!isAuthenticated()) {
                // Запоминаем, на какую услугу хотел перейти пользователь
                sessionStorage.setItem(STORAGE_KEYS.PENDING_REDIRECT, serviceId);
                toggleAuthBlock(true);
            } else {
                window.location.href = `detail.html?id=${serviceId}`;
            }
        });
    });
}

/**
 * Настраивает фильтры каталога: ползунок цены, чекбоксы типа, срок.
 */
function setupFilters() {
    const priceSlider = document.getElementById("filter-price");
    const priceValue = document.getElementById("filter-price-value");
    const typeCheckboxes = document.querySelectorAll(".filter-type-checkbox");
    const durationInput = document.getElementById("filter-duration");
    const resetBtn = document.getElementById("filter-reset");

    if (priceSlider && priceValue) {
        priceSlider.addEventListener("input", () => {
            priceValue.textContent = `${parseInt(priceSlider.value).toLocaleString('ru-RU')} ₽/м²`;
            applyFilters();
        });
    }

    typeCheckboxes.forEach(cb => {
        cb.addEventListener("change", applyFilters);
    });

    if (durationInput) {
        durationInput.addEventListener("input", applyFilters);
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (priceSlider) priceSlider.value = priceSlider.max;
            if (priceValue) priceValue.textContent = `${parseInt(priceSlider.max).toLocaleString('ru-RU')} ₽/м²`;
            typeCheckboxes.forEach(cb => cb.checked = false);
            if (durationInput) durationInput.value = "";
            applyFilters();
        });
    }
}

/**
 * Применяет фильтры к каталогу услуг и перерендеривает сетку.
 */
function applyFilters() {
    const priceSlider = document.getElementById("filter-price");
    const typeCheckboxes = document.querySelectorAll(".filter-type-checkbox:checked");
    const durationInput = document.getElementById("filter-duration");

    const maxPrice = priceSlider ? parseInt(priceSlider.value) : 10000;
    const selectedTypes = Array.from(typeCheckboxes).map(cb => cb.value);
    const maxDuration = durationInput && durationInput.value ? parseInt(durationInput.value) : Infinity;

    const filtered = SERVICES_DB.filter(service => {
        const matchPrice = service.pricePerSqM <= maxPrice;
        const matchType = selectedTypes.length === 0 || selectedTypes.includes(service.type);
        const matchDuration = service.durationDays <= maxDuration;
        return matchPrice && matchType && matchDuration;
    });

    renderCatalog(filtered);
    highlightSelectedService();
}

/**
 * Подсвечивает карточку услуги, ID которой сохранён в localStorage
 * при клике на кнопку "Хочу!" на главной странице.
 */
function highlightSelectedService() {
    const selectedId = localStorage.getItem(STORAGE_KEYS.SELECTED_SERVICE);
    if (!selectedId) return;

    const card = document.querySelector(`.service-card[data-service-id="${selectedId}"]`);
    if (card) {
        card.classList.add("highlighted");
        // Плавная прокрутка к выделенной карточке
        card.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Очищаем выделение после показа
    localStorage.removeItem(STORAGE_KEYS.SELECTED_SERVICE);
}

/* ============================================================
   ДЕТАЛЬНАЯ СТРАНИЦА УСЛУГИ (detail.html)
   ============================================================ */

/**
 * Инициализирует страницу детальной информации об услуге.
 * Получает ID услуги из URL, отображает данные, настраивает форму.
 */
function initDetailPage() {
    // Проверяем авторизацию
    if (!isAuthenticated()) {
        window.location.href = "index.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = parseInt(urlParams.get("id"));

    if (!serviceId) {
        window.location.href = "catalog.html";
        return;
    }

    const service = SERVICES_DB.find(s => s.id === serviceId);
    if (!service) {
        window.location.href = "catalog.html";
        return;
    }

    renderServiceDetails(service);

    // Обработчик отправки формы заявки
    const requestForm = document.getElementById("request-form");
    if (requestForm) {
        requestForm.addEventListener("submit", (e) => handleRequestSubmit(e, service));
    }
}

/**
 * Отображает информацию об услуге на странице.
 * @param {Object} service — объект услуги из SERVICES_DB
 */
function renderServiceDetails(service) {
    const imgEl = document.getElementById("detail-image");
    const titleEl = document.getElementById("detail-title");
    const priceEl = document.getElementById("detail-price");
    const metaEl = document.getElementById("detail-meta");
    const descEl = document.getElementById("detail-description");

    if (imgEl) imgEl.src = service.image;
    if (imgEl) imgEl.alt = service.title;
    if (titleEl) titleEl.textContent = service.title;
    if (priceEl) priceEl.innerHTML = `${service.pricePerSqM.toLocaleString('ru-RU')} ₽ <span class="detail-price-unit">/ м²</span>`;

    if (metaEl) {
        metaEl.innerHTML = `
            <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${service.durationDays} дней
            </div>
            <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                </svg>
                ${getTypeLabel(service.type)}
            </div>
            <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                От ${service.pricePerSqM.toLocaleString('ru-RU')} ₽/м²
            </div>
        `;
    }

    if (descEl) {
        descEl.innerHTML = `
            <h3>Описание работ</h3>
            <p>${service.description}</p>
        `;
    }

    // Заполняем скрытое поле с ID услуги
    const serviceIdInput = document.getElementById("request-service-id");
    if (serviceIdInput) serviceIdInput.value = service.id;
}

/**
 * Обрабатывает отправку формы заявки на ремонт.
 * Сохраняет заявку в массиве orders текущего пользователя.
 * @param {Event} e — событие отправки формы
 * @param {Object} service — объект выбранной услуги
 */
function handleRequestSubmit(e, service) {
    e.preventDefault();

    const area = document.getElementById("request-area").value;
    const budget = document.getElementById("request-budget").value;
    const wishes = document.getElementById("request-wishes").value;

    if (!area || !budget) {
        alert("Пожалуйста, заполните обязательные поля");
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert("Необходимо авторизоваться");
        window.location.href = "index.html";
        return;
    }

    // Создаём объект заявки
    const order = {
        id: Date.now(),
        serviceId: service.id,
        serviceTitle: service.title,
        servicePricePerSqM: service.pricePerSqM,
        area: parseFloat(area),
        budget: parseFloat(budget),
        wishes: wishes || "",
        date: new Date().toLocaleDateString('ru-RU'),
        status: "Оформлено"
    };

    // Добавляем заявку к текущему пользователю
    const users = getUsers();
    const userIndex = users.findIndex(u => u.login === currentUser.login);

    if (userIndex === -1) {
        alert("Ошибка: пользователь не найден");
        return;
    }

    if (!users[userIndex].orders) {
        users[userIndex].orders = [];
    }

    users[userIndex].orders.push(order);
    saveUsers(users);

    // Обновляем currentUser
    currentUser.orders = users[userIndex].orders;
    setCurrentUser(currentUser);

    alert("Заявка оформлена");
    window.location.href = "profile.html#orders";
}

/* ============================================================
   ЛИЧНЫЙ КАБИНЕТ (profile.html)
   ============================================================ */

/**
 * Инициализирует страницу личного кабинета.
 * Проверяет авторизацию, рендерит заказы и данные пользователя.
 */
function initProfilePage() {
    if (!isAuthenticated()) {
        window.location.href = "index.html";
        return;
    }

    renderOrders();
    renderUserData();
    setupProfileNav();
    setupUserDataForm();
    setupLogoutButton();
}

/**
 * Настраивает навигацию по разделам профиля (якорные ссылки).
 */
function setupProfileNav() {
    const hash = window.location.hash || "#orders";

    document.querySelectorAll(".profile-nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === hash) {
            link.classList.add("active");
        }
    });

    // Показываем соответствующий раздел
    document.querySelectorAll(".profile-section").forEach(section => {
        section.style.display = "none";
    });

    const targetSection = document.querySelector(hash === "#data" ? "#my-data" : "#my-orders");
    if (targetSection) {
        targetSection.style.display = "block";
    }

    // Обработка кликов по навигации
    document.querySelectorAll(".profile-nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");

            document.querySelectorAll(".profile-nav-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            document.querySelectorAll(".profile-section").forEach(s => s.style.display = "none");
            const target = document.querySelector(href === "#data" ? "#my-data" : "#my-orders");
            if (target) {
                target.style.display = "block";
                target.classList.add("fade-in");
            }

            window.history.pushState(null, null, href);
        });
    });
}

/**
 * Рендерит список заказов текущего пользователя.
 */
function renderOrders() {
    const container = document.getElementById("orders-list");
    if (!container) return;

    const currentUser = getCurrentUser();
    const orders = currentUser.orders || [];

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-orders">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" style="margin-bottom: 16px;">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>У вас пока нет заказов</p>
                <p style="margin-top: 8px;"><a href="catalog.html">Перейти в каталог услуг →</a></p>
            </div>
        `;
        return;
    }

    // Сортируем заказы по дате (новые сверху)
    const sortedOrders = [...orders].reverse();

    container.innerHTML = sortedOrders.map(order => `
        <div class="order-card fade-in">
            <div class="order-header">
                <span class="order-service-title">${order.serviceTitle}</span>
                <span class="status-badge">${order.status}</span>
            </div>
            <div class="order-details">
                <div class="order-detail-item">
                    <strong>Площадь</strong>
                    <span>${order.area} м²</span>
                </div>
                <div class="order-detail-item">
                    <strong>Бюджет</strong>
                    <span>${order.budget.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div class="order-detail-item">
                    <strong>Дата</strong>
                    <span>${order.date}</span>
                </div>
            </div>
            ${order.wishes ? `<div class="order-wishes"><strong>Пожелания:</strong> ${order.wishes}</div>` : ''}
        </div>
    `).join('');
}

/**
 * Заполняет форму "Мои данные" текущими значениями пользователя.
 */
function renderUserData() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const loginInput = document.getElementById("profile-login");
    const passwordInput = document.getElementById("profile-password");
    const emailInput = document.getElementById("profile-email");

    if (loginInput) loginInput.value = currentUser.login || "";
    if (passwordInput) passwordInput.value = currentUser.password || "";
    if (emailInput) emailInput.value = currentUser.email || "";
}

/**
 * Настраивает форму сохранения данных пользователя.
 */
function setupUserDataForm() {
    const form = document.getElementById("user-data-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const login = document.getElementById("profile-login").value.trim();
        const password = document.getElementById("profile-password").value;
        const email = document.getElementById("profile-email").value.trim();

        if (!login || !password) {
            alert("Логин и пароль обязательны для заполнения");
            return;
        }

        const users = getUsers();
        const currentUser = getCurrentUser();

        // Проверяем, не занят ли логин другим пользователем
        const existingUser = users.find(u => u.login === login && u.login !== currentUser.login);
        if (existingUser) {
            alert("Этот логин уже используется другим пользователем");
            return;
        }

        // Находим и обновляем пользователя
        const userIndex = users.findIndex(u => u.login === currentUser.login);
        if (userIndex !== -1) {
            const oldLogin = users[userIndex].login;

            users[userIndex].login = login;
            users[userIndex].password = password;
            users[userIndex].email = email;

            saveUsers(users);

            // Обновляем currentUser
            setCurrentUser(users[userIndex]);

            // Обновляем хедер с новым логином
            updateHeader();

            alert("Данные успешно сохранены!");
        }
    });
}

/**
 * Настраивает кнопку выхода из аккаунта в личном кабинете.
 */
function setupLogoutButton() {
    const logoutBtn = document.getElementById("profile-logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }
}

/* ============================================================
   ГЛОБАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Инициализируем хранилище (создаём дефолтных пользователей)
    initStorage();

    // Обновляем хедер в зависимости от авторизации
    updateHeader();

    // Маршрутизация по страницам
    const pageId = document.body.id;

    switch (pageId) {
        case "index-page":
            initIndexPage();
            break;
        case "catalog-page":
            initCatalogPage();
            break;
        case "detail-page":
            initDetailPage();
            break;
        case "profile-page":
            initProfilePage();
            break;
    }
});