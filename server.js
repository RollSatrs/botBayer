import path from "path" // Модуль для работы с путями
import { fileURLToPath } from 'url' // Модуль для работы с URL
import express from 'express' // Фреймворк для создания сервера
import { getGroupsData, getAnalyze, addUsers } from './dataBase/dbFunctions.js' // Импорт функций для работы с базой данных
import http from 'http' // Модуль для создания HTTP-сервера
import { Server } from 'socket.io' // Библиотека для работы с WebSocket
import crypto from 'crypto' // Модуль для работы с криптографией

// Получение текущего пути файла
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PORT = 4040 // Порт для запуска сервера
const app = express() // Создание экземпляра приложения Express
const server = http.createServer(app) // Создание HTTP-сервера
const SECRET_KEY = crypto.randomBytes(32).toString('hex') // Генерация секретного ключа

// Настраиваем Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? ["https://ваш-домен.com"] // Разрешённые домены в продакшене
            : ["http://localhost:*"], // Разрешённые домены в разработке
        methods: ["GET", "POST"] // Разрешённые методы
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 60000 // Время восстановления соединения
    }
});

// Middleware для проверки токена в Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // Логика проверки токена (если требуется)
    next();
});

// Экспортируем объект io для использования в других файлах
export { io };

// Настраиваем статическую папку для сервера
app.use(express.static(path.join(__dirname, 'syte')));

// Основная функция для настройки маршрутов и запуска сервера
export function serverFunctions() {
    app.use(express.urlencoded({ extended: true })) // Middleware для обработки URL-кодированных данных
    app.use(express.json()) // Middleware для обработки JSON-данных

    // Маршрут для страницы авторизации
    app.get('/auth', (req, res) => {
        const filePath = path.join(__dirname, 'syte', 'auth', 'index.html')
        console.log(filePath)
        res.sendFile(filePath)
    })

    // Маршрут для страницы регистрации
    app.get('/reg', (req, res) => {
        const filePath = path.join(__dirname, 'syte', 'reg', 'index.html')
        console.log(filePath)
        res.sendFile(filePath)
    })

    // Маршрут для страницы верификации кода
    app.get('/verify-code', (req, res) => {
        const filePath = path.join(__dirname, 'syte', 'verifyCode', 'index.html')
        console.log(filePath)
        res.sendFile(filePath)
    })

    // Маршрут для административной панели
    app.get('/admin-panel', (req, res) => {
        const filePath = path.join(__dirname, 'syte', 'adminPanel', 'index.html')
        console.log(filePath)
        res.sendFile(filePath)
    })

    // Маршрут для тестовой страницы
    app.get('/test', (req, res) => {
        const filePath = path.join(__dirname, 'syte', 'adminPanel', 'test.html')
        console.log(filePath)
        res.sendFile(filePath)
    })

    // API для получения данных о группах
    app.get('/api/groups', async (req, res) => {
        try {
            const groups = await getGroupsData();
            if (!groups || groups.length === 0) {
                return res.status(404).json({ error: 'Группы не найдены' });
            }
            res.json(groups);
        } catch (error) {
            console.error('Ошибка при обработке запроса:', error.message);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    })

    // API для получения анализа данных группы
    app.get('/api/analyze/:groupId', async (req, res) => {
        try {
            const { groupId } = req.params
            console.log('Получен запрос на анализ группы:', groupId)
            const response = await getAnalyze(groupId)
            console.log(response)
            res.json(response)
        } catch (error) {
            console.error('Ошибка при обработке запроса:', error.message);
        }
    })

    // Маршрут для авторизации пользователя
    app.post('/auth/login', async (req, res) => {
        console.log('Все данные от клиента', req.body)
        const { phone, password } = req.body
        try {
            const existingUser = await checkUser(phone, password)
            if (!existingUser) {
                return res.status(400).json({
                    message: 'Неверный логин или пароль',
                    success: false
                })
            }
            return res.status(200).json({
                message: 'Ты вошел все успешно',
                success: true
            })
        } catch (err) {
            return res.status(500).json({
                message: 'Ошибка со стороны базы данных ', err,
                success: false
            })
        }
    })

    // Маршрут для регистрации пользователя
    app.post('/reg/register', async (req, res) => {
        const { phone, password, confirm_password } = req.body
        console.log('Номер телефона: ', phone)
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Пароли не совпадают',
                info: {
                    phoneNumber: phone
                }
            })
        }
        try {
            const existingUser = await findUser(phone)
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Пользователь с таким номером телефона уже существует"
                })
            }
            const addUserDB = await addUsers(phone, password)
            if (!addUserDB) {
                return res.status(410).json({
                    success: false,
                    message: 'Не удалось добавить пользователя'
                })
            }
            return res.status(200).json({
                success: true,
                info: {
                    phoneNumber: phone
                }
            })

        } catch (err) {
            console.log("Ошибка при добавлении пользователя: ", err)
            return res.status(400).json({
                success: false,
                message: "Произошла ошибка при регистрации"
            })
        }
    })

    // Запуск сервера
    server.listen(PORT, () => {
        console.log('Server Ok')
    })
}


