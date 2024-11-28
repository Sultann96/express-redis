import express from "express";
import redis from "redis";

const app = express();

const client = redis.createClient();
client.on("error", (err) => {
    console.error("Redis error:", err);
});

client.on('connect', ()=>{
	console.log('connected to redis')
})
app.use(express.json());

app.post("/users", async (req, res) => { // changed to async
    const { id, name } = req.body;

    if (!id || !name) {
        return res.status(400).json({ error: "Недостаточно данных" });
    }

    const userId = String(id);
    const user = { id: userId, name };

    try {
      await client.set(`user:${userId}`, JSON.stringify(user)); // await the operation
      res.status(201).json({ message: "ok", user });
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      res.status(500).json({ error: "Ошибка сохранения" });
    }
});

app.get("/users/:id", async (req, res) => {
    const userId = req.params.id;
  
    try {
        const user = await client.get(`user:${userId}`);
        if (user === null) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        let parsedUser;
        try {
           parsedUser = JSON.parse(user);
        } catch (jsonError) {
          console.error('Ошибка парсинга JSON:', jsonError);
          return res.status(500).json({ error: "Ошибка парсинга данных" });
        }

        res.json(parsedUser);
    } catch (error) {
        console.error("Ошибка получения пользователя:", error);
        res.status(500).json({ error: "Ошибка получения пользователя" });
    }
});

client.connect().then(()=>{
	app.listen(3000, () => {
		console.log("serwer work");
	});
})
