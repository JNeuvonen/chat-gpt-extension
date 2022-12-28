import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import openai from "./lib/open-ai";
import { promptConfig } from "./lib/prompt-config";

dotenv.config();
const jsonParser = bodyParser.json();

const app = express();
app.use(cors());
app.use(jsonParser);

app.post("/prompt/", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    // BAD REQUEST
    console.log(req.body);

    res.status(400).send("Prompt was empty");
    return;
  }

  try {
    const response = await openai.createCompletion({
      ...promptConfig,
      prompt,
    });

    // OK
    res.send(response.data);
    return;
  } catch (err) {
    // TODO
    console.log(err);
  }

  res.send("hello world");
});

app.get("/", (_req, res) => {
  res.send("Hello world");
});

app.listen(process.env.PORT, () => {
  console.log(`server running : ${process.env.PORT}`);
});
