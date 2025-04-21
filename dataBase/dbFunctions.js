import { pool } from './dbConnect.js'; // Импорт пула соединений для работы с базой данных

/**
 * Функция для добавления группы в базу данных.
 * @param {string} groupID - Идентификатор группы.
 * @param {string} name - Название группы.
 * @param {number} memberCount - Количество участников группы.
 */
export async function addGroups(groupID, name, memberCount) {
    try {
        const response = await pool.query(`
            INSERT INTO groups (group_id, name, member_count)
            VALUES ($1, $2, $3)
            ON CONFLICT (group_id) DO UPDATE SET
                name = EXCLUDED.name,
                member_count = EXCLUDED.member_count;
        `, [groupID, name, memberCount]);
        return response.rows[0];
    } catch (err) {
        console.log(`Ошибка со стороны функции addGroups: ${err}`);
    }
}

/**
 * Функция для добавления пользователя в базу данных.
 * @param {string} phoneId - Уникальный идентификатор телефона.
 * @param {string} phone - Номер телефона.
 */
export async function addUsers(phoneId, phone) {
    try {
        const response = await pool.query(`
            INSERT INTO contacts (phone_id, phone_number)
            VALUES ($1, $2)
            ON CONFLICT (phone_id) DO NOTHING;
        `, [phoneId, phone]);
        return await response.rows[0];
    } catch (err) {
        console.log(`Ошибка со стороны функции addUsers: ${err}`);
    }
}

/**
 * Функция для добавления связи между пользователем и группой.
 * @param {string} phoneID - Идентификатор телефона.
 * @param {string} groupID - Идентификатор группы.
 */
export async function addUserGruops(phoneID, groupID) {
    try {
        const response = await pool.query(`
            INSERT INTO user_groups (phone_id, group_id)
            VALUES ($1, $2)
            ON CONFLICT (phone_id, group_id) DO NOTHING;
        `, [phoneID, groupID]);
        return response;
    } catch (err) {
        console.log(`Ошибка со стороны функции addUserGruops: ${err}`);
    }
}

/**
 * Функция для проверки и добавления пользователя, группы и их связи.
 * @param {string} phoneId - Идентификатор телефона.
 * @param {string} phone - Номер телефона.
 * @param {string} groupId - Идентификатор группы.
 * @param {string} name - Название группы.
 * @param {number} memberCount - Количество участников группы.
 */
export async function checkUserGroup(phoneId, phone, groupId, name, memberCount) {
    try {
        await pool.query('BEGIN'); // Начинаем транзакцию

        // Проверяем, существует ли группа
        const groupResponse = await pool.query(`
            SELECT group_id FROM groups
            WHERE group_id = $1
        `, [groupId]);
        if (groupResponse.rowCount === 0) {
            await addGroups(groupId, name, memberCount);
        }

        // Проверяем, существует ли пользователь
        const userResponse = await pool.query(`
            SELECT phone_id FROM contacts
            WHERE phone_id = $1
        `, [phoneId]);
        if (userResponse.rowCount === 0) {
            await addUsers(phoneId, phone);
        }

        // Проверяем, существует ли связь между пользователем и группой
        const userGroupResponse = await pool.query(`
            SELECT phone_id, group_id FROM user_groups
            WHERE phone_id = $1 AND group_id = $2
        `, [phoneId, groupId]);
        if (userGroupResponse.rowCount === 0) {
            await addUserGruops(phoneId, groupId);
        }

        await pool.query('COMMIT'); // Завершаем транзакцию
        return true;
    } catch (err) {
        console.log(`Ошибка со стороны функции checkUserGroup: ${err}`);
        await pool.query('ROLLBACK'); // Откатываем транзакцию в случае ошибки
        return false;
    } finally {
        (await pool.connect()).release(); // Освобождаем соединение
    }
}

/**
 * Функция для удаления пользователя из группы.
 * @param {string} phoneId - Идентификатор телефона.
 * @param {string} groupId - Идентификатор группы.
 * @param {number} count - Обновлённое количество участников группы.
 */
export async function deleteUsersWithGroup(phoneId, groupId, count) {
    try {
        await pool.query('BEGIN'); // Начинаем транзакцию

        // Удаляем связь между пользователем и группой
        await pool.query(`
            DELETE FROM user_groups
            WHERE phone_id = $1 AND group_id = $2
        `, [phoneId, groupId]);

        // Обновляем количество участников группы
        await pool.query(`
            UPDATE groups SET member_count = $2
            WHERE group_id = $1
        `, [groupId, count]);

        await pool.query('COMMIT'); // Завершаем транзакцию
        return true;
    } catch (err) {
        await pool.query('ROLLBACK'); // Откатываем транзакцию в случае ошибки
        console.log(`Ошибка со стороны функции deleteUsersWithGroup: ${err}`);
        return false;
    }
}

/**
 * Функция для добавления сообщения в базу данных.
 * @param {string} phoneID - Идентификатор телефона.
 * @param {string} groupID - Идентификатор группы.
 * @param {string} text - Текст сообщения.
 */
export async function addMessages(phoneID, groupID, text) {
    try {
        const response = await pool.query(`
            INSERT INTO messages (phone_id, group_id, text)
            VALUES ($1, $2, $3)
        `, [phoneID, groupID, text]);
        return response;
    } catch (err) {
        console.log(`Ошибка со стороны функции addMessages: ${err}`);
    }
}

/**
 * Функция для добавления результатов анализа в базу данных.
 * @param {string} group_id - Идентификатор группы.
 * @param {string} user_phone - Номер телефона пользователя.
 * @param {Array<string>} keywords - Ключевые слова.
 * @param {Array<string>} categories - Категории.
 * @param {string} text - Текст сообщения.
 */
export async function addAnalysis(group_id, user_phone, keywords, categories, text) {
    try {
        const keywordsArray = `{${keywords.join(',')}}`;
        const categoriesArray = `{${categories.join(',')}}`;
        const response = await pool.query(`
            INSERT INTO analysis_results (group_id, user_phone, keywords, categories, text)
            VALUES ($1, $2, $3::TEXT[], $4::TEXT[], ARRAY[$5]::TEXT[])
            ON CONFLICT (group_id, user_phone) DO UPDATE SET
                keywords = (
                    SELECT array_agg(DISTINCT keyword)
                    FROM unnest(array_cat(analysis_results.keywords, $3::TEXT[])) AS keyword
                ),
                categories = (
                    SELECT array_agg(DISTINCT category)
                    FROM unnest(array_cat(analysis_results.categories, $4::TEXT[])) AS category
                ),
                text = (
                    SELECT array_agg(DISTINCT message)
                    FROM unnest(array_cat(analysis_results.text, ARRAY[$5]::TEXT[])) AS message
                );
        `, [group_id, user_phone, keywordsArray, categoriesArray, text]);
        console.log('Результат анализа сохранен:', response.rows);
        return response.rows[0];
    } catch (error) {
        console.error(`Ошибка со стороны функции addAnalysis: ${error.message}`);
        throw error;
    }
}

/**
 * Функция для получения данных о группах.
 * @returns {Array<Object>} - Список групп.
 */
export async function getGroupsData() {
    try {
        const response = await pool.query(`
            SELECT group_id, name, member_count
            FROM groups;
        `);
        return response.rows;
    } catch (error) {
        console.error(`Ошибка со стороны функции getGroupsData: ${error.message}`);
    }
}

/**
 * Функция для получения анализа данных группы.
 * @param {string} groupId - Идентификатор группы.
 * @returns {Array<Object>} - Результаты анализа.
 */
export async function getAnalyze(groupId) {
    try {
        const response = await pool.query(`
            SELECT 
                g.name AS "Название группы",
                ar.user_phone AS "Пользователи",
                (
                    SELECT ARRAY_AGG(DISTINCT keyword)
                    FROM unnest(ar.keywords) AS keyword
                ) AS "Ключевые слова",
                (
                    SELECT ARRAY_AGG(DISTINCT category)
                    FROM unnest(ar.categories) AS category
                ) AS "Категория",
                (
                    SELECT ARRAY_AGG(DISTINCT message)
                    FROM unnest(ar.text) AS message
                ) AS "Текст",
                TO_CHAR(MAX(ar.analyzed_at), 'DD.MM.YYYY') AS "Время"
            FROM 
                analysis_results ar
            JOIN 
                groups g ON ar.group_id = g.group_id
            WHERE 
                ar.group_id = $1
            GROUP BY 
                g.name, ar.user_phone, ar.keywords, ar.categories, ar.text
            ORDER BY 
                MAX(ar.analyzed_at) DESC;
        `, [groupId]);
        return response.rows;
    } catch (error) {
        console.error(`Ошибка со стороны функции getAnalyze: ${error.message}`);
        throw error;
    }
}