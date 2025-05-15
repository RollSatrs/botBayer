import OpenAI from 'openai'; // Импорт библиотеки OpenAI для работы с API
import { apiChatGpt } from './token.js'; // Импорт API-ключа из файла token.js
import fs from 'fs'; // Импорт модуля для работы с файловой системой

// Инициализация клиента OpenAI с использованием API-ключа
const openai = new OpenAI({
    apiKey: apiChatGpt
});

/**
 * Функция для анализа текста с помощью ChatGPT.
 * @param {string} message - Сообщение, которое нужно проанализировать.
 * @returns {Object|null} - Результат анализа или null в случае ошибки.
 */
export async function getResponseGpt(message) {
    try {
        // Отправляем запрос к модели GPT для анализа сообщения
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18", // Используемая модель
            messages: [
                {
                    role: "system",
                    content: `
                        Ты — помощник, который анализирует сообщения и определяет:
                        1. **Относится ли сообщение к товару** (даже в вопросах, отзывах или советах).
                        2. **Основные ключевые слова** (существительные в именительном падеже, без прилагательных, цен, характеристик).
                        3. **Категории**:
                           - Одежда (шуба, кроссовки, брюки)
                           - Бытовая техника (холодильник, микроволновка)
                           - Мебель (кровать, стол)
                           - Текстиль (шторы, ковёр)
                           - Книги (учебники, романы)
                           - Спорттовары (гантели, велосипед)
                           - Другое (наушники, косметика, посуда)
                        4. **Игнорировать**: 
                           - Цены («20000 тенге»), оценки («плохой», «классный»), 
                           - Время («завтра», «на прошлой неделе»),
                           - Общие вопросы без товаров («Как оформить доставку?»).

                        **Примеры**:
                        - Сообщение: «Ищу женскую куртку на зиму» → куртка (Одежда).
                        - Сообщение: «Ремонт стиральных машин» → стиральная машина (Бытовая техника).
                        - Сообщение: «Есть скидки?» → product_related: false.

                        Формат ответа остаётся прежним.
                        - Если сообщение связано с товаром: 
                          { 
                            "product_related": true, 
                            "keywords": [
                                { "keyword": "кофта", "category": "Одежда" },
                                { "keyword": "наушники", "category": "Другое" }
                            ]
                          }
                        - Если не связано: 
                          { 
                            "product_related": false 
                          }
                    `
                },
                {
                    role: "user",
                    content: `Проанализируй сообщение: "${message}"`
                }
            ],
            max_tokens: 300, // Максимальное количество токенов в ответе
            temperature: 0.3 // Температура для управления креативностью модели
        });

        // Парсим результат ответа модели
        const result = JSON.parse(response.choices[0].message.content);
        return result; // Возвращаем результат анализа
    } catch (err) {
        console.error('Ошибка при запросе: ', err); // Логируем ошибку
        return null; // Возвращаем null в случае ошибки
    }
}

/**
 * Функция для анализа изображения с помощью ChatGPT.
 * @param {Buffer} imageBufer - Буфер изображения, которое нужно проанализировать.
 * @returns {Object|null} - Результат анализа или null в случае ошибки.
 */
export async function getResponseImg(imageBufer) {
    try {
        // Преобразуем изображение в строку Base64
        const base64Image = imageBufer.toString('base64');

        // Отправляем запрос к модели GPT для анализа изображения
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // Используемая модель
            messages: [
                {
                    role: "system",
                    content: `
                        Ты — помощник, который анализирует изображения и извлекает ключевые слова.
                        Твоя задача — описать, что изображено, и определить ключевые слова.
                        
                        Формат ответа:
                        {  
                            "keywords": ["ключ1", "ключ2", "ключ3"]
                        }
                    `
                },
                {
                    role: "user",
                    content: `Проанализируй это изображение ${base64Image} и выведи ключевые слова:`
                }
            ],
            max_tokens: 300, // Максимальное количество токенов в ответе
            temperature: 0.5 // Температура для управления креативностью модели
        });

        // Парсим результат ответа модели
        const result = JSON.parse(response.choices.message.content);
        return result; // Возвращаем результат анализа
    } catch (err) {
        console.log('Ошибка при запросе: ', err); // Логируем ошибку
        return null; // Возвращаем null в случае ошибки
    }
}

// const chatHistory = {} // Закомментированная переменная для хранения истории чатов

/**
 * Функция для обработки сообщений и управления историей чатов.
 * @param {string} chatId - Идентификатор чата.
 * @param {string} message - Сообщение, которое нужно обработать.
 * @param {string} role - Роль отправителя сообщения (по умолчанию "user").
 */
async function processMessage(chatId, message, role = "user") {
    try {
        // Если для данного чата ещё нет истории, создаём её
        if (!chatHistory[chatId]) {
            chatHistory[chatId] = [];
        }

        // Добавляем сообщение в историю чата
        chatHistory[chatId].push({ role, content: message });

        // Ограничиваем длину истории до 20 сообщений
        if (chatHistory[chatId].length > 20) {
            chatHistory[chatId] = chatHistory[chatId].slice(-20);
        }
    } catch (err) {
        console.log(`Ошибка в функции processMessage: ${err.message}`); // Логируем ошибку
    }
}




