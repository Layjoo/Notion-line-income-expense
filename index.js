import * as dotenv from "dotenv";
dotenv.config();

import {
  currentMonthAccoutingList,
  todayAccoutingList,
} from "./message-object.js";
import line from "@line/bot-sdk";
import express from "express";
import moment from "moment";
const port = process.env.PORT || 3000;
const app = express();
import {
  addListToDB,
  deleteItemById,
  getAccoutingListByDateAndUserId,
  getAccoutingListCurrentMonth,
} from "./supabase-api.js";

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
  const postbackData = JSON.parse(event.postback.data);

  //this will catch the data from datepicker when user type "ดูประวัติรายจ่าย"
  if (postbackData.postback_type === "history_account") {
    const date = event.postback.params.date;
    const data = await getAccoutingListByDateAndUserId(
      moment(date).format("YYYY-MM-DD"),
      userId
    );
    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
  }

  //delete item
  if (postbackData.postback_type === "delete_item") {
    const idToDelete = parseInt(postbackData.delete_item_id);
    const dateOfItem = postbackData.date;

    //delete item from database
    const { error } = await deleteItemById(idToDelete);

    if (error) {
      const messages = { type: "text", text: "ลบรายการไม่สำเร็จ" };
      return await sendMessages(event.replyToken, messages);
    }

    //if item is deleted, send new list to user
    const data = await getAccoutingListByDateAndUserId(
      moment(dateOfItem).format("YYYY-MM-DD"),
      userId
    );
    const messages = [todayAccoutingList(data)];
    await sendMessages(event.replyToken, messages);
  }
  
};

const followHandeler = async (event) => {
  const userId = event.source.userId;
  console.log("New user followed: " + userId);
  return;
};

const messageHandeler = async (event) => {
  const userId = event.source.userId;
  const message = event.message.text;

  //check if message is accounting message ex. จ่ายเงินค่าอาหาร 100 บาท
  const isAccountingObject = parseAccoutingMessage(message);
  if (isAccountingObject) {
    await addListToDB({ ...isAccountingObject, user_id: userId });

    const data = await getAccoutingListByDateAndUserId(
      isAccountingObject.date,
      userId
    );

    console.log(data);

    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
  }

  //other type of message
  if (message === "สรุปรายจ่ายเดือนนี้") {
    const data = await getAccoutingListCurrentMonth(userId);
    const messages = [currentMonthAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
  }

  if (message === "รายจ่ายวันนี้") {
    const data = await getAccoutingListByDateAndUserId(
      moment().format("YYYY-MM-DD"),
      userId
    );
    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
  }

  if (message === "ดูประวัติรายจ่าย") {
    const messages = [
      {
        type: "text",
        text: "เลือกวันที่ต้องการดูประวัติ",
        quickReply: {
          items: [
            {
              type: "action",
              action: {
                type: "datetimepicker",
                label: "เลือกวันที่",
                data: `{"postback_type": "history_account"}`,
                mode: "date",
                initial: moment().format("YYYY-MM-DD"),
                max: moment().format("YYYY-MM-DD"),
                min: "2023-01-01",
              },
            },
          ],
        },
      },
    ];

    await sendMessages(event.replyToken, messages);
  }

  if (message === "วิธีเพิ่มรายการใหม่") {
    const messages = [
      {
        type: "text",
        text: "ตัวอย่างสร้างรายจ่าย พิมพ์ว่า จ่ายเงินค่า(อะไร) (ราคา) บาท" + "\n" + "เช่น จ่ายเงินค่าอาหาร 100 บาท"
      },
      {
        type: "text",
        text: "ตัวอย่างสร้างรายรับ พิมพ์ว่า ได้เงินค่า(อะไร) (ราคา) บาท" + "\n" + "เช่น ได้เงินค่าขายของ 200 บาท"
      }
      ]

    await sendMessages(event.replyToken, messages);
  }
};

// Helper function
const sendMessages = async (replyToken, messages) => {
  const response = await client.replyMessage(replyToken, messages);
};

const parseAccoutingMessage = (message) => {
  console.log(message);
  // Split message text into lines
  const keywords = ["จ่ายเงินค่า", "ได้เงินค่า"];
  const detailRegex = /(?<=จ่ายเงินค่า|ได้เงินค่า).*?(?=\s)/;
  const priceRegex = /\d+(?=\sบาท)/;

  let accountingData;
  keywords.forEach((keyword) => {
    if (message.includes(keyword) && message.includes("บาท")) {
      const type = keyword === "จ่ายเงินค่า" ? "expense" : "income";
      const detail = detailRegex.exec(message)[0] || "";
      const price = parseInt(message.match(priceRegex)[0] || 0);
      const tag = "others";
      const date = moment().format("YYYY-MM-DD");

      accountingData = { date, detail, tag, price, type };
    }
  });

  return accountingData;
};

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
