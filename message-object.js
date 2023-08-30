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
    altText: "เพิ่มรายจ่ายใหม่",
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
              ...data.list.map((expense) => ({
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  {
                    type: "text",
                    text: expense.detail,
                    size: "sm",
                    flex: 3,
                  },
                  {
                    type: "text",
                    text: expense.type === "expense" ? `-${expense.price}` : `+${expense.price}`,
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

export const summaryThisMonth = (data) => {
  
}