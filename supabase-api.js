import { supabase } from "./supabase-init.js";

const getAccoutingListByDateAndUserId = async (date, userId) => {
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

  console.log(moneyList)
  return {date: date, list: moneyList}
};

const addListToDB = async (accountingData) => {
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

export {getAccoutingListByDateAndUserId, addListToDB };
