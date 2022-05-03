import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
dotenv.config();

const app = express();
app.use(cors());
app.use(json());

app.post("/participants", async (req, res) => {
  const participant = req.body;

  try {
    const mongoClient = new MongoClient(process.env.MONGO_URI);
    await mongoClient.connect();

    const participantCollection = mongoClient.db("bate-papo-uol").collection("participants");
    const messageCollection = mongoClient.db("bate-papo-uol").collection("messages");

    const participantAlreadyExists = await participantCollection.findOne({
      name: participant.name
    });
    if (participantAlreadyExists) {
      return res.sendStatus(409);
    }

    await participantCollection.insertOne({
      name: participant.name,
      lastStatus: Date.now()
    });

    await messageCollection.insertOne({
      from: participant.name,
      to: "Todos",
      text: "oi galera",
      type: "message",
      time: dayjs().format("HH:mm:ss")
    });

    await mongoClient.close();
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(5000, () => {
  console.log("ONLINE ON PORT 5000");
});
