// Используем API товаров (products) от DummyJSON
const API_URL = 'https://dummyjson.com/products';
let products = [];

const grid = document.getElementById('productGrid');
const counter = document.getElementById('counter');

const nameInput = document.getElementById('itemName');
const priceInput = document.getElementById('itemPrice');
const categoryInput = document.getElementById('itemCategory');
const createBtn = document.getElementById('createBtn');

// [R] READ - Загрузка предметов из API
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}?limit=6`);
        const data = await response.json();
        products = data.products;
        renderProducts();
    } catch (error) {
        console.error('Ошибка сети при загрузке:', error);
    }
}

// [C] CREATE - Добавление нового импланта
async function createProduct() {
    const title = nameInput.value.trim();
    const price = Number(priceInput.value);
    const category = categoryInput.value.trim() || 'cyberware';

    if (!title || !price) {
        alert('Заполните хотя бы название и цену!');
        return;
    }

    const newProduct = {
        id: Date.now(), // Локальный уникальный ID
        title: title,
        price: price,
        category: category
    };

    // 1. Мгновенно обновляем интерфейс
    products.unshift(newProduct);
    clearInputs();
    renderProducts();

    // 2. Фоновый POST-запрос в DummyJSON API
    try {
        await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: newProduct.title,
                price: newProduct.price,
                category: newProduct.category
            })
        });
    } catch (error) {
        console.error('Ошибка сохранения на сервере:', error);
    }
}

// [U] UPDATE - Изменение цены импланта
async function updatePrice(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newPrice = prompt(`Введите новую цену для "${product.title}":`, product.price);
    if (!newPrice || isNaN(newPrice)) return;

    // Обновляем локально
    product.price = Number(newPrice);
    renderProducts();

    // Отправляем PUT-запрос
    if (id <= 100) { // Только для встроенных товаров DummyJSON
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: Number(newPrice) })
            });
        } catch (error) {
            console.error('Ошибка обновления цены:', error);
        }
    }
}

// [D] DELETE - Списание / Удаление товара
async function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    renderProducts();

    if (id <= 100) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
        }
    }
}

// Отрисовка сетки карточек
function renderProducts() {
    grid.innerHTML = '';
    counter.textContent = `${products.length} предметов`;

    products.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';

        card.innerHTML = `
            <div>
                <span class="item-category">${item.category}</span>
                <h3 class="item-title">${item.title}</h3>
            </div>
            <div class="item-bottom">
                <div class="price-tag">$${item.price}</div>
                <div class="actions">
                    <button class="action-btn edit-btn" onclick="updatePrice(${item.id})">Цена</button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${item.id})">Удалить</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function clearInputs() {
    nameInput.value = '';
    priceInput.value = '';
    categoryInput.value = '';
}

// Слушатели
createBtn.addEventListener('click', createProduct);

// Запуск
fetchProducts();