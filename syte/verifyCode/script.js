// Ждём полной загрузки DOM перед выполнением скрипта
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#code'); // Форма для ввода кода
    const inputs = document.querySelectorAll('.input-code input'); // Поля ввода для кода

    // Обрабатываем ввод в каждое поле
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            console.log(input.value); // Логируем введённое значение
            // Если поле заполнено и это не последнее поле, переходим к следующему
            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (el) => {
            // Если нажата клавиша Backspace и поле пустое, переходим к предыдущему полю
            if (el.key === 'Backspace' && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    // Обрабатываем отправку формы
    form.addEventListener('submit', async (event) => {
        console.log('Нажал на кнопку'); // Логируем нажатие на кнопку
        event.preventDefault(); // Отменяем стандартное поведение формы

        // Собираем значения всех полей в один код
        const codeInput = Array.from(inputs).map(input => input.value).join('');
        console.log(codeInput); // Логируем введённый код

        // Отправляем код на сервер
        const response = await fetch('/verify-code', {
            method: "POST", // Метод запроса
            headers: { 'Content-Type': 'application/json' }, // Указываем тип содержимого
            body: JSON.stringify({ code: codeInput }) // Преобразуем данные в JSON
        });

        // Обрабатываем ответ сервера (если нужно)
        console.log(await response.json());
    });
});