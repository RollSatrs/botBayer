import OpenAI from 'openai';
import { apiChatGpt } from './token.js';

const openai = new OpenAI({
    apiKey: apiChatGpt
})

export async function getResponseGpt(message) {
    try{
        const response =  await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [
                {
                    role: "system",
                    content: `
                        Ты — помощник, который анализирует сообщения и определяет:
                        1. Относится ли сообщение к товару.
                        2. Ключевые слова.
                        3. Категорию товара из списка: Электроника, Одежда, Бытовая техника, Мебель, Книги, Спорттовары, Другое.
                        4. Если сообщение является отзывом о товаре, не сохраняй его.
                        
                        Формат ответа:
                        - Если сообщение связано с товаром: 
                          { 
                            "product_related": true, 
                            "keywords": "ключ1, ключ2", 
                            "category": "категория" 
                          }
                        - Если не связано: 
                          { 
                            "product_related": false 
                          }
                        - Если сообщение является отзывом (например, "Этот телефон отличный" или "Рекомендую эту кофемашину"), верни:
                          {  
                            "product_related": false  
                          }
                    `
                },
                {
                    role: "user",
                    content: `Проанализируй сообщение: "${message}"`
                }
            ],
            max_tokens: 300,
            temperature: 0.5
        });
        const result = JSON.parse(response.choices[0].message.content)
        return result
    }catch(err){
        console.log('Ошибка при запросе: ', err)
        return null
    }

    // return response.data.choices[0].text.trim();
}