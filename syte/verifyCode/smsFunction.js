import twilio from "twilio"; // Импорт библиотеки Twilio для отправки SMS
import dotenv from 'dotenv'; // Импорт dotenv для работы с переменными окружения

/**
 * Функция для отправки кода подтверждения на указанный номер телефона.
 * @param {string} phone - Номер телефона, на который будет отправлен код.
 */
export async function sendCode(phone) {
    dotenv.config(); // Загружаем переменные окружения из файла .env

    // Получаем данные из переменных окружения
    const accounSid = process.env.TWILIO_ACCOUNT_SID; // SID аккаунта Twilio
    const authToken = process.env.TWILIO_AUTH_TOKEN; // Токен авторизации Twilio
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Номер телефона Twilio

    // Генерируем случайный 6-значный код подтверждения
    const randomCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const code = randomCode.toString(); // Преобразуем код в строку
    const messageCode = `Ваш код подтверждения: ${code}`; // Формируем текст сообщения

    // Инициализируем клиент Twilio
    const client = twilio(accounSid, authToken);

    // Отправляем SMS с кодом подтверждения
    client.messages.create({
        body: messageCode, // Текст сообщения
        from: twilioPhoneNumber, // Отправитель (номер Twilio)
        to: phone // Получатель (номер телефона)
    }).then((message) => {
        // Если сообщение успешно отправлено
        console.log('Сообщение отправлено! ID:', message.sid); // Логируем ID сообщения
        console.log('Код подтверждения:', code); // Логируем отправленный код
    }).catch((err) => {
        // Если произошла ошибка при отправке
        console.log('Ошибка при отправке SMS:', err); // Логируем ошибку
    });
}