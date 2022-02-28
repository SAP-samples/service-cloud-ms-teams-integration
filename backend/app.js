const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.options("*", cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend API for MS Bot on POST /api/messages/");
});

/**-------------------------------------------------MS Bot------------------------------------------------------------------------------- */
// Read botFilePath and botFileSecret from .env file.
const path = require("path");
const ENV_FILE = path.join(__dirname, ".env");
require("dotenv").config({ path: ENV_FILE });

// MS Bot dependencies
const { BotFrameworkAdapter, UserState, MemoryStorage } = require("botbuilder");
const { TeamsChatExportBot } = require("./bots/chat-export/teamsChatExportBot");

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights. See https://aka.ms/bottelemetry for telemetry
  //       configuration instructions.
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  console.log("Error is", JSON.stringify(error));

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  if (error.code === "BadRequest") {
    await context.sendActivity(
      "Export Chat can be used to export messages from a one-on-one chat [excluding chat with a bot] or a group chat."
    );
    await context.sendActivity(
      "Please try exporting your messages again or cotact your administrator."
    );
  } else {
    // Send a message to the user
    await context.sendActivity(
      "Messaging extension encountered an error or bug."
    );
    await context.sendActivity(
      "To continue to run this messaging extension, please contact your administrator."
    );
  }
};

// Create the bot that will handle incoming messages.
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);
const bot = new TeamsChatExportBot(userState);

// Listen for incoming requests.
app.post("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
  });
});

/**------------------------------------------------------------------------------------------------------------------------------------------ */

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
