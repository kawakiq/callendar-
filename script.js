let currentDate = new Date();
let selectedDate = new Date();

const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('monthYear').textContent = 
        `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();

    const daysContainer = document.getElementById('daysContainer');
    daysContainer.innerHTML = '';

    for (let i = firstDayIndex; i > 0; i--) {
        const day = document.createElement('div');
        day.className = 'day other-month';
        day.textContent = prevLastDayDate - i + 1;
        daysContainer.appendChild(day);
    }

    const today = new Date();
    for (let i = 1; i <= lastDayDate; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.textContent = i;

        if (year === today.getFullYear() && 
            month === today.getMonth() && 
            i === today.getDate()) {
            day.classList.add('today');
        }

        if (year === selectedDate.getFullYear() && 
            month === selectedDate.getMonth() && 
            i === selectedDate.getDate()) {
            day.classList.add('selected');
        }

        day.addEventListener('click', () => {
            selectedDate = new Date(year, month, i);
            renderCalendar();
        });

        daysContainer.appendChild(day);
    }

    const remainingDays = 42 - daysContainer.children.length;
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.className = 'day other-month';
        day.textContent = i;
        daysContainer.appendChild(day);
    }
}

document.getElementById('prevBtn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();