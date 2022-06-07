require("dotenv").config();
const {
  sendSelectTags,
  message
} = require("./line-object");
const {
  getAllTag,
  getAllItems,
  addItem,
  updateItem,
  getTodayItems,
  extractNetvaule,
  todayExpense,
} = require("./notion")
const line = require("@line/bot-sdk");
const app = require('express')();
const port = process.env.PORT || 3000;

//time setting
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)
const today = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD").toString();

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
  if (event.type == 'message') {
    //add new income/expense ex. "-200 ค่าข้าว"
    if (/[\+\-]/.test(event.message.text)) {
      console.log("Message >>> add new item");
      const price = event.message.text.match(/^-\d+|(?<=^\+)\d+/);
      const detail = event.message.text.match(/(?<=\d\s).*/);

      //add new item
      const addItemConfig = {
        detail: detail == null ? undefined : detail[0],
        income_expense: price == null ? undefined : parseInt(price[0]),
        date: today
      }

      //push item into database and keep tract item
      const add = await addItem(addItemConfig);
      const itemId = add.data.id.replace(/-/g, "");

      //get all list from database
      let tags = await getAllTag();

      //send richtext menu to select tag
      const response = await client.replyMessage(
        event.replyToken,
        sendSelectTags(itemId, tags, detail == null ? false : true)
      );
    } else if (event.message.text == "รายจ่ายวันนี้") {
      console.log("Message >>> รายจ่ายวันนี้");
      const todayList = await getTodayItems();
      const response = await client.replyMessage(
        event.replyToken,
        message(todayExpense(todayList))
      );
      console.log("Log >>> send message success")
    } else if (event.message.text == "เงินที่ใช้ได้") {
      console.log("Message >>> เงินที่ใช้ได้");

      const items = await getAllItems();
      const netAsset = items
        .map(item => item.properties["รับ-จ่าย"].number)
        .reduce((pre, next) => pre + next, 0);

      const daysInMonth = dayjs(today).daysInMonth();
      const date = dayjs().get('date');

      const response = await client.replyMessage(
        event.replyToken,
        message(`เงินที่เหลือเดือนนี้ ${netAsset}\nใช้ได้อีก ${daysInMonth-date} วัน\nเฉลี่ยใช้ได้ ${Math.floor(netAsset/(daysInMonth-date))} บาท/วัน`)
      );
      console.log("Log >>> send message success")
    } else {
      console.log("Log >>> Not match message")
    }
  } else if (event.type == 'postback') {
    //collecting data
    const data = JSON.parse(event.postback.data)
    const {input, pageId:itemId} = data;
    console.log("Post back >>> " + input)

    //property to update
    const update_config = {
      pageId: itemId
    }

    //capture input type
    switch (input) {
      case "add_list":
        update_config.list = data.list;
        if(!data.has_detail) update_config.detail = data.list;
        //update list
        await updateItem(update_config);
        console.log("Log >>> add list successs")

        //get today items
        const todayItems = await getTodayItems();
        const incomeExpenseList = extractNetvaule(todayItems)

        //calculate net
        const todayNet = incomeExpenseList.reduce((sum, pre) => sum + pre, 0);
        console.log(`Log >>> รวมรายรับรายจ่ายวันนี้ = ${todayNet}`)

        //send net asset
        await client.replyMessage(
          event.replyToken,
          message(`รวมรายรับรายจ่ายวันนี้\n ${todayNet.toString()} บาท`)
        );

        break;
      default:
        break;
    }
  }

  return event;
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})