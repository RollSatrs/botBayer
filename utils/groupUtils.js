// 📥 Получение списка всех групп и их участников
export async function getGroup(client) {
    const chats = await client.getChats();
    const groupChats = chats.filter(chat => chat.isGroup);
    let groupData = [];

    for (let group of groupChats) {
        const participants = group.participants.map(participant => participant.id._serialized);
        groupData.push({
            id: group.id._serialized,  // ID группы
            name: group.name,          // Название группы
            participants: participants  // Список участников
        });
    }

    return groupData;
}

// 🔄 Создание списка пользователей с их группами
export async function findUserInMultipleGroups(groupData) {
    let userGroups = {};

    groupData.forEach(group => {
        group.participants.forEach(participant => {
            if (!userGroups[participant]) {
                userGroups[participant] = [];
            }
            userGroups[participant].push({
                id: group.id,   // ID группы
                name: group.name // Название группы
            });
        });
    });

    return userGroups;
}
