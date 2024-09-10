import express from "express";
import uniqid from "uniqid";
import fs from "fs";
import cors from "cors";
import { GPTScript, RunEventType } from "@gptscript-ai/gptscript";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

const g = new GPTScript({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini-2024-07-18",
});

// Test endpoint
app.get("/test", (req, res) => {
  return res.json("testing");
});

async function extractMainContent(url) {
  try {
    // Fetch the webpage content
    const response = await fetch(url);
    const html = await response.text();

    // Use JSDOM and Readability to extract the main article content
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    // Return the clean text content of the article if it was successfully parsed
    if (article && article.textContent) {
      return article.textContent; // Return the clean article text
    } else {
      throw new Error("Failed to extract main content");
    }
  } catch (e) {
    console.error("Error extracting main content:", e);
    return null;
  }
}

// Route to handle the creation of a story from the URL provided as a query parameter
app.get("/create-story", async (req, res) => {
  const url = req.query.url;
  const dir = uniqid();
  const path = "./stories/" + dir;
  fs.mkdirSync(path, { recursive: true });

  console.log({ url });

  try {
    // Extract only the main content from the page
    const articleContent = await extractMainContent(url);
    if (!articleContent) {
      return res.status(500).json({ error: "Failed to extract main content" });
    }

    // Limit the content to a specific length to avoid token overflow
    const maxLength = 4000;
    const truncatedContent = articleContent.substring(0, maxLength);

    const opts = {
      input: `--content "${truncatedContent}" --dir ${path}`,
      disableCache: true,
    };

    console.log("Options:", opts); // Log the options to verify

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
    return res.status(500).json("error");
  }
});

app.listen(8080, () => console.log("listening on port 8080"));
