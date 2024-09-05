import express from "express";
import uniqid from "uniqid";
import fs from "fs";
import cors from "cors";
import { GPTScript, RunEventType } from "@gptscript-ai/gptscript";

const app = express();
app.use(cors());

const gptscript = new GPTScript();

app.get("/test", (req, res) => {
  return res.json("testing");
});

app.get("/create-story", async (req, res) => {
  const url = req.query.url;
  const dir = uniqid();
  const path = "./stories/" + dir;
  fs.mkdirSync(path, { recursive: true });

  console.log({
    url,
  });

  const run = await gptscript.run("./story.gpt", {
    input: "--url ${url} --dir ${dir}",
    disableCache: true,
  });
  run.on(RunEventType.Event, (ev) => {
    if (ev.type === RunEventType.CallFinish) {
      console.log(ev.output);
    }
  });
  const result = await run.text();

  return res.json(result);
});

app.listen(8080, () => console.log("listening on port 8080"));
