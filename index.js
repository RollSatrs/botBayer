import fs from 'fs';
import { extractFrames } from "./extractFunctions.js";
import { name } from 'ejs';
import path from "path";
import { fileURLToPath } from 'url';
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { serverFunctions } from './server.js';
import { getResponseGpt, getResponseImg } from './chatGptFunction.js';
import { createTables } from "./dataBase/createTableDB.js";
import { addGroups, addUserGruops, addUsers, addMessages, checkUserGroup, addAnalysis, deleteUsersWithGroup } from './dataBase/dbFunctions.js';
import { io } from './server.js';

console.log('ВКЛ');

// Получение текущего пути файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID группы для тестирования
const mixShop = '120363372643476883@g.us';

// Инициализация клиента WhatsApp Web
const { Client, LocalAuth } = pkg;
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session' // Путь для хранения сессии
    }),
    puppeteer: {
        headless: true, // Запуск браузера в фоновом режиме
        args: []
    }
});

// Генерация QR-кода для авторизации
client.on('qr', (qr) => {
    console.log('Сгенерирован QR-код, отсканируйте его в WhatsApp!');
    qrcode.generate(qr, { small: true });
});

// Событие готовности клиента
client.on('ready', async () => {
    console.log('✅ Бот полностью готов!');
    await createTables(); // Создание таблиц в базе данных
    await new Promise(resolve => setTimeout(resolve, 5000)); // Задержка для инициализации

    // Получение всех чатов и фильтрация групп
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);

    // Обработка каждой группы
    for (let group of groups) {
        const participants = group.participants.map(participant => participant.id._serialized);
        const participantsLength = participants.length;
        const groupId = group.id._serialized;
        const groupName = group.name;

        // Добавление группы в базу данных
        await addGroups(groupId, groupName, participantsLength);

        // Добавление участников группы в базу данных
        for (const participantId of participants) {
            const phone = await client.getFormattedNumber(participantId);
            await addUsers(participantId, phone);
            await addUserGruops(participantId, groupId);
        }
    }
});

// Обработка входящих сообщений
client.on('message', async (message) => {
    const chat = await message.getChat();

    // Проверка, является ли чат группой
    if (chat.isGroup) {
        const phone = message.author;
        const groupId = chat.id._serialized;
        const text = message.body;

        // Проверка наличия медиа в сообщении
        if (message.hasMedia) {
            const media = await message.downloadMedia();
            if (!media) return console.log('Ошибка при загрузке медиа');
            let extension = ''; // Здесь можно обработать тип медиа
        }

        // Анализ сообщения с помощью GPT
        const analysisResult = await getResponseGpt(text);
        const productRelated = analysisResult.product_related;

        // Если сообщение не связано с товаром
        if (!productRelated) {
            console.log('Сообщение НЕ связано с товаром.');
            return;
        }

        // Если сообщение связано с товаром
        const keywords = analysisResult.keywords.map(kw => kw.keyword);
        const categories = analysisResult.keywords.map(kw => kw.category);

        // Добавление сообщения и анализа в базу данных
        await addMessages(phone, groupId, text);
        await addAnalysis(groupId, phone, keywords, categories, text);
    }
});

// Обработка события добавления пользователя в группу
client.on('group_join', async (notification) => {
    console.log("Пользователь присоединился к группе");
    const userId = notification.id.participant;
    const phone = await client.getFormattedNumber(userId);
    const groupId = notification.chatId;
    const group = await client.getChatById(groupId);
    const participants = group.participants.map(participant => participant.id._serialized);
    const memberCount = participants.length;
    const groupName = group.name;

    // Проверка и добавление пользователя в базу данных
    await checkUserGroup(userId, phone, groupId, groupName, memberCount);
});

// Обработка события удаления пользователя из группы
client.on('group_leave', async (notification) => {
    const userId = notification.id.participant;
    const groupId = notification.chatId;
    const group = await client.getChatById(groupId);
    const participants = group.participants.map(participant => participant.id._serialized);
    const memberCount = participants.length;

    // Удаление пользователя из базы данных
    const result = await deleteUsersWithGroup(userId, groupId, memberCount);
    if (result) {
        io.emit('group_updated'); // Уведомление о обновлении группы
        console.log(`Пользователь ${userId} успешно удален из группы ${groupId}`);
    } else {
        console.log(`Не удалось удалить пользователя ${userId} из группы ${groupId}`);
    }
});

// Обработка события отключения клиента
client.on('disconnected', async (reason) => {
    console.log('Бот отключен:', reason);
    await client.destroy(); // Завершение сессии
});

// Запуск серверных функций
serverFunctions();

// Инициализация клиента
client.initialize();