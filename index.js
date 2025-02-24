import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { getResponseGpt } from './chatGptFunction.js';
import {getGroup, findUserInMultipleGroups} from './utils/groupUtils.js'
import {saveUserData,removeUserFromGroup, processGroupMessage} from './dataBase/dbFunctions.js';

const mixShop = '120363372643476883@g.us'
const { Client, LocalAuth } = pkg;
const client =new Client({
    authStrategy: new LocalAuth({
        dataPath: '/session'
    }),puppeteer:{
        headless: true,
        args:[]
    }
})

client.on('qr', (qr) => {
    console.log('Сгенерирован QR-код, отсканируйте его в WhatsApp!');
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('✅ Бот полностью готов!');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await syncAllGroups(); // Синхронизация всех групп при старте
});

// 📩 Обработка сообщений
client.on('message', async (message) => {
    const chat = await message.getChat();
    console.log('ewewe')
    if (chat.isGroup) {
        await processGroupMessage(message);
        // message.reply(answer)
    }
});

// 🔄 Функция синхронизации всех групп
async function syncAllGroups() {
    const groupData = await getGroup(client);
    const userGroups = await findUserInMultipleGroups(groupData);
    // console.log(userGroups)
    await saveUserData(userGroups);
}

// 📤 Удаление пользователя при выходе из группы
client.on('group_leave', async (notification) => {
    const userId = notification.id.participant;
    const groupId = notification.chatId;
    
    console.log(`🚪 Пользователь ${userId} вышел из группы ${groupId}`);
    await removeUserFromGroup(userId, groupId);
});

client.initialize();