require('dotenv').config();
const express = require('express');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// ფუნქცია: ამოწმებს არის თუ არა ტექსტი მავნე (ძალადობა, ჰეიტ-სპიჩი, და ა.შ.)
async function isHarmful(text) {
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "Check if the following text contains harmful content (violence, hate speech, self-harm, etc.). Respond ONLY with 'true' or 'false'."
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.1, // მკაცრი მოდერაციისთვის
            }),
        });

        const data = await response.json();
        console.log(data)
        const answer = data.choices[0].message.content.trim().toLowerCase();
        return answer === 'true';
    } catch (err) {
        console.error("DeepSeek API შეცდომა:", err);
        return false; // დეფოლტად დააბრუნე 'false' შეცდომის შემთხვევაში
    }
}

// ფუნქცია: ტექსტის კატეგორიზაცია (OK, Spam, Not Programming, Harmful)
async function classifyContent(text) {
    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `You are a strict content moderator. Classify the text into ONE of these categories:
                        - "OK" (allowed content)
                        - "Not Programming" (off-topic)
                        - "Spam" (promotional/scam)
                        - "Harmful" (dangerous/violent)
                        Respond ONLY with the label.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0, // მკაცრი კლასიფიკაციისთვის
            }),
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (err) {
        console.error("DeepSeek API შეცდომა:", err);
        return "Harmful"; // დეფოლტად დააბრუნე 'Harmful' შეცდომის დროს
    }
}

// ექსპრესის მიდლვეარი კონტენტის ფილტრაციისთვის
const contentFilterDeepSeek = async (req, res, next) => {
    const { title, description } = req.body;

    try {
        const fields = [];
        if (title) fields.push({ label: "title", value: title });
        if (description) fields.push({ label: "description", value: description });

        for (const { label, value } of fields) {
            // შეამოწმე მავნე შიგთავსი
            if (await isHarmful(value)) {
                return res.status(400).json(`Your ${label} contains harmful content.`);
            }

            // შეამოწმე კატეგორია
            const classification = await classifyContent(value);
            if (classification !== "OK") {
                return res.status(400).json(`Your ${label} was flagged as: ${classification}`);
            }
        }

        next(); // გადადი შემდეგ მიდლვეარზე
    } catch (err) {
        console.error("შეცდომა კონტენტის ფილტრაციისას:", err);
        res.status(500).json({ error: "Content filtering failed." });
    }
};

module.exports = contentFilterDeepSeek;