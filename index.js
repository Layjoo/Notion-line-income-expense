import * as dotenv from "dotenv";
dotenv.config();
import {
  addToList,
  addUserDocument,
  filterDataByDateAndUserId,
  verifyUser,
} from "./firestore-api.js";
import { todayAccoutingList } from "./message-object.js";

import line from "@line/bot-sdk";
import express from "express";
import moment from "moment";
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
app.get("/waking", async (req, res) => {
  const response = "Server has woken up...";
  console.log("Server has woken up...");
  res.send(response);
});

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
    case "postback":
      await postbackHandeler(event);
      break;
    default:
      console.log(`Unsupported event type: ${eventType}`);
  }
}

const postbackHandeler = async (event) => {
  const userId = event.source.userId;
  const isVerified = await verifyUser(userId);

  if (!isVerified) {
    //await sendMessages(event.replyToken, messages);
    return;
  }

  if(event.postback.data === "history_account") {
    const date = event.postback.params.date;
    const data = await filterDataByDateAndUserId(
      moment(date).format("DD/MM/YYYY"),
      userId
    );
    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
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

  if (isAccountingObject) {
    await addToList({ ...isAccountingObject, user_id: userId });

    const data = await filterDataByDateAndUserId(
      isAccountingObject.date,
      userId
    );
    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
    return;
  }

  if(message === "รายจ่ายวันนี้") {
    const data = await filterDataByDateAndUserId(
      moment().format("DD/MM/YYYY"),
      userId
    );
    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
  }

  if(message === "ดูประวัติรายจ่าย") {
    const messages = [{
      "type": "text",
      "text": "เลือกวันที่ต้องการดูประวัติ",
      "quickReply": {
        "items": [
          {
            "type": "action",
            "action": {
              "type": "datetimepicker",
              "label": "เลือกวันที่",
              "data": "history_account",
              "mode": "date",
              "initial": moment().format("YYYY-MM-DD"),
              "max": moment().format("YYYY-MM-DD"),
              "min": "2023-01-01"
            }
          }
        ]
      }
    }]

    await sendMessages(event.replyToken, messages);
  }

};

// Helper function

const sendMessages = async (replyToken, messages) => {
  const response = await client.replyMessage(replyToken, messages);
};

const parseAccoutingMessage = (message) => {
  // Split message text into lines
  const lines = message.split("\n");

  // Extract relevant information from lines
  const date =
    lines[0] && lines[0].startsWith("วันที่ ") ? lines[0].split(" ")[1] : null;
  const tag =
    lines[1] && lines[1].startsWith("รายการ ")
      ? lines[1].replace("รายการ ", "")
      : null;
  const detail =
    lines[2] && lines[2].startsWith("รายละเอียด ")
      ? lines[2].replace("รายละเอียด ", "")
      : null;
  const price =
    lines[3] && lines[3].startsWith("ราคา ")
      ? parseInt(lines[3].split(" ")[1])
      : null;
  const type = lines[4] && lines[4].startsWith("ประเภท ")
      ? lines[4].replace("ประเภท ", "") === "รายรับ" ? "income": "expense"
      : null;

  // Check if extracted information is valid
  if (!date || !detail || !tag || !price || !type) {
    console.log(`Normal text: ${message}`);
    return null;
  }

  // Create data object
  const data = {
    date: date,
    detail: detail,
    tag: tag,
    price: type === "expense" ? "-" + price.toString() : price.toString(),
    type: type
  };

  // Do something with the data object (e.g. store it in a database)
  return data;
};

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
