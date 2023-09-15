import { supabase } from "./supabase-init.js";
import moment from "moment";

//function for accounting
export const getAccoutingListByDateAndUserId = async (date, userId) => {
  const { data: moneyList, error } = await supabase
    .from("Money list")
    .select("*")
    .eq("date", date)
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching data:", error.message);
    return;
  }

  return { date: date, list: moneyList };
};

export const getAccoutingListCurrentMonth = async (userId) => {
  const currentMonth = moment().format("YYYY-MM");
  const { data: moneyList, error } = await supabase
    .from("Money list")
    .select("*")
    .eq("user_id", userId)
    .ilike("date", `%${currentMonth}%`)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching data:", error.message);
    return;
  }

  //get all date of current month
  const dateList = [];
  moneyList.forEach((item) => {
    if (!dateList.includes(item.date)) {
      dateList.push(item.date);
    }
  });

  //summary all price of each date
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
};

export const getCurrentMonthTagsSummary = async (userId) => {
  const currentMonth = moment().format("YYYY-MM");
  const { data: moneyList, error } = await supabase
    .from("Money list")
    .select("*")
    .eq("user_id", userId)
    .ilike("date", `%${currentMonth}%`)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching data:", error.message);
    return;
  }

  //get all tags from current month
  const tagList = [];
  moneyList.forEach((item) => {
    if (!tagList.includes(item.tag)) {
      tagList.push(item.tag);
    }
  });

  //summary all price of each tag
  const summaryList = [];
  tagList.forEach((tag) => {
    const list = moneyList.filter((item) => item.tag === tag);
    const summary = list.reduce((acc, item) => {
      const type = item.type === "expense" ? -1 : 1;
      return acc + item.price * type;
    }, 0);

    summaryList.push({
      summary: summary,
      tag: tag,
    });
  });

  return { month: currentMonth, list: summaryList };
};

export const getAccoutingListByTag = async (tag, userId) => {
  const { data, error } = await supabase
    .from("Money list")
    .select("*")
    .eq("tag", tag)
    .eq("user_id", userId)
    .order("date", { ascending: true });

  return { data, error };
};

export const addListToDB = async (accountingData) => {
  const { data, error } = await supabase
    .from("Money list")
    .insert([accountingData])
    .select();

  if (error) {
    console.error("Error fetching data:", error.message);
    return;
  }

  return data;
};

export const deleteItemById = async (id) => {
  const { error } = await supabase.from("Money list").delete().eq("id", id);
  console.log(error);

  return { error };
};

export const updateItemById = async (id, newData) => {
  const { error } = await supabase
    .from("Money list")
    .update(newData)
    .eq("id", id)
    .select();

  return { error };
};

//function for setting
export const addUserToDB = async (userId) => {
  const { data, error } = await supabase
    .from("User")
    .insert([{ user_id: userId }])
    .select();

  return { data, error };
};

export const serchUserById = async (userId) => {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("user_id", userId);

  return { data, error };
};

export const getSettingTags = async (userId) => {
  const { data, error } = await supabase
    .from("User")
    .select("setting_tags")
    .eq("user_id", userId);

  const allTags = data[0]?.setting_tags;

  //if can't find tags because no user, add new user
  if (!allTags) {
    const { error } = await addUserToDB(userId);
    if (error) {
      console.error("Error fetching data:", error.message);
    } else {
      console.log("Add new user complete");
    }
  }

  return { data: allTags, error };
};

export const updateSettingTags = async (userId, tags, type) => {
  //get previous tags
  const { data: allTags, error: getTagError } = await getSettingTags(userId);

  if (getTagError) {
    console.log(getTagError);
  }

  console.log(allTags);
  if (getTagError) {
    console.error("Error fetching data:", getTagError.message);
    return { error: getTagError };
  }

  //update tags
  if (type === "add") {
    const { error } = await supabase
      .from("User")
      .update({ setting_tags: [...allTags, tags] })
      .eq("user_id", userId)
      .select();

    return { error };
  }

  if (type === "delete") {
    const { error } = await supabase
      .from("User")
      .update({ setting_tags: allTags.filter((tag) => tag !== tags) })
      .eq("user_id", userId)
      .select();

    return { error };
  }
};
