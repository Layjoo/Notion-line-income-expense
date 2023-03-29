import * as dotenv from 'dotenv'
dotenv.config()
import { addToList, addUserDocument, filterDataByDateAndUserId, verifyUser } from "./firestore-api.js";
import { todayAccoutingList } from "./message-object.js";
import moment from "moment";


import line from "@line/bot-sdk";
import express from 'express'
const port = process.env.PORT || 3000;

const app = express();

//setting config for line client
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

//web hook, get event when user do somthing with bot
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

//waking server
app.get('/waking', async (req, res) => {
  const response = "Server has woken up...";
  console.log("Server has woken up...")
  res.send(response);
})

//event handler if user interaction with bot
async function handleEvent(event) {
  const eventType = event.type;
  console.log(event);

  switch (eventType) {
    case "follow":
      await followHandeler(event);
      break;
    case "message":
      await messageHandeler(event);
      break;
    default:
      console.log(`Unsupported event type: ${eventType}`);
  }
}

const followHandeler = async (event) => {
  const userId = event.source.userId;
  const isVerified = await verifyUser(userId);

  if (!isVerified) {
    await addUserDocument(userId);
    return;
  }

  console.log("You have already verified");
  return;
};

const messageHandeler = async (event) => {
  const userId = event.source.userId;
  const message = event.message.text;
  const isVerified = await verifyUser(userId);

  if (!isVerified) {
    //await sendMessages(event.replyToken, messages);
    return;
  }

  const isAccountingObject = parseAccoutingMessage(message);

  if(isAccountingObject) {
    await addToList({...isAccountingObject, user_id: userId})

    const data = await filterDataByDateAndUserId(isAccountingObject.date, userId);
    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
    return;
  }
};

// Helper function

const sendMessages = async (replyToken, messages) => {

  const response = await client.replyMessage(
    replyToken,
    messages
  );
};

const parseAccoutingMessage = (message) => {
  // Split message text into lines
  const lines = message.split("\n");

  // Extract relevant information from lines
  const date =
    lines[0] && lines[0].startsWith("วันที่ ") ? lines[0].split(" ")[1] : null;
  const tag =
    lines[1] && lines[1].startsWith("รายการ ")
      ? lines[1].split(" ")[1]
      : null;
  const detail =
    lines[2] && lines[2].startsWith("รายละเอียด ") ? lines[2].split(" ")[1] : null;
  const price =
    lines[3] && lines[3].startsWith("ราคา ")
      ? parseInt(lines[3].split(" ")[1])
      : null;

  // Check if extracted information is valid
  if (!date || !detail || !tag || !price) {
    console.log(`Normal text: ${message}`);
    return null;
  }

  // Create data object
  const data = {
    date: date,
    detail: detail,
    tag: tag,
    price: price.toString(),
  };

  // Do something with the data object (e.g. store it in a database)
  return data;
};

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})