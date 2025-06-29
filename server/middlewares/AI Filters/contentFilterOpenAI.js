const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI-ის მოდერაციის API: შეამოწმე მავნე შინაარსი
async function isHarmful(text) {
  const moderationRes = await openai.moderations.create({ input: text });
  return moderationRes.results[0].flagged;
}

// GPT-4o: შეაფასე კონტენტი - არის თუ არა პროგრამული, სპამი ან მავნე
async function classifyContent(text) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `შენ ხარ მკაცრი მოდერატორი. მხოლოდ პროგრამირების ან ვებდეველოპმენტთან დაკავშირებული თემები დაშვებულია.

შეაფასე ეს ტექსტი ერთ-ერთი შემდეგი კატეგორიით:
- "OK" (დაშვებულია)
- "Not Programming" (არ უკავშირდება პროგრამირებას)
- "Spam" (რეკლამა/სპამი)
- "Other Harmful Content" (სექსუალური, ძალადობრივი, სუიციდური და სხვა მავნე შინაარსი)

დაბრუნე მხოლოდ ერთ-ერთი ზემოთ ჩამოთვლილი სიტყვა.`
      },
      {
        role: 'user',
        content: text
      }
    ]
  });

  return res.choices[0].message.content.trim();
}

// Express Middleware: შეამოწმე title და description
const contentFilter = async (req, res, next) => {
  const { title, description } = req.body;

  try {
    const fields = [];

    if (title) fields.push({ label: 'title', value: title });
    if (description) fields.push({ label: 'description', value: description });

    for (const { label, value } of fields) {
      if (await isHarmful(value)) {
        return res.status(400).json(`შენი ${label} შეიცავს მავნე შინაარსს.`);
      }

      const classification = await classifyContent(value);

      if (classification !== 'OK') {
        return res.status(400).json(`შენი ${label} არ არის დაშვებული: ${classification}`);
      }
    }

    next();
  } catch (err) {
    console.error('Content Filter Error:', err);
    res.status(500).json('შეცდომა კონტენტის გადამოწმებისას');
  }
};

module.exports = contentFilter;
