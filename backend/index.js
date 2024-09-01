import express from "express";

const app = express();

app.get("/test", (req, res) => {
  return res.json("testing");
});

app.listen(8080, () => console.log("listening on port 8080"));
