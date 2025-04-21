if (message.hasMedia) {
    // Загружаем медиафайл из сообщения
    const media = await message.downloadMedia();
    console.log(media);

    // Если загрузка медиафайла не удалась, выводим сообщение об ошибке
    if (!media) return console.log("Ошибка загрузки.");

    let extension = ""; // Переменная для хранения расширения файла

    // Определяем тип медиафайла и задаём соответствующее расширение
    if (media.mimetype.includes("image")) {
        extension = "jpg"; // Изображение
    } else if (media.mimetype.includes("video")) {
        extension = "mp4"; // Видео
    } else if (media.mimetype.includes("audio")) {
        extension = "mp3"; // Аудио
    }

    // Формируем пути для сохранения медиафайла
    const folderPath = path.join(__dirname, 'media', `${groupId}`, `${phone}`, `${extension}`);
    const filePath = path.join(folderPath, `${messageId}.${extension}`);

    // Если папка для сохранения не существует, создаём её
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    // Сохраняем медиафайл в указанную папку
    await fs.promises.writeFile(filePath, Buffer.from(media.data, "base64"));

    // Если это изображение, анализируем его
    if (extension === "jpg") {
        const imageBuffer = await fs.promises.readFile(filePath); // Читаем изображение
        const base64Image = imageBuffer.toString("base64"); // Преобразуем в Base64
        console.log(imageBuffer);

        // Отправляем изображение на анализ
        const imgAnalysisResult = await getResponseImg(base64Image);
        console.log(`🔑 Ключевые слова изображения: ${imgAnalysisResult}`);
    } 
    // Если это видео, извлекаем кадры и анализируем их
    else if (extension === "mp4") {
        const frameFolder = path.join(__dirname, "media", groupId, phone, "frames"); // Папка для кадров
        const frames = await extractFrames(filePath, frameFolder); // Извлекаем кадры из видео
        console.log(frames);

        if (frames.length > 0) {
            console.log(`📸 Извлечено ${frames.length} кадров из видео`);
            const framePaths = frames.map(framePath => framePath); // Пути к кадрам

            // Анализируем извлечённые кадры
            const imgAnalysisResult = await getResponseImg(framePaths);
            console.log(`🔑 Общие ключевые слова для всех кадров: ${imgAnalysisResult}`);
        }
    }

    // Выводим путь к сохранённому файлу
    console.log(filePath);
}