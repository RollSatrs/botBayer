import { pool } from './dbConnect.js';
// import { client } from "../whatsapp.js="; // Подключаем клиент WhatsApp
import { getResponseGpt } from '../chatGptFunction.js';

// ✅ Сохранение пользователей и их групп в БД
export async function saveUserData(userGroups) {
    for (let [phone, groups] of Object.entries(userGroups)) {
        const groupJson = JSON.stringify(groups);
        // console.log(groupJson)
        await pool.query(`
            INSERT INTO contacts (phone_number, group_data)
            VALUES ($1, $2::jsonb)
            ON CONFLICT (phone_number) 
            DO UPDATE SET group_data = (
                SELECT jsonb_agg(DISTINCT elem) 
                FROM jsonb_array_elements(contacts.group_data || EXCLUDED.group_data) AS elem
            )
        `, [phone, groupJson]);
    }
}

// ❌ Удаление группы у пользователя при выходе
export async function removeUserFromGroup(userId, groupId) {
    const result = await pool.query('SELECT group_data FROM contacts WHERE phone_number = $1', [userId]);

    if (result.rows.length === 0) return; // Если пользователя нет в БД, ничего не делаем

    let groups = JSON.parse(result.rows[0].group_data);
    groups = groups.filter(group => group.id !== groupId); // Удаляем группу из массива

    await pool.query(`
        UPDATE contacts SET group_data = $1 WHERE phone_number = $2
    `, [JSON.stringify(groups), userId]);
}
const ADMINISTRATOR_GROUP_IDENTIFIER = "120363376170798075@g.us"; // Идентификатор административной группы

/**
 * Функция поиска сообщений в таблице `history` по ключевым словам
 * @param {string[]} keywords - Список ключевых слов
 * @returns {Promise<string>} - Отформатированный текст найденных сообщений или сообщение об их отсутствии
 */
async function searchMessagesByKeywords(keywords) {
    // Приводим ключевые слова к нижнему регистру для точного сравнения
    const lowerCaseKeywords = keywords.map(singleKeyword => singleKeyword.toLowerCase());

    // Выполняем SQL-запрос к базе данных
    const { rows } = await pool.query(
        `SELECT 
            history.message_data, 
            history.timestamp, 
            contacts.group_data->0->>'user_name' AS user_name, 
            group_element->>'name' AS group_name  -- Исправлено
         FROM history 
         JOIN contacts 
            ON history.user_phone = contacts.phone_number 
         JOIN jsonb_array_elements(contacts.group_data) AS group_element 
            ON group_element->>'id' = history.group_id 
         WHERE EXISTS (
             SELECT 1 
             FROM jsonb_array_elements_text(history.message_data->'keywords') AS keyword 
             WHERE LOWER(keyword) = ANY($1)
         )`,
        [lowerCaseKeywords]
    );

    // Если сообщений не найдено, возвращаем соответствующее уведомление
    if (rows.length === 0) {
        return "❌ *Сообщения по этим ключевым словам не найдены.*";
    }

    // Формируем текст найденных сообщений
    return rows.map(row => {
        const { message_data, timestamp, user_name, group_name } = row;
        const { text, keywords, category } = message_data;

        return `📌 *Сообщение:* ${text}\n` +
               `🔑 *Ключевые слова:* ${keywords.join(", ")}\n` +
               `🏷 *Категория:* ${category}\n` +
               `📅 *Время отправки:* ${new Date(timestamp).toLocaleString()}\n` +
               `👤 *Отправитель:* ${user_name || "Неизвестный пользователь"}\n` +
               `🏠 *Группа:* ${group_name}`;
    }).join("\n\n➖➖➖➖➖➖➖➖➖\n\n"); // Разделитель между найденными сообщениями
}

/**
 * Функция обработки входящего сообщения из группы
 * @param {Object} message - Объект сообщения из WhatsApp
 */
export async function processGroupMessage(message) {
    const userPhoneNumber = message.author; // Номер телефона отправителя
    const groupIdentifier = message.from; // Идентификатор группы
    const messageTextContent = message.body; // Текст сообщения

    try {
        // Проверяем, является ли сообщение командой поиска в административной группе
        if (groupIdentifier === ADMINISTRATOR_GROUP_IDENTIFIER && messageTextContent.startsWith("/searchAllKey")) {
            const extractedKeywords = messageTextContent.replace("/searchAllKey", "").trim().split(",").map(keyword => keyword.trim().toLowerCase());

            if (extractedKeywords.length === 0) {
                console.log("⚠️ Команда поиска отправлена без указания ключевых слов.");
                return;
            }

            // Выполняем поиск сообщений по ключевым словам
            const formattedSearchResults = await searchMessagesByKeywords(extractedKeywords);
            message.reply(formattedSearchResults)
            console.log(formattedSearchResults);
            return;
        }

        // Запрашиваем данные о пользователе из базы данных `contacts`
        const { rows } = await pool.query(
            `SELECT group_data FROM contacts WHERE phone_number = $1`,
            [userPhoneNumber]
        );

        // Если пользователь не найден в базе данных, прерываем выполнение
        if (rows.length === 0) {
            console.log(`⚠️ Пользователь с номером телефона ${userPhoneNumber} отсутствует в базе данных.`);
            return;
        }

        // Проверяем, состоит ли пользователь в группе, из которой пришло сообщение
        const userGroupsData = rows[0].group_data || [];
        const isUserInGroup = userGroupsData.some(group => group.id === groupIdentifier);

        if (!isUserInGroup) {
            console.log(`⚠️ Группа с идентификатором ${groupIdentifier} не найдена в списке групп пользователя ${userPhoneNumber}.`);
            return;
        }

        // Выполняем анализ сообщения с помощью GPT
        const messageAnalysisResult = await getResponseGpt(messageTextContent);

        // Проверяем, является ли сообщение товарным
        if (!messageAnalysisResult || !messageAnalysisResult.product_related) {
            console.log("🛑 Сообщение не содержит информации о товаре и не будет сохранено.");
            return;
        }

        // Извлекаем ключевые слова и категорию товара из анализа GPT
        const { keywords, category } = messageAnalysisResult;

        // Приводим ключевые слова к нижнему регистру
        const lowerCaseKeywords = Array.isArray(keywords) ? keywords.map(keyword => keyword.toLowerCase()) : [];

        // Формируем JSON-объект для хранения в базе данных
        const messageDataJson = JSON.stringify({ 
            text: messageTextContent, 
            keywords: lowerCaseKeywords, 
            category 
        });

        // Сохраняем обработанное сообщение в таблице `history`
        await pool.query(
            `INSERT INTO history (message_id, user_phone, group_id, message_data, timestamp)
             VALUES ($1, $2, $3, $4::jsonb, NOW())
             ON CONFLICT (message_id) DO NOTHING`,
            [message.id.id, userPhoneNumber, groupIdentifier, messageDataJson]
        );

        console.log("✅ Сообщение успешно сохранено в таблице `history`.");
    } catch (error) {
        console.error("❌ Ошибка при обработке входящего сообщения:", error);
    }
}