import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { getResponseGpt } from './chatGptFunction.js';
import {
    addUserDB, 
    delateUserDB, 
    checkUserPhoneDB, 
    checkGroupDB, 
    addGroupDB, 
    removeUserFromGroup,
    addHistoryDB,
    deleteUserIfNoGroups,
    addUserToGroupDB

} from './dataBase/dbFunctions.js';


const { Client, LocalAuth } = pkg;
const client =new Client({
    authStrategy: new LocalAuth({
        dataPath: '/session'
    }),puppeteer:{
        headless: true,
        args:[]
    }
})
client.on('qr', (qr) =>{
    qrcode.generate(qr, {small:true})
})

client.on('ready', async()=>{
    console.log('Бот в полном готовности')
    await new Promise(resolve => setTimeout(resolve, 5000))
})

client.on('group_join', async msg =>{
    const chat = await msg.getChat()
    const groupId = chat.id._serialized
    const groupName = chat.name
    const userId = msg.recipientIds[0]
    const phoneUser =  userId.split('@', 1)
    const checkPhone = await checkUserPhoneDB(phoneUser[0])
    const checkGroup = await checkGroupDB(groupId)

    console.log(checkPhone)
    if(!checkPhone){
        await addUserDB(number[0])
    }
    if(!checkGroup){
        await addGroupDB(groupId, groupName)
    }
    await addUserToGroupDB(phoneUser[0], groupId)

    console.log(phoneUser[0])
})

client.on('group_leave', async msg =>{
    const chat = await msg.getChat()
    const groupId = chat.id._serialized
    const groupName = chat.name
    const userId = msg.recipientIds[0]
    const phoneUser =  userId.split('@', 1)
    await removeUserFromGroup(userId, groupId)
    console.log(phoneUser[0])
})

client.on('message', async msg => {
    const chat = await msg.getChat();   

    // Проверяем, что сообщение пришло из группы
    if (!chat.isGroup) {
        return;
    }

    const groupId = chat.id._serialized;
    const groupName = chat.name;
    const msgUser = msg.body;
    const phoneUser = msg.author.replace('@c.us', '');

    // Анализируем сообщение через GPT
    const analysis = await getResponseGpt(msgUser);
    if (analysis && analysis.product_related === false) {
        console.log("Сообщение не связано с товаром, сохранять не будем.");
        return; // Не сохраняем историю
    }

    const keywords = analysis.keywords;
    const category_name = analysis.category;

    if (!msg.body) {
        console.log('Ошибка: пустое сообщение');
        return;
    }

    // Сохраняем сообщение в history
    await addHistoryDB(phoneUser, groupId, msgUser, category_name, keywords);

    // Отправляем ответ в группу
    const productRequest = `Пользователь ${phoneUser} ищет товары в категории ${category_name}. Полный запрос: '${msgUser}'. Ключевые слова: ${keywords}`;
    
});


client.initialize()