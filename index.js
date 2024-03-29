import * as dotenv from "dotenv";
dotenv.config();
import moment from "moment-timezone";

import {
  createTagBubble,
  currentMonthAccoutingList,
  currentMonthTag,
  tagAccountingList,
  todayAccoutingList,
} from "./message-object.js";
import line from "@line/bot-sdk";
import express from "express";
const port = process.env.PORT || 3000;
const app = express();
import {
  addListToDB,
  addUserToDB,
  deleteItemById,
  getAccoutingListByDateAndUserId,
  getAccoutingListByTag,
  getAccoutingListCurrentMonth,
  getCurrentMonthTagsSummary,
  getSettingTags,
  serchUserById,
  updateItemById,
  updateSettingTags,
} from "./notion-api.js";

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
  console.log(` ------------ New event ------------ \n`);
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

//event type handelers
const postbackHandeler = async (event) => {
  const userId = event.source.userId;
  const postbackData = JSON.parse(event.postback.data);

  //this will catch the data from datepicker when user type "ดูประวัติรายจ่าย"
  if (postbackData.postback_type === "history_account") {
    const date = event.postback.params?.date || postbackData.date;
    const data = await getAccoutingListByDateAndUserId(
      moment(date).format("YYYY-MM-DD"),
      userId
    );
    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
  }

  //delete item
  if (postbackData.postback_type === "delete_item") {
    const idToDelete = postbackData.delete_item_id;
    const dateOfItem = postbackData.date;
    const redirect = postbackData.redirect;

    //delete item from database
    const { error } = await deleteItemById(idToDelete);

    if (error) {
      const messages = { type: "text", text: "ลบรายการไม่สำเร็จ" };
      return await sendMessages(event.replyToken, messages);
    }

    //if item is deleted, send redirect or accounting list to user
    if (redirect === "history_tag") {
      const tag = postbackData.tag;
      const month = postbackData.month;
      const { data, error } = await getAccoutingListByTag(tag, userId);

      if (error) {
        return console.error("Error fetching data:", error.message);
      }

      const messages = tagAccountingList(data, tag, month);
      return await sendMessages(event.replyToken, messages);
    }

    const data = await getAccoutingListByDateAndUserId(
      moment(dateOfItem).format("YYYY-MM-DD"),
      userId
    );
    const messages = [todayAccoutingList(data)];
    return await sendMessages(event.replyToken, messages);
  }

  //user require tag
  if (postbackData.postback_type === "require_tag") {
    const { data: allTags, error } = await getSettingTags(userId);

    if (error) {
      console.error("Error fetching data:", error.message);
    }

    //if no tag found, then show placeholder tag first
    const messages = [
      createTagBubble(
        postbackData.item,
        allTags
          ? allTags
          : [
              "เครื่องดื่ม",
              "อาหาร",
              "เดินทาง",
              "ขนม",
              "ของใช้",
              "ค่าห้อง",
              "น้ำ-ไฟ",
              "ซักผ้า",
              "เสื้อผ้า",
              "หนังสือ",
              "เคสโฮม",
              "เงินเดือน",
              "โอที",
              "อื่นๆ",
            ]
      ),
    ];

    await sendMessages(event.replyToken, messages);
  }

  //edit tag
  if (postbackData.postback_type === "edit_tag") {
    const tag = postbackData.tag;
    const item_id = postbackData.item_id;
    const dateOfItem = postbackData.date;

    const { error } = await updateItemById(item_id, { tag: tag });

    if (error) {
      const messages = { type: "text", text: "เปลี่ยนหมวดหมู่ไม่สำเร็จ" };
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

  //tag history
  if (postbackData.postback_type === "history_tag") {
    const tag = postbackData.tag;
    const month = postbackData.month;
    const { data, error } = await getAccoutingListByTag(tag, userId);

    if (error) {
      return console.error("Error fetching data:", error.message);
    }

    const messages = tagAccountingList(data, tag, month);
    return await sendMessages(event.replyToken, messages);
  }
};

const followHandeler = async (event) => {
  const userId = event.source.userId;
  console.log("New user followed: " + userId);

  //check if user is already in database
  const { data: user, error } = await serchUserById(userId);
  if (error) {
    console.error("Error fetching data:", error.message);

    const messages = [
      {
        type: "text",
        text: "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้ใหม่",
      },
    ];

    return await sendMessages(event.replyToken, messages);
  }

  if (!user) {
    //add new user to database if not exist
    const { error } = await addUserToDB(userId);
    if (error) {
      console.error("Error fetching data:", error.message);

      const messages = [
        {
          type: "text",
          text: "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้ใหม่",
        },
      ];

      return await sendMessages(event.replyToken, messages);
    }
  }

  //send welcome message
  const data = await getAccoutingListByDateAndUserId(
    getDatefromTimestamp(event.timestamp),
    userId
  );

  return await sendMessages(event.replyToken, [
    { type: "text", text: "ยินดีต้อนรับเข้าสู่บอทบันทึกรายรับรายจ่าย" },
    todayAccoutingList(data),
  ]);
};

const messageHandeler = async (event) => {
  const userId = event.source.userId;
  const message = event.message.text;

  //check if message is accounting message ex. จ่ายเงินค่าอาหาร 100 บาท
  const isAccountingObject = parseAccoutingMessage(message);
  const countingMessage = {
    ...isAccountingObject,
    user_id: userId,
    date: getDatefromTimestamp(event.timestamp),
  };
  if (isAccountingObject) {
    await addListToDB(countingMessage);

    const data = await getAccoutingListByDateAndUserId(
      countingMessage.date,
      userId
    );

    const messages = [todayAccoutingList(data)];

    await sendMessages(event.replyToken, messages);
  }

  //check if message is add new tag message ex. เพิ่ม tag อื่นๆ
  const tag = parseAddNewTagMessage(message);
  if (tag) {
    if (tag.type === "add_tag") {
      const { error } = await updateSettingTags(userId, tag.tag, "add");

      if (error) console.error("Error fetching data:", error.message);

      const messages = [
        {
          type: "text",
          text: error
            ? `เพิ่มหมวดหมู่ไม่สำเร็จ`
            : `เพิ่มหมวดหมู่ ${tag.tag} สำเร็จ`,
        },
      ];

      await sendMessages(event.replyToken, messages);
    }

    if (tag.type === "delete_tag") {
      const { error } = await updateSettingTags(userId, tag.tag, "delete");

      if (error) console.error("Error fetching data:", error.message);

      const messages = [
        {
          type: "text",
          text: error ? `ลบหมวดหมู่ไม่สำเร็จ` : `ลบหมวดหมู่ ${tag.tag} สำเร็จ`,
        },
      ];

      await sendMessages(event.replyToken, messages);
    }
  }

  //other type of message
  if (message === "สรุปรายจ่ายเดือนนี้") {
    const data = await getAccoutingListCurrentMonth(userId);
    const messages = currentMonthAccoutingList(data);

    await sendMessages(event.replyToken, messages);
  }

  if (message === "รายจ่ายวันนี้") {
    const data = await getAccoutingListByDateAndUserId(
      getDatefromTimestamp(event.timestamp),
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
                initial: getDatefromTimestamp(event.timestamp),
                max: getDatefromTimestamp(event.timestamp),
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
        text:
          "สร้างรายจ่าย พิมพ์ว่า" +
          "\n" +
          '"จ่ายเงินค่า(อะไร) (ราคา) บาท"' +
          "\n" +
          "ตัวอย่าง" +
          "\n" +
          '"จ่ายเงินค่าอาหาร 100 บาท"',
      },
      {
        type: "text",
        text:
          "สร้างรายรับ พิมพ์ว่า" +
          "\n" +
          '"ได้เงินค่า(อะไร) (ราคา) บาท"' +
          "\n" +
          "ตัวอย่าง" +
          "\n" +
          '"ได้เงินค่าขายของ 200 บาท"',
      },
      {
        type: "text",
        text: "รายการจะถูกบันทึกเป็นของวันที่ส่งข้อความเท่านั้น",
      },
    ];

    await sendMessages(event.replyToken, messages);
  }

  if (message === "สรุปหมวดหมู่เดือนนี้") {
    const data = await getCurrentMonthTagsSummary(userId);

    const messages = [currentMonthTag(data)];

    await sendMessages(event.replyToken, messages);
  }
};

// Helper function
const sendMessages = async (replyToken, messages) => {
  const response = await client.replyMessage(replyToken, messages);
};

const parseAccoutingMessage = (message) => {
  // Regular expression to match the new pattern
  const newPatternRegex = /^(-?\d+)\s(.*?)(?=\s|$)/;
  const keywords = ["จ่ายเงินค่า", "ได้เงินค่า"];
  const detailRegex = /(?<=จ่ายเงินค่า|ได้เงินค่า).*?(?=\s)/;
  const priceRegex = /-?\d+(?=\sบาท)/;

  let accountingData;

  // Check for the new pattern
  const newPatternMatch = message.match(newPatternRegex);
  if (newPatternMatch) {
    const actualPrice = parseInt(newPatternMatch[1]);
    const price = actualPrice > 0 ? actualPrice : actualPrice * -1;
    const detail = newPatternMatch[2];
    const tag = "อื่นๆ";
    const type = actualPrice < 0 ? "expense" : "income";

    accountingData = { detail, tag, price, type };
  } else {
    // Check for keywords
    keywords.forEach((keyword) => {
      if (message.includes(keyword) && message.includes("บาท")) {
        const type = keyword === "จ่ายเงินค่า" ? "expense" : "income";
        const detail = detailRegex.exec(message)[0] || "";
        const price = parseInt(message.match(priceRegex)[0] || 0);
        const tag = "อื่นๆ";

        accountingData = { detail, tag, price, type };
      }
    });
  }

  return accountingData;
};

const parseAddNewTagMessage = (message) => {
  const keywords = ["เพิ่ม tag", "ลบ tag"];

  let tagData;
  keywords.forEach((keyword) => {
    if (message.includes(keyword)) {
      const messageWithOutSpace = message.replace(/ /g, "");
      const tagRegex = /(?<=เพิ่มtag|ลบtag).*/;
      const tag = tagRegex.exec(messageWithOutSpace)[0] || "";

      if (message.includes("เพิ่ม tag")) {
        tagData = { tag: tag, type: "add_tag" };
      }

      if (message.includes("ลบ tag")) {
        tagData = { tag: tag, type: "delete_tag" };
      }
    }
  });

  return tagData;
};

const getDatefromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
