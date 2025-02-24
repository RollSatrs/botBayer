import path from "path"
import express from 'express'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PORT = 3000
const app = express()

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'auth')))

app.get('/sign', (req, res)=>{
    const filePath =path.join(__dirname, 'auth', 'index.html') 
    res.sendFile(filePath)
    console.log(path.join(__dirname, 'auth'))
    // console.log(filePath)
    
    // res.sendFile(path.join(__dirname, ))
})

app.post('/sign/login', (req, res) =>{
    console.log(req.body)
    const {username, password} = req.body
    console.log(`Вот товой логин: ${username}, Пароль: ${password}`)
    res.send('Данные получены!')
})

app.get('/', (req, res)=>{
    res.status(403).send('Доступ запрещен')
})

app.listen(PORT, ()=>{
    console.log('Server Ok')
})
