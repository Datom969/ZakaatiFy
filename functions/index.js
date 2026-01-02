/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
//setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Load environment variables from .env
require("dotenv").config(); // Load .env variables
const functions = require("firebase-functions");
const fetch = require("node-fetch"); // npm install node-fetch

exports.getNisab = functions.https.onRequest(async (req, res) => {
  const METALS_API_URL = "https://api.metals.dev/v1/latest";
  const FOREX_API_URL = "https://open.er-api.com/v6/latest/USD";
  const API_KEY = process.env.GOLDAPI_KEY; // from .env

  if (!API_KEY) {
    return res.status(500).json({ error: "Metals API key not set in .env" });
  }

  try {
    // Fetch latest gold & silver prices in USD per troy ounce
    const metalsResponse = await fetch(`${METALS_API_URL}?api_key=${API_KEY}&currency=USD&unit=toz`);
    if (!metalsResponse.ok) throw new Error(`Metals API failed: ${metalsResponse.statusText}`);
    const metalsData = await metalsResponse.json();

    const goldRateUSD = metalsData.gold.value;
    const silverRateUSD = metalsData.silver.value;

    // Fetch live USD → NGN rate
    const forexResponse = await fetch(FOREX_API_URL);
    if (!forexResponse.ok) throw new Error(`Forex API failed: ${forexResponse.statusText}`);
    const forexData = await forexResponse.json();

    const usdToNgn = forexData.rates?.NGN;
    if (!usdToNgn) throw new Error("NGN rate missing from Forex API");

    // Convert to Naira
    const goldRateNGN = goldRateUSD * usdToNgn;
    const silverRateNGN = silverRateUSD * usdToNgn;

    // Send response
    res.json({
      goldNisab: Math.round(goldRateNGN),
      silverNisab: Math.round(silverRateNGN),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Nisab" });
  }
});
