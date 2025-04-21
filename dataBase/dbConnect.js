import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config()

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
