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
npm install pg@^8.15.6
npm install pg-hstore@^2.3.4
npm install qrcode@^1.5.4
npm install qrcode-terminal@^0.12.0
npm install sequelize@^6.37.7
npm install socket.io@^4.8.1
npm install twilio@^5.4.5
npm install whatsapp-web.js@^1.26.1-alpha.3

4. Запуск проекта

Для запуска проекта в режиме разработки (с использованием nodemon):

npm run dev

Для запуска проекта в обычном режиме:

npm start

5. Обновление зависимостей

Если вы добавили новую зависимость в package.json, выполните:

npm install

6. Работа с git и GitHub

- Для инициализации git-репозитория:

  git init

- Для добавления всех файлов и первого коммита:

  git add .
  git commit -m "Первый коммит"

- Для подключения к GitHub-репозиторию:

  git remote add origin https://github.com/ВАШ_ЛОГИН/ВАШ_РЕПОЗИТОРИЙ.git

- Для отправки изменений на GitHub:

  git push -u origin master

- Для обновления README.md на GitHub просто закоммитьте и отправьте изменения:

  git add README.md
  git commit -m "Обновлен README.md"
  git push

