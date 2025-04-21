Установка зависимостей для проекта

Для работы проекта необходимо установить следующие зависимости, указанные в package.json. Выполните команды ниже:

1. Инициализация проекта (если не выполнено)

Если файл package.json ещё не создан, выполните команду:

npm init -y

2. Установка всех зависимостей

Выполните следующую команду, чтобы установить все зависимости, указанные в package.json:

npm install

3. Установка зависимостей по отдельности (если требуется)

Если вы хотите установить зависимости вручную, выполните следующие команды:

npm install body-parser@^1.20.3
npm install crypto@^1.0.1
npm install dotenv@^16.4.7
npm install ejs@^3.1.10
npm install express@^4.21.2
npm install express-rate-limit@^7.5.0
npm install firebase-admin@^13.1.0
npm install helmet@^8.1.0
npm install nodemon@^3.1.9
npm install openai@^4.83.0
npm install pg@^8.13.1
npm install qrcode@^1.5.4
npm install qrcode-terminal@^0.12.0
npm install socket.io@^4.8.1
npm install twilio@^5.4.5
npm install whatsapp-web.js@^1.26.1-alpha.3

4. Запуск проекта

Для запуска проекта в режиме разработки (с использованием nodemon):

npm run dev

Для запуска проекта в обычном режиме:

npm start

