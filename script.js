let tasks = [];
let currentStatusFilter = 'all';
const usersCache = {};

// Загрузка задач
async function fetchTasks() {
    try {
        const response = await fetch('https://dummyjson.com/todos?limit=15');
        const data = await response.json();
        tasks = data.todos;
        
        document.getElementById('loading').style.display = 'none';
        applyFiltersAndSort();
    } catch (err) {
        document.getElementById('loading').innerText = 'Ошибка загрузки данных.';
    }
}

// Запрос данных пользователя с кэшированием
async function fetchUser(userId) {
    if (usersCache[userId]) return usersCache[userId];
    try {
        const res = await fetch(`https://dummyjson.com/users/${userId}`);
        const user = await res.json();
        usersCache[userId] = user;
        return user;
    } catch (err) {
        return { firstName: 'Неизвестный', lastName: '', image: 'https://via.placeholder.com/20' };
    }
}

// Установка фильтра по статусу
function setStatusFilter(status, btn) {
    currentStatusFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFiltersAndSort();
}

// Главная функция фильтрации и сортировки
async function applyFiltersAndSort() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const sortType = document.getElementById('sortSelect').value;

    // 1. Фильтрация
    let result = tasks.filter(task => {
        const matchesSearch = task.todo.toLowerCase().includes(searchQuery);
        const matchesStatus = 
            currentStatusFilter === 'all' ? true :
            currentStatusFilter === 'active' ? !task.completed :
            currentStatusFilter === 'completed' ? task.completed : true;

        return matchesSearch && matchesStatus;
    });

    // 2. Сортировка
    result.sort((a, b) => {
        if (sortType === 'title-asc') {
            return a.todo.localeCompare(b.todo);
        } else if (sortType === 'title-desc') {
            return b.todo.localeCompare(a.todo);
        } else if (sortType === 'user') {
            return a.userId - b.userId;
        }
        return 0; // По умолчанию
    });

    await renderTasks(result);
}

// Отрисовка задач
async function renderTasks(listToRender) {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (listToRender.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: #64748b; padding: 30px;">Ничего не найдено</div>';
        return;
    }

    for (let task of listToRender) {
        const user = await fetchUser(task.userId);

        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})">
                <div class="task-info">
                    <div class="task-title ${task.completed ? 'completed' : ''}">${task.todo}</div>
                    <div class="user-badge">
                        <img src="${user.image}" alt="avatar">
                        <span>${user.firstName} ${user.lastName} (ID: ${task.userId})</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn" onclick="openEditModal(${task.id})">✏️</button>
                <button class="action-btn delete" onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        `;
        list.appendChild(card);
    }
}

// Изменение статуса
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        applyFiltersAndSort();
    }
}

// Удаление
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    applyFiltersAndSort();
}

// Модалка добавления
function openAddModal() {
    document.getElementById('modalTitle').innerText = 'Новая задача';
    document.getElementById('taskId').value = '';
    document.getElementById('taskInputText').value = '';
    document.getElementById('taskUserId').value = '1';
    document.getElementById('taskModal').style.display = 'flex';
}

// Модалка редактирования
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('modalTitle').innerText = 'Редактировать задачу';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskInputText').value = task.todo;
    document.getElementById('taskUserId').value = task.userId;
    document.getElementById('taskModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

// Обработка отправки формы (создание/сохранение)
function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const text = document.getElementById('taskInputText').value;
    const userId = parseInt(document.getElementById('taskUserId').value);

    if (id) {
        const task = tasks.find(t => t.id == id);
        if (task) {
            task.todo = text;
            task.userId = userId;
        }
    } else {
        const newTask = {
            id: Date.now(),
            todo: text,
            completed: false,
            userId: userId
        };
        tasks.unshift(newTask);
    }

    closeModal();
    applyFiltersAndSort();
}

// Старт
fetchTasks();