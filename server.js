const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer();
require("dotenv").config();

const { Deepgram } = require("@deepgram/sdk");
const deepgram = new Deepgram(process.env.DG_API);
const app = express();

const port = 3000;
app.use(express.static("static"));
app.use(cors());
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://deepgram-tokenizer.netlify.app/", // Add any other allowed origins here
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  next();
});

app.get("/", (req, res) => res.send("Deployed! 🚀"));
app.get("/deepgram-token", async (req, res) => {
  try {
    const newKey = await deepgram.keys.create(
      process.env.DEEPGRAM_PROJECT_ID,
      "Temporary key - works for 10 seconds",
      ["usage:write"],
      { timeToLive: 10 }
    );
    res.send(newKey);
  } catch (error) {
    console.error("Error while creating Deepgram key:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/dg-transcription", upload.single("file"), async (req, res) => {
  console.log(req.body);
  try {
    const dgResponse = await deepgram.transcription.preRecorded(
      {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
      },
      {
        smart_format: true,
        tag: ["dx-team"],
        model: "nova-2-ea",
      }
    );
    console.dir(dgResponse.results, { depth: 4 });
    res.send({ apiCall: dgResponse });
  } catch (e) {
    console.log("error", e);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
