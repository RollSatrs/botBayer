import path from "path"
import express from 'express'
import {fileURLToPath} from 'url'
import {addUser, findUser} from './dataBase/dbFunctions.js'
import { error } from "console"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PORT = 3000
const app = express()

app.use(express.urlencoded({extended: true}))
app.use(express.json())
// app.use(express.static(path.join(__dirname, 'syte')))

app.use(express.static(path.join(__dirname, 'syte')));

app.get('/auth', (req, res)=>{
    const filePath =path.join(__dirname, 'syte', 'auth', 'index.html') 
    console.log(filePath)
    res.sendFile(filePath)
})

app.get('/reg', (req, res) =>{
    const filePath = path.join(__dirname, 'syte', 'reg', 'index.html')
    console.log(filePath)
    res.sendFile(filePath)
})

app.get('/verify-code', (req, res) =>{
    const filePath = path.join(__dirname, 'syte', 'verifyCode', 'index.html')
    console.log(filePath)
    res.sendFile(filePath)
})

app.get('/forget', (req, res) =>{
    const filePath = path.join(__dirname, 'syte', )
})

app.post('/auth/login', (req, res) =>{
    console.log(req.body)
    const {phone, password} = req.body
    console.log(`Вот товой логин: ${phone}, Пароль: ${password}`)
    res.send('Данные получены!')
})

app.post('/reg/register', async (req, res)=>{
    const {phone, password, confirm_password} = req.body
    const cleanPhone = phone.replace(/[^+\d]/g, '');
    console.log(cleanPhone)    
    if(password !== confirm_password){
        // alert('Пароли не совпадают')
        return res.status(400).json({
            success: false,
            message: 'Пароли не совподают',
            info:{
                phoneNumber: cleanPhone
            }
        })
    }
    try{
        const existingUser = await findUser(cleanPhone)
        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "Пользователь с таким номером телефона уже существует"
            })
        }
        await addUser(cleanPhone, password)
        return res.status(200).json({
            success: true, 
            info:{
                phoneNumber: cleanPhone
            }
        })
       
    }catch(err){
        console.log("Ошибка при добавлении пользователя: ", err)
        return res.status(400).json({
            success: false,
            message: "Произошла ошибка при регистрации"
        })
    }
})



app.get('/', (req, res)=>{
    res.status(400).send('Доступ запрещен')
})

app.listen(PORT, ()=>{
    console.log('Server Ok')
})
