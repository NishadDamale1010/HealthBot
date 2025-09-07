// index.js
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// ✅ Webhook endpoint for Dialogflow
app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const params = req.body.queryResult.parameters;

  let responseText = "Sorry, I could not find the info right now.";

  try {
    switch (intent) {
      // 🎯 1. Disease Symptoms
      case "disease_symptoms":
        const disease = params.disease || "general";
        // Example: Fetch from WHO API / static dataset
        responseText = `Symptoms of ${disease}: fever, cough, fatigue. (Always confirm with doctor.)`;
        break;

      // 🎯 2. Vaccination Schedule
      case "vaccination_schedule":
        const age = params.age?.amount || "unknown";
        // Example from CoWIN (you can refine age groups mapping)
        responseText = `For age ${age} years, vaccination includes Polio, Hepatitis B, and other govt. recommended vaccines.`;
        break;

      // 🎯 3. Outbreak Alerts
      case "outbreak_alerts":
        // Example: dummy API call (replace with data.gov.in / WHO outbreak feed)
        const outbreakData = await axios.get("https://disease.sh/v3/covid-19/countries/india");
        responseText = `Latest outbreak: COVID-19 cases today in India = ${outbreakData.data.todayCases}`;
        break;

      // 🎯 4. Health Tips
      case "health_tips":
        responseText = "💡 Health Tip: Drink clean water, eat fresh fruits, and exercise 30 minutes daily!";
        break;

      // 🎯 5. Greeting
      case "greeting":
        responseText = "Hello! 👩‍⚕️ I am your health assistant. How can I help you today?";
        break;
    }
  } catch (error) {
    console.error("API Error:", error.message);
    responseText = "⚠️ Sorry, I had trouble fetching live health data.";
  }

  // Send response back to Dialogflow
  res.json({
    fulfillmentText: responseText,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Webhook server running on port ${PORT}`));
