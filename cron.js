import { createRequire } from "module";
const require = createRequire(import.meta.url);

import cron from "cron";
const https = require("https");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(".env") });

const utilsUrl = process.env.RENDER_BACKEND_URL;
const n8nUrl = process.env.RENDER_N8N_URL;
const twitterScraperUrl= process.env.TWITTER_SCRAPER_URL;

const callUrl = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          console.log(`Successfully hit: ${url}`);
          resolve();
        } else {
          console.error(`Failed to hit ${url} with status code: ${res.statusCode}`);
          reject(new Error(`Status code: ${res.statusCode}`));
        }
      })
      .on("error", (err) => {
        console.error(`Error hitting ${url}:`, err.message);
        reject(err);
      });
  });
};

const job = new cron.CronJob("0 */10 * * * *", async function () {
  try {
    console.log("Executing scheduled task...");

    await Promise.all([callUrl(utilsUrl), callUrl(n8nUrl),callUrl(twitterScraperUrl)];

    console.log("Both URLs hit successfully.");
  } catch (error) {
    console.error("Error executing scheduled task:", error);
  }
});

// Export the cron job.
export { job };
