import { Group, Contact, UserGroup, Message, AnalysisResult } from './createTableDB.js';
import { sequelize } from './dbConnect.js';

// Добавление или обновление группы
export async function addGroups(groupID, name, memberCount) {
    return Group.upsert({ group_id: groupID, name, member_count: memberCount });
}

// Добавление пользователя
export async function addUsers(phoneId, phone) {
    return Contact.findOrCreate({ where: { phone_id: phoneId }, defaults: { phone_number: phone } });
}

// Добавление связи между пользователем и группой
export async function addUserGruops(phoneID, groupID) {
    return UserGroup.findOrCreate({ where: { phone_id: phoneID, group_id: groupID } });
}

// Проверка и добавление пользователя, группы и их связи (транзакция)
export async function checkUserGroup(phoneId, phone, groupId, name, memberCount) {
    const t = await sequelize.transaction();
    try {
        await addGroups(groupId, name, memberCount);
        await addUsers(phoneId, phone);
        await addUserGruops(phoneId, groupId);
        await t.commit();
        return true;
    } catch (err) {
        await t.rollback();
        console.log(`Ошибка со стороны функции checkUserGroup: ${err}`);
        return false;
    }
}

// Удаление пользователя из группы и обновление member_count
export async function deleteUsersWithGroup(phoneId, groupId, count) {
    const t = await sequelize.transaction();
    try {
        await UserGroup.destroy({ where: { phone_id: phoneId, group_id: groupId }, transaction: t });
        await Group.update({ member_count: count }, { where: { group_id: groupId }, transaction: t });
        await t.commit();
        return true;
    } catch (err) {
        await t.rollback();
        console.log(`Ошибка со стороны функции deleteUsersWithGroup: ${err}`);
        return false;
    }
}

// Добавление сообщения
export async function addMessages(phoneID, groupID, text) {
    return Message.create({ phone_id: phoneID, group_id: groupID, text });
}

// Добавление или обновление результатов анализа
export async function addAnalysis(group_id, user_phone, keywords, categories, text) {
    const [result, created] = await AnalysisResult.findOrCreate({
        where: { group_id, user_phone },
        defaults: { keywords, categories, text: [text] }
    });
    if (!created) {
        // Обновляем массивы, добавляя новые значения без дубликатов
        const newKeywords = Array.from(new Set([...(result.keywords || []), ...keywords]));
        const newCategories = Array.from(new Set([...(result.categories || []), ...categories]));
        const newText = Array.from(new Set([...(result.text || []), text]));
        await result.update({ keywords: newKeywords, categories: newCategories, text: newText });
    }
    return result;
}

// Получение данных о группах
export async function getGroupsData() {
    return Group.findAll({ attributes: ['group_id', 'name', 'member_count'] });
}

// Получение анализа по группе
export async function getAnalyze(groupId) {
    return AnalysisResult.findAll({
        where: { group_id: groupId },
        attributes: ['categories', 'keywords', 'analyzed_at', 'user_phone', 'text'],
        include: [{ model: Group, attributes: ['name'] }],
        order: [['analyzed_at', 'DESC']]
    });
}

export async function getAllUsers() {
    return Contact.findAll()
}

export async function dropTables() {
    try {
        await sequelize.drop({ cascade: true });
        console.log('Все таблицы успешно удалены.');
    } catch (error) {
        console.error('Ошибка при удалении таблиц:', error.message);
    }
}

export async function updateDataBase() {
    try {
        await sequelize.sync({ alter: true });
        console.log('Все таблицы пересозданы (обновлены)!');
    } catch (error) {
        console.error('Ошибка при обновлении таблиц:', error.message);
    }
}