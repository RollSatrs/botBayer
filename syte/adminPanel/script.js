// Функции для построения графиков топ-ключевых слов и топ-категорий
let keywordsChartInstance = null;
let categoriesChartInstance = null;

// --- Экспорт анализа в CSV ---
function exportAnalysisToCSV(results) {
    if (!results || !results.length) return;
    const header = ['Дата', 'Пользователь', 'Ключевые слова', 'Сообщение', 'Категория'];
    const rows = results.map(row => [
        row.analyzed_at || '',
        row.Group?.name || '',
        (row.keywords || []).join(', '),
        (row.text || []).join('; '),
        (row.categories || []).join(', ')
    ]);
    const csvContent = [header, ...rows]
        .map(e => e.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'analysis_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

let lastAnalysisResults = [];

function renderTopCharts(results) {
    // Подсчёт топ-ключевых слов
    const keywordCounts = {};
    results.forEach(row => {
        (row.keywords || []).forEach(kw => {
            keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
        });
    });
    const topKeywords = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    // Подсчёт топ-категорий
    const categoryCounts = {};
    results.forEach(row => {
        (row.categories || []).forEach(cat => {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
    });
    const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    // График ключевых слов
    const keywordsCtx = document.getElementById('keywordsChart').getContext('2d');
    if (keywordsChartInstance) keywordsChartInstance.destroy();
    keywordsChartInstance = new Chart(keywordsCtx, {
        type: 'bar',
        data: {
            labels: topKeywords.map(([kw]) => kw),
            datasets: [{
                label: 'Количество',
                data: topKeywords.map(([, count]) => count),
                backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });

    // График категорий
    const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
    if (categoriesChartInstance) categoriesChartInstance.destroy();
    categoriesChartInstance = new Chart(categoriesCtx, {
        type: 'bar',
        data: {
            labels: topCategories.map(([cat]) => cat),
            datasets: [{
                label: 'Количество',
                data: topCategories.map(([, count]) => count),
                backgroundColor: 'rgba(255, 99, 132, 0.7)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

// Функция для отображения результатов анализа в таблице
function renderAnalysisResults(results) {
    lastAnalysisResults = results;
    const resultsTable = document.getElementById('analysisResults').getElementsByTagName('tbody')[0];
    resultsTable.innerHTML = ''; // Очищаем таблицу перед добавлением новых данных

    // Перебираем результаты и добавляем их в таблицу
    results.forEach(row => {
        const tr = document.createElement('tr');

        // Дата
        const dateCell = document.createElement('td');
        dateCell.textContent = row.analyzed_at || ''; // Добавляем дату
        tr.appendChild(dateCell);

        // Группа
        const groupCell = document.createElement('td');
        groupCell.textContent = row.Group?.name || '';
        tr.appendChild(groupCell);

        // Ключевые слова
        const keywordsCell = document.createElement('td');
        keywordsCell.textContent = (row.keywords || []).join(', ');
        tr.appendChild(keywordsCell);

        // Сообщение
        const messageCell = document.createElement('td');
        messageCell.textContent = (row.text || []).join('; ');
        tr.appendChild(messageCell);

        // Категория
        const categoryCell = document.createElement('td');
        categoryCell.innerHTML = (row.categories || [])
            .map(cat => `<span class="badge bg-primary">${cat}</span>`) // Добавляем категории в виде "бейджей"
            .join(' ');
        tr.appendChild(categoryCell);

        // Добавляем строку в таблицу
        resultsTable.appendChild(tr);
    });

    // Добавляем построение графиков после рендера таблицы
    renderTopCharts(results);
}

// Подключение к socket.io
const socket = io();
console.log('socket.io-client:', typeof io); // Должно вывести "function"
socket.on('connect', () => {
    console.log('Socket.IO подключён! id:', socket.id);
});
// ID выбранной группы для анализа
let selectedGroupId = null;

// Функция для загрузки анализа по группе
async function loadAnalysisForGroup(groupId) {
    try {
        const response = await fetch(`/api/analyze/${groupId}`);
        const results = await response.json();
        renderAnalysisResults(results);
    } catch (error) {
        console.error('Ошибка при загрузке анализа:', error.message);
    }
}

// Слушаем событие обновления анализа от сервера
socket.on('analysis_updated', (groupId) => {
    console.log('web socket')
    if (groupId && groupId === selectedGroupId) {
        loadAnalysisForGroup(groupId);
    }
});


// Выполняется, когда DOM полностью загружен
document.addEventListener('DOMContentLoaded', () => {
    // Функция для загрузки списка групп с сервера
    async function loadGroups() {
        try {
            // Отправляем запрос на сервер для получения списка групп
            const response = await fetch('/api/groups');
            const groups = await response.json(); // Преобразуем ответ в JSON
            console.log(groups);

            // Находим элемент для отображения списка групп
            const groupList = document.getElementById('groupList');
            groupList.innerHTML = groups.map(group => `
                <div class="col-md-4 mb-3">
                    <div class="group-item p-3">
                        <h6>${group.name}</h6> <!-- Название группы -->
                        <p>ID: ${group.group_id}</p> <!-- ID группы -->
                        <p>Участников: ${group.member_count}</p> <!-- Количество участников -->
                        <div class="progress mb-2" style="height: 5px;">
                            <div class="progress-bar" 
                                 style="width: ${group.activity}%;"
                                 role="progressbar"></div> <!-- Прогресс активности группы -->
                        </div>
                        <button class="btn btn-sm btn-primary analyze-btn w-100"
                                data-group-id="${group.group_id}">
                            Анализировать
                        </button>
                        <button class="btn btn-sm btn-primary monitoring-btn-btn w-100"
                                data-group-id="${group.group_id}">
                            Мониторить
                        </button>                        
                    </div>
                </div>
            `).join(''); // Генерируем HTML для каждой группы

            // Добавляем обработчики событий для кнопок "Анализировать"
            document.querySelectorAll('.analyze-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    try {
                        const groupId = btn.dataset.groupId; // Получаем ID группы
                        selectedGroupId = groupId; // Сохраняем выбранную группу
                        await loadAnalysisForGroup(groupId); // Загружаем анализ
                    } catch (error) {
                        console.error('Ошибка при выполнении запроса:', error.message);
                    }
                });
            });
        } catch (error) {
            console.error('Ошибка загрузки групп:', error); // Логируем ошибку, если запрос не удался
        }
    }

    // Загружаем список групп при загрузке страницы
    loadGroups();
    // setInterval(loadGroups, 15000)
    // setInterval(() => {
    // if (selectedGroupId) {
    //     loadAnalysisForGroup(selectedGroupId);
    // }}, 15000);

    // Экспорт по кнопке
    document.getElementById('exportButton').addEventListener('click', function() {
        exportAnalysisToCSV(lastAnalysisResults);
    });
});

