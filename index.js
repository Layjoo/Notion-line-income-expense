require("dotenv").config();
const {sendSelectList, sendSelectWallet, message} = require("./line-object");
const {getAllTag, getAllItems, addItem, updateItem, getTodayItems, extractNetvaule, todayExpense} = require("./notion")
const line = require("@line/bot-sdk");
const app = require('express')();
const port = process.env.PORT || 3000;
const dateNow = new Date(Date.now())
let date = dateNow.getDate();

//insert 0 infront of date which lesser than
if(date < 10){ date = "0" + date}

let today = dateNow.toISOString().slice(0, 8);
today = today.concat(date)

//setting config for line client
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

app.get('/net_today', async (req, res) => {
  res.send(response);
})

//web hook, get event when user do somthing with bot
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

//event handler if user interaction with bot
async function handleEvent(event) {
  //event.type
  console.log(event)

  if(event.type == 'message'){
    if(/[\+\-]/.test(event.message.text)){
      console.log("add");
      const price = event.message.text.match(/^-\d+|(?<=^\+)\d+/);
      const detail = event.message.text.match(/(?<=\d\s).*/);

      console.log(price == null ? undefined: price[0])
      console.log(detail == null ? undefined: detail[0])

      //add new item
      const addItemConfig = {
        detail: detail == null ? undefined: detail[0],
        income_expense: price == null ? undefined: parseInt(price[0]),
        date: today
      }
    
      const add = await addItem(addItemConfig);
      const itemId = add.data.id.replace(/-/g,"");

      //get all list from database
      let tags = await getAllTag();

      //send richtext menu to select list
      const response = await client.replyMessage(
        event.replyToken,
        sendSelectList(itemId, tags)
      );
    }else if(event.message.text == "รายจ่ายวันนี้"){
      console.log("รายจ่ายวันนี้");
      const todayList = await getTodayItems();
      const response = await client.replyMessage(
        event.replyToken,
        message(todayExpense(todayList))
      );
    }else if(event.message.text == "เงินที่ใช้ได้"){
      console.log("เงินที่ใช้ได้");

      const items = await getAllItems();
      const netAsset = items
      .map(item => item.properties["รับ-จ่าย"].number)
      .reduce((pre, next)=> pre+next,0);

      const response = await client.replyMessage(
        event.replyToken,
        message(`เงินที่ใช้ได้ในเดือนนี้ ${netAsset}`)
      );
    }else{
      console.log("Not match message")
    }
  }else if(event.type == 'postback'){
    
    console.log(event)
    
    //collecting data
    const data = JSON.parse(event.postback.data)
    const input = data.input;
    const itemId = data.pageId;
    console.log(input)
    
    //property to update
    const update_config = {
      pageId: itemId
    }

    //capture input type
    switch (input) {
      case "add_list":
        update_config.list = data.list;
        console.log("add list")
        //update list
        await updateItem(update_config);

        //send select wallet
        await client.replyMessage(
          event.replyToken,
          sendSelectWallet(itemId)
        );
        break;
      case "add_wallet":
        if(data.wallet !== "กระเป๋าหลัก"){
        update_config.wallet = data.wallet;
        console.log("add wallet")
        //update wallet
        await updateItem(update_config)
        }

        //get today items
        const todayItems = await getTodayItems();
        const incomeExpenseList = extractNetvaule(todayItems)
        console.log(incomeExpenseList)

        //calculate net
        const todayNet = incomeExpenseList.reduce((sum, pre) => sum + pre, 0);
        console.log(`รวมรายรับรายจ่ายวันนี้ = ${todayNet}`)

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