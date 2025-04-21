import { pool } from './dbConnect.js'; // Импорт пула соединений для работы с базой данных

/**
 * Функция для создания таблиц в базе данных, если они ещё не существуют.
 */
export async function createTables() {
    try {
        // Создаём таблицу для хранения информации о группах
        await pool.query(`
            CREATE TABLE IF NOT EXISTS groups (
                group_id TEXT PRIMARY KEY, -- Уникальный идентификатор группы
                name TEXT NOT NULL, -- Название группы
                member_count INTEGER DEFAULT 0 -- Количество участников группы
            );
        `);

        // Создаём таблицу для хранения информации о контактах
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                phone_id TEXT PRIMARY KEY, -- Уникальный идентификатор телефона
                phone_number TEXT UNIQUE -- Уникальный номер телефона
            );
        `);

        // Создаём таблицу для связи между пользователями и группами
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_groups (
                id SERIAL PRIMARY KEY, -- Уникальный идентификатор записи
                phone_id TEXT REFERENCES contacts(phone_id), -- Ссылка на пользователя
                group_id TEXT REFERENCES groups(group_id), -- Ссылка на группу
                UNIQUE(phone_id, group_id) -- Уникальная связь между пользователем и группой
            );
        `);

        // Создаём таблицу для хранения сообщений
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                phone_id TEXT REFERENCES contacts(phone_id), -- Ссылка на пользователя
                group_id TEXT REFERENCES groups(group_id), -- Ссылка на группу
                text TEXT NOT NULL, -- Текст сообщения
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Временная метка сообщения
            );
        `);

        // Создаём таблицу для хранения результатов анализа
        await pool.query(`
            CREATE TABLE IF NOT EXISTS analysis_results (
                id SERIAL PRIMARY KEY, -- Уникальный идентификатор записи
                group_id TEXT NOT NULL REFERENCES groups(group_id), -- Ссылка на группу
                user_phone TEXT NOT NULL REFERENCES contacts(phone_id), -- Ссылка на пользователя
                keywords TEXT[], -- Массив ключевых слов
                categories TEXT[], -- Массив категорий
                text TEXT[], -- Массив текстов сообщений
                analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Временная метка анализа
                UNIQUE (group_id, user_phone) -- Уникальная связь между группой и пользователем
            );
        `);

        console.log('Таблицы успешно созданы или уже существуют.'); // Логируем успешное создание таблиц
    } catch (error) {
        console.error('Ошибка при создании таблиц:', error.message); // Логируем ошибку при создании таблиц
    }
}
