import { config } from "dotenv";
import moment from "moment";

config();

// Retrieve environment variables
const notionApiKey = process.env.NOTION_API_KEY;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;

import { Client } from "@notionhq/client";

const notion = new Client({
  auth: notionApiKey,
}); // Replace with your Notion API key

export const getAccoutingListByDateAndUserId = async (date, userId) => {
  try {
    // Assuming 'Notion Database ID' is the ID of your Notion database

    let moneyList = [];
    let nextCursor = null;

    do {
      // Initialize the query with the filter and cursor (if available)
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

      // Query the Notion database
      const response = await notion.databases.query(queryOptions);

      // Extract data from the current page and append it to moneyList
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

      // Update the nextCursor for the next page (if available)
      nextCursor = response.next_cursor;
    } while (nextCursor);

    return { date, list: moneyList };
  } catch (error) {
    console.error("Error fetching data from Notion:", error.message);
    return;
  }
};

export const getAccoutingListCurrentMonth = async (userId) => {
  try {
    const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
    const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");
    const currentMonth = moment().format("YYYY-MM");

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
            { property: "date", date: { before: currentMonthEnd } },
            { property: "date", date: { after: currentMonthStart } },
            { property: "user_id", rich_text: { contains: userId } },
          ],
        },
        cursor: nextCursor,
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
        detail: entry.properties["detail"].title[0].plain_text || "",
      }));
      moneyList = moneyList.concat(currentPageMoneyList);

      // Update the nextCursor for the next page (if available)
      nextCursor = response.next_cursor;
    } while (nextCursor);

    // Summary section
    const dateList = [];
    moneyList.forEach((item) => {
      if (!dateList.includes(item.date)) {
        dateList.push(item.date);
      }
    });

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
  try {
    const currentMonthStart = moment().startOf("month").format("YYYY-MM-DD");
    const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");

    // Initialize variables for pagination
    let moneyList = [];
    let nextCursor = null;

    // Assuming 'Notion Database ID' is the ID of your Notion database
    const notionDatabaseId = process.env.NOTION_DATABASE_ID; // Replace with your database ID

    do {
      // Define the query options for the Notion API with 'before' and 'after' filters
      const queryOptions = {
        database_id: notionDatabaseId,
        filter: {
          and: [
            { property: "date", date: { before: currentMonthEnd } },
            { property: "date", date: { after: currentMonthStart } },
            { property: "user_id", rich_text: { contains: userId } },
          ],
        },
        cursor: nextCursor,
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

    // Get unique tags from the retrieved data
    const tagList = Array.from(new Set(moneyList.map((item) => item.tag)));

    // Summary section
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

    return { month: currentMonthStart, list: summaryList };
  } catch (error) {
    console.error("Error fetching data from Notion:", error.message);
    return;
  }
};

export const getAccoutingListByTag = async (tag, userId) => {
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
            { property: "tag", select: { equals: tag } }, // Assuming "tag" is a select property
            { property: "user_id", rich_text: { contains: userId } },
          ],
        },
        cursor: nextCursor,
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
    // Assuming 'Notion Database ID' is the ID of your Notion database
    const notionDatabaseId = process.env.NOTION_USER_DATABASE_ID; // Replace with your database ID

    // Create a rich text property with the value ["น้ำมัน"] as a string
    const settingTagsValue = {
      tags: [
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
      ],
    };

    // Create a new page object to represent the user in the Notion database
    const newUserPage = {
      parent: { database_id: notionDatabaseId },
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

    // Create the new user page in the Notion database
    const response = await notion.pages.create(newUserPage);

    return { data: response, error: null };
  } catch (error) {
    console.error("Error adding user to Notion:", error.message);
    return { data: null, error: error.message };
  }
};

export const serchUserById = async (userId) => {
  try {
    // Assuming 'Notion Database ID' is the ID of your Notion database
    const notionDatabaseId = process.env.NOTION_USER_DATABASE_ID; // Replace with your database ID

    // Query the Notion database to retrieve data for the specified user ID
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      filter: {
        property: "user_id",
        title: {
          equals: userId,
        },
      },
    });

    // Check if any user data was found (user exists)
    const userExists = response.results.length > 0;

    return userExists;
  } catch (error) {
    console.error("Error checking if user exists in Notion:", error.message);
    return false; // Return false if an error occurs
  }
};

export const getSettingTags = async (userId) => {
  try {
    // Assuming 'Notion Database ID' is the ID of your Notion database
    const notionDatabaseId = process.env.NOTION_USER_DATABASE_ID; // Replace with your database ID

    // Query the Notion database to retrieve data for the specified user ID
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      filter: {
        property: "user_id",
        title: {
          equals: userId,
        },
      },
      // Include the property containing the JSON string in the response
      // Replace "property_name" with the actual property name that contains the JSON string
      // For example, if it's named "user_data", use "user_data" instead of "property_name"
      // properties: ["property_name"],
    });

    // Check if any user data was found
    if (response.results.length > 0) {
      // Extract the JSON string from the rich text property
      const jsonData =
        response.results[0].properties["setting_tags"].rich_text[0].plain_text;

      // Parse the JSON string into an object
      const allTags = JSON.parse(jsonData);

      return { data: allTags, error: null };
    } else {
      // User not found
      return { data: null, error: "User not found" };
    }
  } catch (error) {
    console.error("Error fetching user data from Notion:", error.message);
    throw error; // Propagate the error
  }
};

export const updateSettingTags = async (userId, tags, type) => {
  try {
    // Assuming 'Notion Database ID' is the ID of your Notion database
    const notionDatabaseId = process.env.NOTION_USER_DATABASE_ID; // Replace with your database ID

    // Query the Notion database to retrieve the current setting_tags for the user
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      filter: {
        property: "user_id",
        title: {
          equals: userId,
        },
      },
    });


    // Check if any user data was found
    if (response.results.length > 0) {
      // Extract the current setting_tags as an array
      const currentSettingTags =
        response.results[0].properties["setting_tags"].rich_text[0].plain_text;

      // Update tags based on the type (add or delete)
      let updatedSettingTags = JSON.parse(currentSettingTags);
      if (type === "add") {
        updatedSettingTags.push(tags);
      } else if (type === "delete") {
        updatedSettingTags = updatedSettingTags.filter((tag) => tag !== tags);
      }

      // Stringify the updated setting tags
      const updatedSettingTagsString = JSON.stringify(updatedSettingTags);

      // Update the user's setting_tags in the Notion database
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
      // User not found
      return { error: "User not found" };
    }
  } catch (error) {
    console.error("Error updating setting tags in Notion:", error.message);
    return { error: error.message };
  }
};
