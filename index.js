import express from "express";
const app = express();
import "dotenv/config";
import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
async function getWeather(location, res) {
  await page.goto(`https://www.google.com/search?q=${location}+weather&hl=en`);
  try {
    const data = await page.evaluate(() => ({
      temperature: {
        f: document.getElementById("wob_ttm").innerHTML,
        c: document.getElementById("wob_tm").innerHTML,
      },
      precipitation: document.getElementById("wob_pp").innerHTML,
      humidity: document.getElementById("wob_hm").innerHTML,
      wind: {
        km: document.getElementById("wob_ws").innerHTML,
        mph: document.getElementById("wob_tws").innerHTML,
      },
      state: document.getElementById("wob_dc").innerHTML,
    }));
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({
      error: `Bad Request`,
      reason: `Location(${location}) not found`,
    });
  }
}

app.all("/weather", async (req, res) => {
  if (!req.query.location)
    return res
      .status(400)
      .json({ error: "Bad Request", reason: "Location query not found" });
  await getWeather(req.query.location.replaceAll('"', ""), res);
});
app.all("*", (req, res) => {
  res.status(404).json({ error: "Page not found" });
});
const listen = app.listen(3000, () => {
  console.log(`App started http://localhost:${listen.address().port}`);
});
