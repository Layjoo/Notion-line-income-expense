import moment from "moment";
moment.locale("th");

export const todayAccoutingList = (data) => {
  
  function calculateTotalPrice(data) {
    let totalPrice = 0;

    data.forEach((item) => {
      const type = item.type === "expense" ? -1 : 1;
      totalPrice += item.price * type;
    });

    return totalPrice;
  }

  return {
    type: "flex",
    altText: `รายจ่ายวันนีี้ ${calculateTotalPrice(data.list).toString()} บาท`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `รายการวันที่ ${data.date}`,
            weight: "bold",
            size: "md",
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "รายละเอียด",
                    size: "sm",
                    weight: "bold",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "ราคา",
                    size: "sm",
                    weight: "bold",
                    align: "end",
                    flex: 2,
                  },
                ],
              },
              {
                type: "separator",
                margin: "md",
              },
              // Iterate through the data array and generate a table row for each entry
              ...data.list.map((item) => ({
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  {
                    type: "text",
                    text: item.detail === "" ? "ไม่มีรายละเอียด" : item.detail,
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: item.type === "expense" ? `-${item.price}` : `+${item.price}`,
                    size: "sm",
                    align: "end",
                    flex: 2,
                  },
                ],
              })),
              {
                type: "separator",
                margin: "md",
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  {
                    type: "text",
                    text: "รวม",
                    size: "sm",
                    weight: "bold",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: `${calculateTotalPrice(data.list).toString()} บาท`,
                    size: "sm",
                    weight: "bold",
                    align: "end",
                    flex: 2,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };
};

export const currentMonthAccoutingList = (data) => {

  function calculateTotalPrice(data) {
    let totalPrice = 0;

    data.forEach((item) => {
      totalPrice += item.summary;
    });

    return totalPrice;
  }

  return {
    type: "flex",
    altText: `รายจ่ายเดือนนี้ ${calculateTotalPrice(data.list).toString()} บาท`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `สรุปรายการเดือน ${moment(data.month).format("MMMM YYYY")}`,
            weight: "bold",
            size: "md",
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "วันที่",
                    size: "sm",
                    weight: "bold",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: "ใช้จ่าย",
                    size: "sm",
                    weight: "bold",
                    align: "end",
                    flex: 2,
                  },
                ],
              },
              {
                type: "separator",
                margin: "md",
              },
              // Iterate through the data array and generate a table row for each entry
              ...data.list.map((item) => ({
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  {
                    type: "text",
                    text: moment(item.date).format("D"),
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: `${item.summary} บาท`,
                    size: "sm",
                    align: "end",
                    flex: 2,
                  },
                ],
              })),
              {
                type: "separator",
                margin: "md",
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  {
                    type: "text",
                    text: "รวม",
                    size: "sm",
                    weight: "bold",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: `${calculateTotalPrice(data.list).toString()} บาท`,
                    size: "sm",
                    weight: "bold",
                    align: "end",
                    flex: 2,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };
};