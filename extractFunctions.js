import fs from 'fs'; // Импорт модуля для работы с файловой системой
import { exec } from 'child_process'; // Импорт функции для выполнения команд в терминале

/**
 * Функция для извлечения кадров из видео с помощью FFmpeg.
 * @param {string} videoPath - Путь к видеофайлу.
 * @param {string} outputFolder - Папка, в которую будут сохранены кадры.
 * @returns {Promise<string>} - Возвращает путь к папке с кадрами.
 */
export async function extractFrames(videoPath, outputFolder) {
    return new Promise((resolve, reject) => {
        // Проверяем, существует ли папка для сохранения кадров
        if (!fs.existsSync(outputFolder)) {
            // Если папка не существует, создаём её
            fs.mkdirSync(outputFolder, { recursive: true });
        }

        // Команда для извлечения кадров с помощью FFmpeg
        const command = `ffmpeg -i "${videoPath}" -vf "fps=1" "${outputFolder}/frame_%04d.jpg"`;
        
        // Выполняем команду в терминале
        exec(command, (error, stdout, stderr) => {
            if (error) {
                // Если произошла ошибка, выводим её в консоль и отклоняем промис
                console.error(`Ошибка при извлечении кадров: ${error.message}`);
                return reject(error);
            }
            // Если команда выполнена успешно, выводим сообщение и разрешаем промис
            console.log(`Кадры сохранены в: ${outputFolder}`);
            resolve(outputFolder);
        });
    });
}