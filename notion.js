require("dotenv").config();
const axios = require("axios");
const notionToken = process.env.NOTION_TOKEN;
const database = process.env.NOTION_DATABASE;
const dateNow = new Date(Date.now())
let date = dateNow.getDate();
const dayjs = require('dayjs');
const today = dayjs().format("YYYY-MM-DD").toString();

const addItem = async ({detail, income_expense, list, type, date}) => {
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

const updateItem = async ({pageId, detail, income_expense, list, type, date}) => {

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

    const totalExpense = data.results
    .filter(list=>list.properties["ชนิด"].select.name == "Expense")
    .map(item => item.properties["รับ-จ่าย"].number)
    .reduce((pre, next) => pre+next, 0)

    text = text + "รวม " + totalExpense.toString().replace("-","") + " บาท";
    return text
}

module.exports = {
    getAllTag,
    getAllItems,
    addItem,
    updateItem,
    getTodayItems,
    extractNetvaule,
    todayExpense,
};