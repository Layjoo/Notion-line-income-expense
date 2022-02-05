require("dotenv").config();
const axios = require("axios");
const notionToken = process.env.NOTION_TOKEN;
const database = process.env.DATABASE;
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

const getTodayLists = async () => {
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

    return data.results.filter((list)=> typeof list.properties["รับ-จ่าย"].number == "number")
    .map(list=> list.properties["รับ-จ่าย"].number)
}

//test
// (async () => {
//     const res = await getTodayLists();
//     console.log(today)
//     console.log(res)
// })();

module.exports = {
    getAllTag,
    addItem,
    updateItem,
    getTodayLists
};