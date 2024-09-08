import express from "express";
import uniqid from "uniqid";
import fs from "fs";
import cors from "cors";
import { GPTScript, RunEventType } from "@gptscript-ai/gptscript";
//ADD REQ.TXT
const app = express();
app.use(cors());

const g = new GPTScript();

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

  const opts = {
    input: `--url ${url} --dir ${path}`,
    disableCache: true,
    model: "gpt-4o-mini",
  };

  console.log("Options:", opts); // Log the options to verify
  console.log("Using model:", g.model);

  try {
    const run = await g.run("./story.gpt", opts);
    run.on(RunEventType.Event, (ev) => {
      if (ev.type === RunEventType.CallFinish && ev.output) {
        console.log(ev.output);
      }
    });
    const result = await run.text();
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.json("error");
  }
});

app.listen(8080, () => console.log("listening on port 8080"));
