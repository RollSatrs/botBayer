// Функция для отображения результатов анализа в таблице
function renderAnalysisResults(results) {
    const resultsTable = document.getElementById('analysisResults').getElementsByTagName('tbody')[0];
    resultsTable.innerHTML = ''; // Очищаем таблицу перед добавлением новых данных

    // Перебираем результаты и добавляем их в таблицу
    results.forEach(row => {
        const tr = document.createElement('tr');

        // Дата
        const dateCell = document.createElement('td');
        dateCell.textContent = row['Время']; // Добавляем дату
        tr.appendChild(dateCell);

        // Группа
        const groupCell = document.createElement('td');
        groupCell.textContent = row['Пользователи']; // Добавляем информацию о группе
        tr.appendChild(groupCell);

        // Ключевые слова
        const keywordsCell = document.createElement('td');
        keywordsCell.textContent = row['Ключевые слова'].join(', '); // Объединяем ключевые слова через запятую
        tr.appendChild(keywordsCell);

        // Сообщение
        const messageCell = document.createElement('td');
        messageCell.textContent = row['Текст'].join('; '); // Объединяем текст сообщений через точку с запятой
        tr.appendChild(messageCell);

        // Категория
        const categoryCell = document.createElement('td');
        categoryCell.innerHTML = row['Категория']
            .map(cat => `<span class="badge bg-primary">${cat}</span>`) // Добавляем категории в виде "бейджей"
            .join(' ');
        tr.appendChild(categoryCell);

        // Добавляем строку в таблицу
        resultsTable.appendChild(tr);
    });
}

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
                        const response = await fetch(`/api/analyze/${groupId}`); // Отправляем запрос на анализ группы
                        const results = await response.json(); // Преобразуем ответ в JSON
                        renderAnalysisResults(results); // Отображаем результаты анализа
                    } catch (error) {
                        console.error('Ошибка при выполнении запроса:', error.message);
                        // alert('Не удалось загрузить данные. Проверьте подключение к интернету или обратитесь к администратору.');
                    }
                });
            });
        } catch (error) {
            console.error('Ошибка загрузки групп:', error); // Логируем ошибку, если запрос не удался
        }
    }

    // Загружаем список групп при загрузке страницы
    loadGroups();
});

