// Ждём полной загрузки DOM перед выполнением скрипта
document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена'); // Логируем загрузку страницы

    // Получаем элементы формы и её полей
    const form = document.querySelector('#register-form'); // Форма регистрации
    const phoneInput = document.querySelector('input[name="phone"]'); // Поле ввода телефона
    const passwordInput = document.querySelector('input[name="password"]'); // Поле ввода пароля
    const confirmPasswordInput = document.querySelector('input[name="confirm_password"]'); // Поле подтверждения пароля
    const errorMessage = document.querySelector('.error-message'); // Элемент для отображения ошибок
    const userMessage = document.querySelector('.user-message'); // Элемент для отображения сообщений пользователю

    console.log(userMessage); // Логируем элемент для проверки

    // Обрабатываем отправку формы
    form.addEventListener("submit", async (event) => {
        const phone = phoneInput.value; // Получаем значение телефона
        const password = passwordInput.value; // Получаем значение пароля
        const cleanPhone = phone.replace(/[^+\d]/g, ''); // Очищаем телефон от лишних символов
        console.log(cleanPhone.length); // Логируем длину очищенного телефона
        const confirmPassword = confirmPasswordInput.value; // Получаем значение подтверждения пароля

        console.log('Нажал на кнопку'); // Логируем нажатие на кнопку
        event.preventDefault(); // Отменяем стандартное поведение формы
        console.log(password, confirmPassword); // Логируем пароли

        // Формируем данные для отправки
        const formData = {
            phone: cleanPhone,
            password: password,
            confirm_password: confirmPassword
        };

        try {
            // Отправляем данные на сервер
            const response = await fetch('/reg/register', {
                method: "POST", // Метод запроса
                headers: { 'Content-Type': 'application/json' }, // Указываем тип содержимого
                body: JSON.stringify(formData) // Преобразуем данные в JSON
            });
            console.log(`Статус ответа: ${response.status}`); // Логируем статус ответа

            // Обработка ошибок
            if (response.status === 400) {
                const result = await response.json();
                console.error('Ошибка 400:', result.message); // Логируем сообщение об ошибке
                errorMessage.style.display = 'block'; // Показываем сообщение об ошибке
                userMessage.style.display = 'none'; // Скрываем сообщение для пользователя
                return;
            }

            if (response.status === 409) {
                const result = await response.json();
                console.log('Ошибка 409:', result.message); // Логируем сообщение об ошибке
                userMessage.style.display = 'block'; // Показываем сообщение для пользователя
                errorMessage.style.display = 'none'; // Скрываем сообщение об ошибке
                return;
            }

            if (!response.ok) {
                console.log('Ошибка HTTP:', response.status); // Логируем статус ошибки
                return;
            }

            // Обрабатываем успешный ответ
            const result = await response.json();
            if (result.success) {
                window.location.href = '/verify-code'; // Перенаправляем на страницу верификации
            } else {
                console.log('Ошибка со стороны сервера'); // Логируем ошибку сервера
            }
        } catch (err) {
            console.log(err); // Логируем ошибку запроса
        }
    });
});