require("dotenv").config();
const axios = require("axios");
const notionToken = process.env.NOTION_TOKEN;
const database = process.env.NOTION_DATABASE;
const dateNow = new Date(Date.now())
let date = dateNow.getDate();

//insert 0 infront of date which lesser than
if(date < 10){ date = "0" + date}

let today = dateNow.toISOString().slice(0, 8);
today = today.concat(date)

const addItem = async ({detail, income_expense, list, wallet, type, date}) => {
    const config = {
        method: "post",
        url: "https://api.notion.com/v1/pages",
        headers: {
            Authorization: `Bearer ${notionToken}`,
            "Notion-Version": "2021-08-16",
        }
    }

    //check if number is positive integer then type equal to income
    if(income_expense >= 0){
        type = "Income"
    }else{
        type = "Expense"
    }

    //set which property to update
    config.data = {
        "parent": {"database_id": `${database}`},
        "properties": {
            "Detail": detail && {
                "title": [
                    {
                        "text": {
                            "content": `${detail}`
                        }
                    }
                ]
            },
            "รับ-จ่าย": income_expense && {
                  "number": income_expense
                },
            "รายการ": list && {
                "select": {
                    "name": `${list}`
                }
            },
            "Wallet": wallet && {
                "select": {
                    "name": `${wallet}`
                }
            },
            "ชนิด": type && {
                "select": {
                    "name": `${type}`
                }
            },
            "Date": date && {
                "date": {
                    "start": `${date}`,
                }
            }
        }
    }

    const res = await axios(config);
    return res
}

const updateItem = async ({pageId, detail, income_expense, list, wallet, type, date}) => {

    const config = {
        method: "patch",
        url: `https://api.notion.com/v1/pages/${pageId}`,
        headers: {
            Authorization: `Bearer ${notionToken}`,
            "Notion-Version": "2021-08-16",
            "Content-type": "application/json",
        },
        data: JSON.stringify({
            "properties": {
                "Detail": detail && {
                    "title": [
                        {
                            "text": {
                                "content": `${detail}`
                            }
                        }
                    ]
                },
                "รับ-จ่าย": income_expense && {
                      "number": income_expense
                    },
                "รายการ": list && {
                    "select": {
                        "name": `${list}`
                    }
                },
                "Wallet": wallet && {
                    "select": {
                        "name": `${wallet}`
                    }
                },
                "ชนิด": type && {
                    "select": {
                        "name": `${type}`
                    }
                },
                "Date": date && {
                    "date": {
                        "start": `${date}`,
                    }
                }
            }
        }),
    };

    const res = await axios(config);
    return res;
};

const getAllTag = async () => {
    const config = {
        method: "get",
        url: `https://api.notion.com/v1/databases/${database}`,
        headers: {
            Authorization: `Bearer ${notionToken}`,
            "Notion-Version": "2021-08-16",
        },
    };
    const res = await axios(config);
    const tags = res.data
    .properties["รายการ"]
    .select.options
    .map(tags => tags.name);
    return tags;
}

const getAllItems = async () => {
    const config = {
        method: "post",
        url: `https://api.notion.com/v1/databases/${database}/query`,
        headers: {
            Authorization: `Bearer ${notionToken}`,
            "Notion-Version": "2021-08-16",
            "Content-type": "application/json",
        }
    };

    const res = await axios(config);
    const data = res.data;

    return data.results
}

const getTodayItems = async () => {
    const config = {
        method: "post",
        url: `https://api.notion.com/v1/databases/${database}/query`,
        headers: {
            Authorization: `Bearer ${notionToken}`,
            "Notion-Version": "2021-08-16",
            "Content-type": "application/json",
        },
        data: JSON.stringify({
            filter: {
                and: [{
                    property: "Date",
                    date: {
                        equals: today,
                    },
                }, ],
            }
        }),
    };

    const res = await axios(config);
    const data = res.data;

    return data
}

const extractNetvaule = (data) => {
    return data.results.filter((list)=> typeof list.properties["รับ-จ่าย"].number == "number")
    .map(list=> list.properties["รับ-จ่าย"].number)
}

const todayExpense = (data) => {
    let text = `รายจ่ายวันที่ ${today}\n`

    data.results.filter(list=>list.properties["ชนิด"].select.name == "Expense")
    .forEach(item => {
        const detail = item.properties.Detail.title[0].plain_text || "";
        const expense = item.properties["รับ-จ่าย"].number == null ? "" :
        ` ราคา ${item.properties["รับ-จ่าย"].number.toString().replace("-", "")}`;

        text = text + "- "
        + detail
        + expense
        + "\n"
    })

    const totalExpenseNotExcess = data.results
    .filter(list=>list.properties["ชนิด"].select.name == "Expense" && list.properties["Wallet"].select == null)
    .map(item => item.properties["รับ-จ่าย"].number)
    .reduce((pre, next) => pre+next, 0)

    const totalExpenseExcess = data.results
    .filter(list=>list.properties["Wallet"].select !== null)
    .map(item => item.properties["รับ-จ่าย"].number)
    .reduce((pre, next) => pre+next, 0)

    const totalExpense = totalExpenseExcess + totalExpenseNotExcess;

    text = text + "รายจ่ายหลัก " + totalExpenseNotExcess.toString().replace("-","") + " บาท" + "\n";

    text = text + "ส่วนเกิน " + totalExpenseExcess.toString().replace("-","") + " บาท" + "\n";

    text = text + "รวม " + totalExpense.toString().replace("-", "") + " บาท";

    return text
}

const excessExpense = async() => {
    const config = {
        method: "post",
        url: `https://api.notion.com/v1/databases/${database}/query`,
        headers: {
            Authorization: `Bearer ${notionToken}`,
            "Notion-Version": "2021-08-16",
            "Content-type": "application/json",
        },
        data: JSON.stringify({
            filter: {
                and: [{
                    property: "Wallet",
                    select: {
                        equals: "ส่วนเกิน",
                    },
                }, ],
            }
        }),
    };

    const res = await axios(config);
    const data = res.data;

    let text = `ส่วนเกินเดือนนี้\n`

    data.results.filter(list=>list.properties["ชนิด"].select.name == "Expense")
    .forEach(item => {
        const detail = item.properties.Detail.title[0].plain_text || "";
        const expense = item.properties["รับ-จ่าย"].number == null ? "" :
        ` ราคา ${item.properties["รับ-จ่าย"].number.toString().replace("-", "")}`;

        text = text + "- "
        + detail
        + expense
        + "\n"
    })

    const totalExpense = data.results
    .filter(list=>list.properties["ชนิด"].select.name == "Expense")
    .map(item => item.properties["รับ-จ่าย"].number)
    .reduce((pre, next) => pre+next, 0)


    text = text + "รวม " + totalExpense.toString().replace("-","") + " บาท";

    return text
}

// test
// (async () => {
//     const res = await getAllItems();
//     console.log(res.filter(item=>item.properties.Wallet.select == null).map(item=> item.properties.Wallet))
// })();

module.exports = {
    getAllTag,
    getAllItems,
    addItem,
    updateItem,
    getTodayItems,
    extractNetvaule,
    todayExpense,
    excessExpense
};