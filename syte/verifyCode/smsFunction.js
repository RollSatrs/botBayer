import twilio from "twilio"
import dotenv from 'dotenv';
dotenv.config()

const accounSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
