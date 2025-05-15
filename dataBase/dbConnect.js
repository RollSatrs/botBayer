import pkg from 'pg';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
const { Pool } = pkg;

dotenv.config()

export const sequelize = new Sequelize(
  process.env.DB_NAME,         // имя базы
  process.env.DB_USER,         // пользователь
  process.env.DB_PASSWORD,     // пароль
  {
    host: process.env.DB_HOST, // хост
    port: process.env.DB_PORT,                 // порт
    dialect: 'postgres',       // тип базы
    logging: false,            // отключить логи
  }
);