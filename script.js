let currentUser = null;
let currentDate = new Date();
let selectedDate = new Date();
let viewMode = 'month';
let events = [];
let currentFilter = 'all';
let editingEventId = null;
let settings = {
    theme: 'default',
    language: 'ru',
    notifications: true
};

const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];


function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        loadUserData();
        showMainScreen();
    } else {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainScreen').classList.add('hidden');
}

function showMainScreen() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    document.getElementById('currentUsername').textContent = currentUser;
    renderView();
}

function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (!username || !password) {
        showNotification('Ошибка', 'Заполните все поля');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('Ошибка', 'Пароли не совпадают');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
        showNotification('Ошибка', 'Пользователь уже существует');
        return;
    }
    
    users[username] = {
        password: password,
        events: [],
        settings: { theme: 'default', language: 'ru', notifications: true }
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    showNotification('Успех', 'Регистрация прошла успешно!');
    

    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = password;
    document.getElementById('showLogin').click();
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('Ошибка', 'Заполните все поля');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (!users[username] || users[username].password !== password) {
        showNotification('Ошибка', 'Неверное имя пользователя или пароль');
        return;
    }
    
    currentUser = username;
    localStorage.setItem('currentUser', username);
    loadUserData();
    showMainScreen();
    showNotification('Добро пожаловать!', `Здравствуйте, ${username}!`);
}

function logout() {
    saveUserData();
    
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    events = [];
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerPasswordConfirm').value = '';

    showAuthScreen();
    
    console.log('Вышли из аккаунта');
}

function loadUserData() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[currentUser];
    
    if (userData) {
        events = userData.events || [];
        settings = userData.settings || { theme: 'default', language: 'ru', notifications: true };
        applyTheme(settings.theme);
    }
}

function saveUserData() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[currentUser] = {
        password: users[currentUser].password,
        events: events,
        settings: settings
    };
    localStorage.setItem('users', JSON.stringify(users));
}


function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');

    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.theme === settings.theme) {
            card.classList.add('active');
        }
    });
    
    document.getElementById('languageSelect').value = settings.language;
    document.getElementById('notificationsToggle').checked = settings.notifications;
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function changeTheme(theme) {
    settings.theme = theme;
    applyTheme(theme);
    saveUserData();
    showNotification('Тема изменена', 'Новая тема применена');
}

function applyTheme(theme) {
    const themes = {
        default: {
            bg: 'linear-gradient(135deg, #355e80 0%, #17305f 100%)',
            header: 'linear-gradient(135deg, #6f66ea 0%, #4ba279 100%)'
        },
        purple: {
            bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            header: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
        },
        green: {
            bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            header: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)'
        },
        orange: {
            bg: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)',
            header: 'linear-gradient(135deg, #eea849 0%, #f46b45 100%)'
        },
        dark: {
            bg: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
            header: 'linear-gradient(135deg, #414345 0%, #232526 100%)'
        }
    };
    
    const selectedTheme = themes[theme] || themes.default;
    document.body.style.background = selectedTheme.bg;
    document.querySelector('.header').style.background = selectedTheme.header;
}

function clearAllData() {
    if (confirm('Вы уверены? Это удалит ВСЕ ваши события! Это действие необратимо.')) {
        events = [];
        saveUserData();
        renderView();
        showNotification('Данные очищены', 'Все события удалены');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initAuth();
    if (currentUser) {
        checkNotifications();
        setInterval(checkNotifications, 60000);
    }
});

function setupEventListeners() {
    document.getElementById('showRegister').addEventListener('click', () => {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    });
    
    document.getElementById('showLogin').addEventListener('click', () => {
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    });
    
    document.getElementById('loginBtn').addEventListener('click', (e) => {
        e.preventDefault();
        login();
    });
    
    document.getElementById('registerBtn').addEventListener('click', (e) => {
        e.preventDefault();
        register();
    });
    
    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            changeTheme(card.dataset.theme);
        });
    });
    
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        settings.language = e.target.value;
        saveUserData();
        showNotification('Язык изменён', 'Настройки сохранены');
    });
    
    document.getElementById('notificationsToggle').addEventListener('change', (e) => {
        settings.notifications = e.target.checked;
        saveUserData();
    });
    
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    
    document.getElementById('prevBtn').addEventListener('click', navigatePrev);
    document.getElementById('nextBtn').addEventListener('click', navigateNext);
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            viewMode = e.target.dataset.mode;
            renderView();
        });
    });
    
    document.getElementById('addEventBtn').addEventListener('click', openAddEventModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('eventForm').addEventListener('submit', saveEvent);
    document.getElementById('deleteEventBtn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteEvent();
    });
    
    document.getElementById('filterSelect').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderEvents();
    });
    
    document.getElementById('eventModal').addEventListener('click', (e) => {
        if (e.target.id === 'eventModal') closeModal();
    });
    
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') closeSettings();
    });
    
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
    
    document.getElementById('registerPasswordConfirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') register();
    });
}


function navigatePrev() {
    if (viewMode === 'month') currentDate.setMonth(currentDate.getMonth() - 1);
    if (viewMode === 'week') currentDate.setDate(currentDate.getDate() - 7);
    if (viewMode === 'day') currentDate.setDate(currentDate.getDate() - 1);
    selectedDate = new Date(currentDate);
    renderView();
}

function navigateNext() {
    if (viewMode === 'month') currentDate.setMonth(currentDate.getMonth() + 1);
    if (viewMode === 'week') currentDate.setDate(currentDate.getDate() + 7);
    if (viewMode === 'day') currentDate.setDate(currentDate.getDate() + 1);
    selectedDate = new Date(currentDate);
    renderView();
}


function renderView() {
    updateHeader();
    
    const month = document.getElementById('monthView');
    const week = document.getElementById('weekView');
    const day = document.getElementById('dayView');
    
    month.classList.add('hidden');
    week.classList.add('hidden');
    day.classList.add('hidden');
    
    week.innerHTML = '';
    day.innerHTML = '';
    
    if (viewMode === 'month') {
        month.classList.remove('hidden');
        renderMonthView();
    }
    if (viewMode === 'week') {
        week.classList.remove('hidden');
        renderWeekView();
    }
    if (viewMode === 'day') {
        day.classList.remove('hidden');
        renderDayView();
    }
    
    renderEvents();
}

function updateHeader() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    let headerText = '';
    if (viewMode === 'month') {
        headerText = `${monthNames[month]} ${year}`;
    } else if (viewMode === 'week') {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        headerText = `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${year}`;
    } else if (viewMode === 'day') {
        headerText = `${day} ${monthNames[month]} ${year}`;
    }
    
    document.getElementById('monthYear').textContent = headerText;
}

function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();
    
    const daysContainer = document.getElementById('daysContainer');
    daysContainer.innerHTML = '';
    
    for (let i = firstDayIndex; i > 0; i--) {
        const day = createDayElement(prevLastDayDate - i + 1, false, new Date(year, month - 1, prevLastDayDate - i + 1));
        daysContainer.appendChild(day);
    }
    
    const today = new Date();
    for (let i = 1; i <= lastDayDate; i++) {
        const date = new Date(year, month, i);
        const day = createDayElement(i, true, date);
        
        if (isSameDay(date, today)) day.classList.add('today');
        if (isSameDay(date, selectedDate)) day.classList.add('selected');
        
        const dayEvents = getEventsForDate(date);
        if (dayEvents.length > 0) {
            day.classList.add('has-events');
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'event-dots';
            dayEvents.slice(0, 3).forEach(event => {
                const dot = document.createElement('div');
                dot.className = `event-dot ${event.category}`;
                dotsContainer.appendChild(dot);
            });
            day.appendChild(dotsContainer);
        }
        
        daysContainer.appendChild(day);
    }
    
    const remainingDays = 42 - daysContainer.children.length;
    for (let i = 1; i <= remainingDays; i++) {
        const day = createDayElement(i, false, new Date(year, month + 1, i));
        daysContainer.appendChild(day);
    }
}

function createDayElement(dayNum, isCurrentMonth, date) {
    const day = document.createElement('div');
    day.className = 'day';
    if (!isCurrentMonth) day.classList.add('other-month');
    day.textContent = dayNum;
    day.addEventListener('click', () => {
        selectedDate = new Date(date);
        renderView();
    });
    return day;
}

function renderWeekView() {
    const weekStart = getWeekStart(currentDate);
    const container = document.getElementById('weekView');
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        
        const dayCard = document.createElement('div');
        dayCard.className = 'week-day-card';
        dayCard.addEventListener('click', () => {
            selectedDate = new Date(date);
            currentDate = new Date(date);
            viewMode = 'day';
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-mode="day"]').classList.add('active');
            renderView();
        });
        
        if (isSameDay(date, today)) dayCard.classList.add('today');
        
        const header = document.createElement('div');
        header.className = 'week-day-header';
        header.textContent = `${weekDays[i]}\n${date.getDate()}`;
        dayCard.appendChild(header);
        
        const dayEvents = getEventsForDate(date);
        dayEvents.forEach(event => {
            const eventEl = createMiniEventElement(event);
            dayCard.appendChild(eventEl);
        });
        
        container.appendChild(dayCard);
    }
}

function createMiniEventElement(event) {
    const el = document.createElement('div');
    el.className = `event-item ${event.category}`;
    el.style.padding = '8px';
    el.style.marginTop = '5px';
    el.style.fontSize = '12px';
    el.innerHTML = `<div style="font-weight: 600;">${event.time}</div><div>${event.title}</div>`;
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditEventModal(event);
    });
    return el;
}

function renderDayView() {
    const container = document.getElementById('dayView');
    const header = document.createElement('div');
    header.className = 'day-view-header';
    header.textContent = `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    container.appendChild(header);
    
    const timeSlots = document.createElement('div');
    timeSlots.className = 'time-slots';
    const dayEvents = getEventsForDate(currentDate);
    
    for (let hour = 0; hour < 24; hour++) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = `${hour.toString().padStart(2, '0')}:00`;
        
        const timeContent = document.createElement('div');
        timeContent.className = 'time-content';
        
        const hourEvents = dayEvents.filter(e => parseInt(e.time.split(':')[0]) === hour);
        hourEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = `event-item ${event.category}`;
            eventEl.innerHTML = `
                <div class="event-header">
                    <span class="event-title">${event.title}</span>
                    <span class="event-time">${event.time}</span>
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
            `;
            eventEl.addEventListener('click', () => openEditEventModal(event));
            timeContent.appendChild(eventEl);
        });
        
        slot.appendChild(timeLabel);
        slot.appendChild(timeContent);
        timeSlots.appendChild(slot);
    }
    
    container.appendChild(timeSlots);
}

function renderEvents() {
    const container = document.getElementById('eventsContainer');
    const filteredEvents = getFilteredEvents();
    
    document.getElementById('eventCount').textContent = `(${filteredEvents.length})`;
    
    if (filteredEvents.length === 0) {
        container.innerHTML = '<div class="no-events">Нет событий</div>';
        return;
    }
    
    filteredEvents.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    container.innerHTML = '';
    filteredEvents.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = `event-item ${event.category}`;
        eventEl.innerHTML = `
            <div class="event-header">
                <span class="event-title">${event.title}</span>
                <span class="event-category">${getCategoryName(event.category)}</span>
            </div>
            <div class="event-time">${formatDate(event.date)} в ${event.time}</div>
            ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
        `;
        eventEl.addEventListener('click', () => openEditEventModal(event));
        container.appendChild(eventEl);
    });
}

function openAddEventModal() {
    editingEventId = null;
    document.getElementById('modalTitle').textContent = 'Добавить событие';
    document.getElementById('eventForm').reset();
    document.getElementById('eventDate').value = formatDateInput(selectedDate);
    document.getElementById('deleteEventBtn').classList.add('hidden');
    document.getElementById('eventModal').classList.remove('hidden');
}

function openEditEventModal(event) {
    editingEventId = event.id;
    document.getElementById('modalTitle').textContent = 'Редактировать событие';
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventNotification').checked = event.notification || false;
    document.getElementById('deleteEventBtn').classList.remove('hidden');
    document.getElementById('eventModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('eventModal').classList.add('hidden');
}

function saveEvent(e) {
    e.preventDefault();
    
    const eventData = {
        id: editingEventId || Date.now().toString(),
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        category: document.getElementById('eventCategory').value,
        description: document.getElementById('eventDescription').value,
        notification: document.getElementById('eventNotification').checked,
        notified: false
    };
    
    if (editingEventId) {
        const index = events.findIndex(e => e.id === editingEventId);
        if (index !== -1) events[index] = eventData;
    } else {
        events.push(eventData);
    }
    
    saveUserData();
    closeModal();
    renderView();
    showNotification('Событие сохранено', 'Событие успешно добавлено');
}

function deleteEvent() {
    const eventId = document.getElementById('eventId').value;
    
    if (!eventId) {
        alert('Ошибка: не найден ID события');
        return;
    }
    
    if (!confirm('Удалить это событие?')) {
        return;
    }
    
    console.log('До удаления:', events.length);
    events = events.filter(e => e.id !== eventId);
    console.log('После удаления:', events.length);

    saveUserData();
    
    document.getElementById('eventModal').classList.add('hidden');
    renderView();
    
    showNotification('Удалено!', 'Событие удалено');
}


function checkNotifications() {
    if (!settings.notifications) return;
    
    const now = new Date();
    events.forEach(event => {
        if (!event.notification || event.notified) return;
        
        const eventDate = new Date(event.date + ' ' + event.time);
        const timeDiff = eventDate - now;
        
        if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
            showNotification(`Напоминание: ${event.title}`, `Событие начнется в ${event.time}`, true);
            event.notified = true;
            saveUserData();
        }
    });
}

function showNotification(title, message, isPersistent = false) {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-header">
            <span class="notification-title">${title}</span>
            <button class="notification-close">&times;</button>
        </div>
        <div class="notification-body">${message}</div>
    `;
    
    container.appendChild(notification);
    notification.querySelector('.notification-close').addEventListener('click', () => notification.remove());
    
    if (!isPersistent) setTimeout(() => notification.remove(), 5000);
}


function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function getEventsForDate(date) {
    const dateStr = formatDateInput(date);
    return events.filter(event => event.date === dateStr);
}

function getFilteredEvents() {
    return currentFilter === 'all' ? events : events.filter(e => e.category === currentFilter);
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getCategoryName(category) {
    const names = { work: 'Работа', personal: 'Личное', important: 'Важное' };
    return names[category] || category;
}   