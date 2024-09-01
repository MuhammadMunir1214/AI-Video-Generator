import express from "express";

const app = express();

app.get("/test", (req, res) => {
  return res.json("testing");
});

app.get("/create-story", (req, res) => {
  const url = req.query.url;
  console.log({
    url,
  });
  return res.json("okay");
});

app.listen(8080, () => console.log("listening on port 8080"));
