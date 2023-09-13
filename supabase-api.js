import { supabase } from "./supabase-init.js";
import moment from "moment";

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

  console.log(moneyList);
  console.log(currentMonth);

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
    const summary = list.reduce((acc, item) => {
      const type = item.type === "expense" ? -1 : 1;
      return acc + item.price * type;
    }, 0);
    summaryList.push({ date: date, summary: summary });
  });

  return { month: currentMonth, list: summaryList };
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
  const { error } = await supabase
    .from("Money list")
    .delete()
    .eq("id", id);
    console.log(error)

  return { error };
};
