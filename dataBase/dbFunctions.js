import { pool } from './dbConnect.js';

export async function checkHistoryDB(userId, grouopId) {
    let client
    try{
        client = await pool.connect()
        const result = await client.query(`SELECT 1 FROM history WHERE user_id = $1 AND`)
    }catch(err){
        console.log('Ошибка: при проверки:checkHistoryDB =>', err)
    }
}

export async function checkUserInOtherGroups(userId, groupId) {
    let client
    try{
        client = await pool.connect()
        const result = await client.query('SELECT 1 FROM user_group WHERE user_id = $1 AND group_id != $2', [userId, groupId])
        return result.rowCount > 0
    } catch(err){
        console.log('Ошибка: при проверки:checkUserInOtherGroups =>', err)
        return false
    }finally{
        if(client) client.release()
    }
}


export async function deleteUserIfNoGroups(userId) {
    let client;
    try {
        client = await pool.connect();
        // Проверим, есть ли у пользователя другие группы
        const hasOtherGroups = await checkUserInOtherGroups(userId);
        
        if (!hasOtherGroups) {
            // Если нет других групп, удалим пользователя
            await client.query('DELETE FROM users WHERE id = $1', [userId]);
            console.log(`Пользователь ${userId} был удален из базы данных`);
        } else {
            console.log(`Пользователь ${userId} все еще состоит в других группах`);
        }
    } catch (err) {
        console.log('Ошибка: при проверки:deleteUserIfNoGroups =>', err)
    } finally {
        if (client) client.release();
    }
}


export async function checkUserPhoneDB(number) {
    let client
    try{
        client = await pool.connect()
        const result = await client.query('SELECT 1 FROM users WHERE user_phone = $1', [number])
        return result.rowCount > 0
    }
    catch(err){
        console.log('Ошибка: при проверки:checkUserPhoneDB =>', err)
        return false
    }finally{
        if(client) client.release()
    }
}

export async function checkGroupDB(group) {
    let client
    try{
        client = await pool.connect()
        const result = await client.query('SELECT 1 FROM groups WHERE group_id = $1', [group])
        return result.rowCount > 0
    }
    catch(err){
        console.log('Ошибка: при проверки:checkGroupDB =>', err)
        return false
    }finally{
        if(client) client.release()
    }
}

export async function addUserDB(number) {
    let client
    try{
        client = await pool.connect()
        await client.query('INSERT INTO users(user_phone) VALUES($1)', [number])
        console.log('Все ок')
        return true
    }catch(err){
        console.log(`Ошибка брат: ${err}`)
        return false
    }finally{
        if(client) client.release()
    }
    
}

export async function addHistoryDB(userId, groupId, messageContent, categoryName, keywords) {
    let client
    try{
        client = await pool.connect()
        client.query('INSERT INTO history(user_id ,group_id, message, category, keywords) VALUES($1, $2, $3, $4, $5)', [userId, groupId, messageContent, categoryName, keywords])
        return true
    }catch(err){
        console.log(`Ошибка в функции addHistoryDB => ${err}`)
        return false
    }finally{
        if(client) client.release()
    }
}

export async function addGroupDB(group_id, group_name) {
    let client
    try{
        client = await pool.connect()
        client.query('INSERT INTO groups(group_id, group_name) VALUES($1, $2)', [group_id, group_name])
        return true
    }catch(err){
        console.log(`Ошибка в функции addGroupDB => ${err}`)
        return false
    }finally{
        if(client) client.release()
    }
}

export async function addUserToGroupDB(userPhone, groupIdIn) {
    let client;
    try {
        client = await pool.connect();

        // Получаем ID пользователя
        const userResult = await client.query('SELECT id FROM users WHERE user_phone = $1', [userPhone]);
        if (userResult.rowCount === 0) {
            console.log(`❌ Пользователь ${userPhone} не найден в базе`);
            return false;
        }
        const userId = userResult.rows[0].id;

        // Получаем ID группы
        const groupResult = await client.query('SELECT id FROM groups WHERE group_id = $1', [groupIdIn]);
        console.log(groupResult)
        if (groupResult.rowCount === 0) {
            console.log(`❌ Группа ${groupIdIn} не найдена в базе`);
            return false;
        }
        const groupId = groupResult.rows[0].id;

        // Проверяем, есть ли пользователь уже в группе
        const checkResult = await client.query('SELECT 1 FROM user_group WHERE user_id = $1 AND group_id = $2', [userId, groupId]);
        if (checkResult.rowCount > 0) {
            console.log(`⚠️ Пользователь ${userPhone} уже состоит в группе ${groupIdIn}`);
            return false;
        }

        // Добавляем пользователя в группу
        await client.query('INSERT INTO user_group (user_id, group_id) VALUES ($1, $2)', [userId, groupId]);
        console.log(`✅ Пользователь ${userPhone} добавлен в группу ${groupIdIn}`);

        return true;
    } catch (err) {
        console.log(`Ошибка в функции addUserToGroupDB: ${err}`);
        return false;
    } finally {
        if (client) client.release();
    }
}




export async function delateUserDB(number) {
    let client
    try{
        client = await pool.connect()
        await client.query('DELETE FROM users WHERE user_phone = $1', [number])
        console.log('Все удалил')
    }
    catch(err){console.log(`Ошибка следующего характера: ${err}`)}
    finally{
        if(client) client.release()
    }
}

export async function removeUserFromGroup(userId, groupId) {
    let client;
    try {
        client = await pool.connect();

        // Получаем ID пользователя по номеру телефона
        const userResult = await client.query('SELECT id FROM users WHERE user_phone = $1', [userPhone]);
        if (userResult.rowCount === 0) {
            console.log(`Ошибка: пользователь ${userPhone} не найден в базе`);
            return;
        }
        const userId = userResult.rows[0].id;

        // Удаляем пользователя из группы
        await client.query('DELETE FROM user_group WHERE user_id = $1 AND group_id = $2', [userId, groupId]);
        console.log(`Пользователь ${userPhone} (ID: ${userId}) удален из группы ${groupId}`);
    } catch (err) {
        console.log('Ошибка в removeUserFromGroup =>', err);
    } finally {
        if (client) client.release();
    }
}


// export async function delateUserDB(number) {
    //     try{
        //         await client.query('DELETE FROM users WHERE id = $1', [number])
        //         console.log('Все удалил')
        //     }
        //     catch(err){console.log(`Ошибка следующего характера: ${err}`)}
        // }
        
        
        // export async function removeUserFromGroup(userId, groupId) {
        //     let client;
        //     try {
        //         client = await pool.connect();
        //         await client.query('DELETE FROM user_group WHERE user_id = $1 AND group_id = $2', [userId, groupId]);
        //         console.log(`Пользователь ${userId} удален из группы ${groupId}`);
        //     } catch (err) {
        //         console.log('Ошибка: при проверки:removeUserFromGroup =>', err)
                
        //     } finally {
        //         if (client) client.release();
        //     }
        // }