import { config } from "dotenv";
import moment from "moment";
config();

const notionApiKey = process.env.NOTION_API_KEY;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;

import { Client } from "@notionhq/client";
import { fetchSupabaseData } from "./supabase-api.js";

const notion = new Client({
  auth: notionApiKey,
});

export const getAccoutingListByDateAndUserId = async (date, userId) => {
  try {
    let moneyList = [];
    let nextCursor = null;

    do {
      // initialize the query with the filter
      const queryOptions = {
        database_id: notionDatabaseId,
        filter: {
          and: [
            { property: "date", date: { equals: date } },
            { property: "user_id", rich_text: { contains: userId } },
          ],
        },
        cursor: nextCursor,
      };

      // query the Notion database
      const response = await notion.databases.query(queryOptions);

      // extract data from the current page and append it to moneyList
      const currentPageMoneyList = response.results.map((entry) => ({
        date: entry.properties["date"].date.start,
        user_id: entry.properties["user_id"].rich_text[0].plain_text,
        id: entry.id,
        tag: entry.properties["tag"].select?.name || "",
        type: entry.properties["type"].select?.name || "",
        price: entry.properties["price"].number || 0,
        detail: entry.properties["detail"].title[0].plain_text || "",
      }));
      moneyList = moneyList.concat(currentPageMoneyList);

      // update the nextCursor for the next page (if available)
      nextCursor = response.next_cursor;
    } while (nextCursor);

    return { date, list: moneyList };
  } catch (error) {
    console.error("Error fetching data from Notion:", error.message);
    return;
  }
};

export const getAccoutingListCurrentMonth = async (userId) => {
  const lastDayOfPreviousMonth = moment()
    .startOf("month")
    .subtract(1, "day")
    .format("YYYY-MM-DD");
  const fistDayOfNextMonth = moment()
    .endOf("month")
    .add(1, "day")
    .format("YYYY-MM-DD");
  const currentMonth = moment().format("YYYY-MM");

  try {
    // initialize variables for pagination
    let moneyList = [];
    let nextCursor = null;
    let has_more = false;

    // define the query options for the Notion API
    const queryOptions = {
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          { property: "date", date: { before: fistDayOfNextMonth } },
          { property: "date", date: { after: lastDayOfPreviousMonth } },
          { property: "user_id", rich_text: { contains: userId } },
        ],
      },
      sorts: [
        {
          property: "date",
          direction: "ascending",
        },
      ],
    };

    do {
      // query the Notion database
      const response = await notion.databases.query(queryOptions);

      // extract data from the current page and append it to moneyList
      const currentPageMoneyList = response.results.map((entry) => ({
        date: entry.properties["date"].date.start,
        user_id: entry.properties["user_id"].rich_text[0].plain_text,
        id: entry.id,
        type: entry.properties["type"].select?.name || "",
        price: entry.properties["price"].number || 0,
        detail: entry.properties["detail"].title[0].plain_text || "",
      }));
      moneyList = moneyList.concat(currentPageMoneyList);

      // update the nextCursor for the next page (if available)
      nextCursor = response.next_cursor;
      has_more = response.has_more;
      if (has_more) {
        queryOptions.start_cursor = nextCursor;
      }
    } while (has_more);

    // get date list from the retrieved data
    const dateList = [];
    moneyList.forEach((item) => {
      if (!dateList.includes(item.date)) {
        dateList.push(item.date);
      }
    });

    // get list of date summary
    const summaryList = [];
    dateList.forEach((date) => {
      const list = moneyList.filter((item) => item.date === date);
      const income = list.reduce((acc, item) => {
        if (item.type === "income") {
          return acc + item.price;
        }
        return acc;
      }, 0);
      const expense = list.reduce((acc, item) => {
        if (item.type === "expense") {
          return acc + item.price;
        }
        return acc;
      }, 0);
      const summary = list.reduce((acc, item) => {
        const type = item.type === "expense" ? -1 : 1;
        return acc + item.price * type;
      }, 0);

      summaryList.push({
        date: date,
        summary: summary,
        income: income || 0,
        expense: expense || 0,
      });
    });

    return { month: currentMonth, list: summaryList };
  } catch (error) {
    console.error("Error fetching data from Notion:", error.message);
    return;
  }
};

export const getCurrentMonthTagsSummary = async (userId) => {
  const lastDayOfPreviousMonth = moment()
    .startOf("month")
    .subtract(1, "day")
    .format("YYYY-MM-DD");
  const fistDayOfNextMonth = moment()
    .endOf("month")
    .add(1, "day")
    .format("YYYY-MM-DD");
  const currentMonth = moment().format("YYYY-MM");

  try {
    let moneyList = [];
    let nextCursor = null;
    let has_more = false;

    const queryOptions = {
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          { property: "date", date: { before: fistDayOfNextMonth } },
          { property: "date", date: { after: lastDayOfPreviousMonth } },
          { property: "user_id", rich_text: { contains: userId } },
        ],
      },
    };

    do {
      // query the Notion database
      const response = await notion.databases.query(queryOptions);

      // extract data from the current page and append it to moneyList
      const currentPageMoneyList = response.results.map((entry) => ({
        date: entry.properties["date"].date.start,
        user_id: entry.properties["user_id"].rich_text[0].plain_text,
        id: entry.id,
        type: entry.properties["type"].select?.name || "",
        price: entry.properties["price"].number || 0,
        tag: entry.properties["tag"].select?.name || "", // Assuming "tag" is a select property
        detail: entry.properties["detail"].title[0].plain_text || "",
      }));
      moneyList = moneyList.concat(currentPageMoneyList);

      // update the nextCursor for the next page (if available)
      nextCursor = response.next_cursor;
      has_more = response.has_more;
      if (has_more) {
        queryOptions.start_cursor = nextCursor;
      }
    } while (has_more);

    // get tags from the retrieved data
    const tagList = Array.from(new Set(moneyList.map((item) => item.tag)));

    // get data from each lists
    const summaryList = [];
    tagList.forEach((tag) => {
      const list = moneyList.filter((item) => item.tag === tag);
      const income = list.reduce((acc, item) => {
        if (item.type === "income") {
          return acc + item.price;
        }
        return acc;
      }, 0);
      const expense = list.reduce((acc, item) => {
        if (item.type === "expense") {
          return acc + item.price;
        }
        return acc;
      }, 0);
      const summary = list.reduce((acc, item) => {
        const type = item.type === "expense" ? -1 : 1;
        return acc + item.price * type;
      }, 0);

      summaryList.push({
        summary: summary,
        tag: tag,
        income: income || 0,
        expense: expense || 0,
      });
    });

    return { month: currentMonth, list: summaryList };
  } catch (error) {
    console.error("Error fetching data from Notion:", error.message);
    return;
  }
};

export const getAccoutingListByTag = async (tag, userId) => {
  const lastDayOfPreviousMonth = moment()
    .startOf("month")
    .subtract(1, "day")
    .format("YYYY-MM-DD");
  const fistDayOfNextMonth = moment()
    .endOf("month")
    .add(1, "day")
    .format("YYYY-MM-DD");
  
  try {
    // Initialize variables for pagination
    let moneyList = [];
    let nextCursor = null;

    // Assuming 'Notion Database ID' is the ID of your Notion database
    const notionDatabaseId = process.env.NOTION_DATABASE_ID; // Replace with your database ID

    do {
      // Define the query options for the Notion API
      const queryOptions = {
        database_id: notionDatabaseId,
        filter: {
          and: [
            { property: "date", date: { before: fistDayOfNextMonth } },
            { property: "date", date: { after: lastDayOfPreviousMonth } },
            { property: "tag", select: { equals: tag } },
            { property: "user_id", rich_text: { contains: userId } },
          ],},
          sorts: [
            {
              property: "price",
              direction: "descending",
            },
          ],
      };

      // Query the Notion database
      const response = await notion.databases.query(queryOptions);

      // Extract data from the current page and append it to moneyList
      const currentPageMoneyList = response.results.map((entry) => ({
        date: entry.properties["date"].date.start,
        user_id: entry.properties["user_id"].rich_text[0].plain_text,
        id: entry.id,
        type: entry.properties["type"].select?.name || "",
        price: entry.properties["price"].number || 0,
        tag: entry.properties["tag"].select?.name || "", // Assuming "tag" is a select property
        detail: entry.properties["detail"].title[0].plain_text || "",
      }));
      moneyList = moneyList.concat(currentPageMoneyList);

      // Update the nextCursor for the next page (if available)
      nextCursor = response.next_cursor;
    } while (nextCursor);

    return { data: moneyList, error: null };
  } catch (error) {
    console.error("Error fetching data from Notion:", error.message);
    return { data: [], error: error.message };
  }
};

export const addListToDB = async (accountingData) => {
  try {
    // Assuming 'Notion Database ID' is the ID of your Notion database

    // Create a new entry object with the provided data
    const newEntry = {
      parent: {
        type: "database_id",
        database_id: notionDatabaseId,
      },
      properties: {
        // Map your properties to the appropriate Notion database properties
        // Replace these with your actual property names
        detail: { title: [{ text: { content: accountingData.detail } }] },
        date: { date: { start: accountingData.date } },
        user_id: { rich_text: [{ text: { content: accountingData.user_id } }] },
        type: { select: { name: accountingData.type } },
        price: { number: accountingData.price },
        tag: { select: { name: accountingData.tag } },
        // Add more properties as needed
      },
    };

    // Create the new entry in the Notion database
    const response = await notion.pages.create(newEntry);

    return response;
  } catch (error) {
    console.error("Error adding data to Notion:", error.message);
    return { error: error.message };
  }
};

export const deleteItemById = async (id) => {
  try {
    // Delete the page in the Notion database based on its ID
    const response = await notion.pages.update({
      page_id: id,
      archived: true, // This marks the page as archived (similar to deleting in Notion)
    });

    return { error: null };
  } catch (error) {
    console.error("Error deleting data from Notion:", error.message);
    return { error: error.message };
  }
};

export const updateItemById = async (pageId, dataToUpDate) => {
  const tag = dataToUpDate.tag;
  try {
    // Define the properties to update, including the "tag" property
    const propertiesToUpdate = {
      tag: {
        select: {
          name: tag,
        },
      },
    };

    // Update the page in the Notion database based on its ID
    const response = await notion.pages.update({
      page_id: pageId,
      properties: propertiesToUpdate,
    });

    return { error: null };
  } catch (error) {
    console.error("Error updating tag in Notion:", error.message);
    return { error: error.message };
  }
};

export const addUserToDB = async (userId) => {
  try {
    const settingTagsValue = [
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
    ];

    // create a new page object to represent the user in the Notion database
    const newUserPage = {
      parent: { database_id: process.env.NOTION_USER_DATABASE_ID },
      properties: {
        user_id: { title: [{ text: { content: userId } }] },
        setting_tags: {
          rich_text: [
            {
              type: "text",
              text: {
                content: JSON.stringify(settingTagsValue),
              },
            },
          ],
        },
      },
    };

    // add new user in the Notion database
    const response = await notion.pages.create(newUserPage);

    return { data: response, error: null };
  } catch (error) {
    console.error("Error adding user to Notion:", error.message);
    return { data: null, error: error.message };
  }
};

export const serchUserById = async (userId) => {
  try {
    // query the Notion database to retrieve data for the specified user ID
    const response = await notion.databases.query({
      database_id: process.env.NOTION_USER_DATABASE_ID,
      filter: {
        property: "user_id",
        title: {
          equals: userId,
        },
      },
    });

    // check if any user data was found (user exists)
    const userExists = response.results.length > 0;

    return { data: userExists, error: null };
  } catch (error) {
    console.error("Error checking if user exists in Notion:", error.message);
    return { data: null, error: error };
  }
};

export const getSettingTags = async (userId) => {
  try {
    // query the Notion database to retrieve data for the specified user ID
    const response = await notion.databases.query({
      database_id: process.env.NOTION_USER_DATABASE_ID,
      filter: {
        property: "user_id",
        title: {
          equals: userId,
        },
      },
    });

    // check if any user data was found
    if (response.results.length > 0) {
      // extract the JSON string from the rich text property
      const jsonData =
        response.results[0].properties["setting_tags"].rich_text[0].plain_text;

      // parse the JSON string into an object
      const allTags = JSON.parse(jsonData);

      return { data: allTags, error: null };
    } else {
      // user not found
      return { data: null, error: "User not found" };
    }
  } catch (error) {
    console.error("Error fetching user data from Notion:", error.message);
    throw error;
  }
};

export const updateSettingTags = async (userId, tags, type) => {
  try {
    // query the Notion database to retrieve the current setting_tags for the user
    const response = await notion.databases.query({
      database_id: process.env.NOTION_USER_DATABASE_ID,
      filter: {
        property: "user_id",
        title: {
          equals: userId,
        },
      },
    });

    // check if any user data was found
    if (response.results.length > 0) {
      // extract the current setting_tags as an array
      const currentSettingTags =
        response.results[0].properties["setting_tags"].rich_text[0].plain_text;

      // update tags based on the type (add or delete)
      let updatedSettingTags = JSON.parse(currentSettingTags);
      if (type === "add") {
        updatedSettingTags.push(tags);
      } else if (type === "delete") {
        updatedSettingTags = updatedSettingTags.filter((tag) => tag !== tags);
      }

      // stringify the updated setting tags
      const updatedSettingTagsString = JSON.stringify(updatedSettingTags);

      // update the user's setting_tags in the Notion database
      const updateResponse = await notion.pages.update({
        page_id: response.results[0].id,
        properties: {
          setting_tags: {
            rich_text: [
              {
                text: {
                  content: updatedSettingTagsString,
                },
              },
            ],
          },
        },
      });

      return { error: null };
    } else {
      // user not found
      return { error: "User not found" };
    }
  } catch (error) {
    console.error("Error updating setting tags in Notion:", error.message);
    return { error: error.message };
  }
};

// function to migrate data from Supabase to Notion
async function migrateData() {
  try {
    // fetch data from Supabase
    const supabaseData = await fetchSupabaseData();

    // iterate through the Supabase data and add each item to Notion
    for (const item of supabaseData) {
      const accountingData = {
        detail: item.detail,
        date: item.date,
        user_id: item.user_id,
        type: item.type,
        price: item.price,
        tag: item.tag,
      };

      const response = await addListToDB(accountingData);
      console.log("Added entry to Notion:", response);
    }

    console.log("Migration completed.");
  } catch (error) {
    console.error("Error during migration:", error.message);
  }
}
