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

  const totalPrice = calculateTotalPrice(data.list);

  const totalIncome = data.list.reduce((acc, item) => {
    if (item.type === "income") {
      return acc + item.price;
    }
    return acc;
  }, 0);

  const totalExpense = data.list.reduce((acc, item) => {
    if (item.type === "expense") {
      return acc + item.price;
    }
    return acc;
  }, 0);

  if (data.list.length === 0) {
    return {
      type: "flex",
      altText: `รายจ่ายวันนี้ ${calculateTotalPrice(data.list).toString()} บาท`,
      contents: {
        type: "bubble",
        direction: "ltr",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "รายรับรายจ่าย",
                  weight: "bold",
                  size: "md",
                  color: "#29BA24FF",
                  contents: [],
                },
                {
                  type: "text",
                  text: `วันที่ ${moment(data.date).locale("th").format("LL")}`,
                  size: "md",
                  gravity: "bottom",
                  margin: "md",
                  contents: [],
                },
              ],
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
                  type: "text",
                  text: "ยังไม่มีรายการวันนี้",
                  weight: "bold",
                  size: "sm",
                  margin: "sm",
                  contents: [],
                },
                {
                  type: "box",
                  layout: "vertical",
                  margin: "xl",
                  contents: [
                    {
                      type: "button",
                      action: {
                        type: "message",
                        label: "วิธีเพิ่มรายการใหม่",
                        text: "วิธีเพิ่มรายการใหม่",
                      },
                      color: "#29BA24FF",
                      height: "sm",
                      style: "primary",
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    };
  }

  return {
    type: "flex",
    altText: `รายจ่ายวันนีี้ ${calculateTotalPrice(data.list).toString()} บาท`,
    contents: {
      type: "bubble",
      direction: "ltr",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: `รายรับรายจ่าย`,
                weight: "bold",
                size: "md",
                color: "#29BA24FF",
                contents: [],
              },
              {
                type: "text",
                text: `วันที่ ${moment(data.date).locale("th").format("LL")}`,
                size: "md",
                gravity: "bottom",
                margin: "md",
                contents: [],
              },
            ],
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "sm",
            contents: [
              {
                type: "text",
                text: "รายละเอียด",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: "ราคา",
                weight: "bold",
                size: "sm",
                align: "end",
                offsetEnd: "55px",
                contents: [],
              },
            ],
          },
          {
            type: "separator",
            margin: "sm",
          },
          // Generate dynamic detail sections
          ...data.list.map((item) => ({
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
              {
                type: "box",
                layout: "vertical",
                width: "160px",
                contents: [
                  {
                    type: "text",
                    text: `${
                      item.detail === "" ? "ไม่มีรายละเอียด" : item.detail
                    } (${item.tag})`,
                    size: "sm",
                    action: {
                      type: "postback",
                      label: `แก้ไขหมวดหมู่ ${item.detail}`,
                      text: `แก้ไขหมวดหมู่ ${item.detail}`,
                      data: `{"postback_type": "require_tag", "item": {"id": "${item.id}", "date": "${data.date}", "detail": "${item.detail}"}}`,
                    },
                    contents: [],
                  },
                ],
              },
              {
                type: "text",
                text:
                  item.type === "expense" ? `-${item.price}` : `+${item.price}`,
                size: "sm",
                color: item.type === "expense" ? "#EA4444FF" : "#29BA24FF",
                align: "end",
                offsetEnd: "8px",
                contents: [],
              },
              {
                type: "box",
                layout: "vertical",
                action: {
                  type: "postback",
                  label: "ลบรายการ",
                  text: `ลบรายการ ${item.detail}`,
                  data: `{"postback_type": "delete_item", "delete_item_id": "${item.id}", "date": "${data.date}"}`,
                },
                width: "50px",
                backgroundColor: "#F5E8E8FF",
                cornerRadius: "10px",
                contents: [
                  {
                    type: "text",
                    text: "ลบ",
                    size: "sm",
                    color: "#EA4444FF",
                    align: "center",
                    gravity: "center",
                    contents: [],
                    offsetBottom: "3px",
                  },
                ],
                justifyContent: "center",
                alignItems: "center",
              },
            ],
            justifyContent: "center",
            alignItems: "center",
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
                text: "รายรับทั้งหมด",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: `+${totalIncome} บาท`,
                color: "#29BA24FF",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "xs",
            contents: [
              {
                type: "text",
                text: "รายจ่ายทั้งหมด",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: `-${totalExpense} บาท`,
                color: "#EA4444FF",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "xs",
            contents: [
              {
                type: "text",
                text: "รวม",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: `${totalPrice} บาท`,
                color: totalPrice > 0 ? "#29BA24FF" : "#EA4444FF",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "message",
                  label: "สรุปรายจ่ายเดือนนี้",
                  text: "สรุปรายจ่ายเดือนนี้",
                },
                height: "sm",
                style: "primary",
              },
              {
                type: "text",
                text: "คำแนะนำ: แตะที่รายการเพื่อแก้ไขหมวดหมู่",
                size: "xxs",
                align: "center",
                margin: "md",
                contents: [],
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

  function findMaxSumaryPrice(data) {
    let max = 0;

    data.forEach((item) => {
      const summtion = item.income + item.expense;

      if (summtion > max) {
        max = summtion;
      }
    });

    return max;
  }

  function calculateWidth(data, income, expense) {
    const max = findMaxSumaryPrice(data);
    return Math.floor(((income + expense) / max) * 180);
  }

  const totalPrice = calculateTotalPrice(data.list);

  const totalIncome = data.list.reduce((acc, item) => {
    return acc + item.income;
  }, 0);

  const totalExpense = data.list.reduce((acc, item) => {
    return acc + item.expense;
  }, 0);

  return {
    type: "flex",
    altText: `รายจ่ายเดือนนี้ ${calculateTotalPrice(data.list).toString()} บาท`,
    contents: {
      type: "bubble",
      direction: "ltr",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "สรุปรายจ่ายประจำเดือน",
                weight: "bold",
                size: "md",
                color: "#29BA24FF",
                contents: [],
              },
              {
                type: "text",
                text: `เดือน ${moment(data.month)
                  .locale("th")
                  .format("MMMM YYYY")}`,
                size: "md",
                gravity: "bottom",
                margin: "md",
                contents: [],
              },
            ],
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "sm",
            contents: [
              {
                type: "text",
                text: "วันที่",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: "ยอดรวม",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
          {
            type: "separator",
            margin: "sm",
          },

          //dynamic section
          ...data.list.map((item) => {
            return {
              type: "box",
              layout: "horizontal",
              margin: "md",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  action: {
                    type: "postback",
                    label: `ดูประวัติวันที่ ${moment(item.date).format(
                      "D MMMM YYYY"
                    )}`,
                    text: `ดูประวัติวันที่ ${moment(item.date).format(
                      "D MMMM YYYY"
                    )}`,
                    data: `{"postback_type": "history_account", "date": "${item.date}"}`,
                  },
                  width: "20px",
                  backgroundColor: "#CAF2C9FF",
                  cornerRadius: "8px",
                  contents: [
                    {
                      type: "text",
                      text: `${moment(item.date).format("D")}`,
                      size: "xxs",
                      color: "#29BA24FF",
                      align: "center",
                      contents: [],
                    },
                  ],
                  justifyContent: "center",
                  alignItems: "center",
                },
                {
                  type: "text",
                  text:
                    item.summary > 0 ? `+${item.summary}` : `${item.summary}`,
                  size: "xxs",
                  color: item.summary > 0 ? "#29BA24FF" : "#EA4444FF",
                  align: "end",
                  offsetEnd: "5px",
                  contents: [],
                },

                //expense bar
                {
                  type: "box",
                  layout: "horizontal",
                  //calculate width of expense bar
                  width: `${
                    (item.expense / (item.expense + item.income)) *
                    calculateWidth(data.list, item.income, item.expense)
                  }px`,
                  backgroundColor: "#F5E8E8FF",
                  contents: [
                    {
                      type: "text",
                      text: ".",
                      color: "#F5E8E8FF",
                      contents: [],
                    },
                  ],
                },

                //income bar
                {
                  type: "box",
                  layout: "horizontal",
                  //calculate width of income bar
                  width: `${
                    (item.income / (item.expense + item.income)) *
                    calculateWidth(data.list, item.income, item.expense)
                  }px`,
                  backgroundColor: "#CAF2C9FF",
                  contents: [
                    {
                      type: "text",
                      text: ".",
                      size: "xxs",
                      color: "#CAF2C9FF",
                      contents: [],
                    },
                  ],
                },
              ],
            };
          }),

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
                text: "รายรับทั้งหมด",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: `+${totalIncome} บาท`,
                color: "#29BA24FF",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "xs",
            contents: [
              {
                type: "text",
                text: "รายจ่ายทั้งหมด",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: `-${totalExpense} บาท`,
                color: "#EA4444FF",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "xs",
            contents: [
              {
                type: "text",
                text: "รวม",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: `${totalPrice} บาท`,
                color: totalPrice > 0 ? "#29BA24FF" : "#EA4444FF",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                action: {
                  type: "message",
                  label: "สรุปหมวดหมู่เดือนนี้",
                  text: "สรุปหมวดหมู่เดือนนี้",
                },
                height: "sm",
                style: "primary",
              },
              {
                type: "text",
                text: "คำแนะนำ: แตะวันที่เพื่อดูรายละเอียด",
                size: "xxs",
                align: "center",
                margin: "md",
                contents: [],
              },
            ],
          },
        ],
      },
    },
  };
};

export const createTagBubble = (item, tags) => {
  function createEmptyHorizontalBox() {
    return {
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [],
    };
  }

  function calculateWidthFromString(str) {
    const vowelRegex = /[ีิึืุู่้๊๋]/g;
    const strWithoutVowels = str.replace(vowelRegex, "");
    return strWithoutVowels.length < 4 ? 35 : 10 * strWithoutVowels.length;
  }

  function getTotalWidth(horizontalBox) {
    return horizontalBox.contents.reduce((totalWidth, tag) => {
      const boxWidth = parseInt(tag.width, 10);
      return totalWidth + boxWidth;
    }, 0);
  }

  const colors = [{ bg: "#F5E8E8FF", text: "#EA4444FF" }];

  const bubble = {
    type: "bubble",
    direction: "ltr",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `แก้ไขรายการ ${item.detail}`,
              weight: "bold",
              size: "md",
              color: "#29BA24FF",
              contents: [],
            },
            {
              type: "text",
              text: "เลือกหมวดหมู่",
              size: "sm",
              gravity: "bottom",
              margin: "md",
              contents: [],
            },
            {
              type: "separator",
              margin: "md",
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "คำแนะนำ: เพิ่มหมวดหมู่ พิมพ์ว่า เพิ่ม tag (หมวดหมู่)",
              size: "xxs",
              align: "center",
              margin: "md",
              contents: [],
            },
            {
              type: "text",
              text: "ลบหมวดหมู่ พิมพ์ว่า ลบ tag (หมวดหมู่)",
              size: "xxs",
              align: "center",
              margin: "md",
              contents: [],
            },
          ],
        },
      ],
    },
  };

  let horizontalBox = createEmptyHorizontalBox(); // Initialize the first horizontal box

  tags.forEach((tag, index) => {
    const bgColor = colors[index % colors.length].bg;
    const textColor = colors[index % colors.length].text;
    const boxWidth = calculateWidthFromString(tag);

    if (getTotalWidth(horizontalBox) + boxWidth > 240) {
      // Create a new horizontal box if the total width exceeds 250px
      bubble.body.contents.push(horizontalBox);
      horizontalBox = createEmptyHorizontalBox();
    }

    horizontalBox.contents.push({
      type: "box",
      layout: "vertical",
      margin: "sm",
      action: {
        type: "postback",
        label: `${item.detail} จัดอยู่ในหมวด${tag}`,
        text: `${item.detail} จัดอยู่ในหมวด${tag}`,
        data: `{"postback_type": "edit_tag", "item_id": "${item.id}", "date": "${item.date}", "tag": "${tag}"}`,
      },
      width: `${boxWidth}px`,
      backgroundColor: bgColor,
      cornerRadius: "8px",
      contents: [
        {
          type: "text",
          text: tag,
          size: "sm",
          color: textColor,
          align: "center",
          contents: [],
          offsetBottom: "1px",
        },
      ],
    });
  });

  // Add the last horizontal box if it's not empty
  if (horizontalBox.contents.length > 0) {
    bubble.body.contents.push(horizontalBox);
  }

  return {
    type: "flex",
    altText: `tag`,
    contents: bubble,
  };
};

export const currentMonthTag = (data) => {
  function calculateTotalPrice(data) {
    let totalPrice = 0;

    data.forEach((item) => {
      totalPrice += item.summary;
    });

    return totalPrice;
  }

  function findMaxSumaryPrice(data) {
    let max = 0;

    data.forEach((item) => {
      const absoluteSummary =
        item.summary > 0 ? item.summary : item.summary * -1;

      if (absoluteSummary > max) {
        max = absoluteSummary;
      }
    });

    return max;
  }

  function calculateWidth(data, summary) {
    const max = findMaxSumaryPrice(data);
    const absoluteSummary = summary > 0 ? summary : summary * -1;
    return Math.floor((absoluteSummary / max) * 150);
  }

  const totalPrice = calculateTotalPrice(data.list);

  return {
    type: "flex",
    altText: `รายจ่ายเดือนนี้ ${calculateTotalPrice(data.list).toString()} บาท`,
    contents: {
      type: "bubble",
      direction: "ltr",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "สรุปรายจ่ายตามหมวดหมู่",
                weight: "bold",
                size: "md",
                color: "#29BA24FF",
                contents: [],
              },
              {
                type: "text",
                text: `เดือน ${moment(data.month)
                  .locale("th")
                  .format("MMMM YYYY")}`,
                size: "md",
                gravity: "bottom",
                margin: "md",
                contents: [],
              },
            ],
          },
          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "sm",
            contents: [
              {
                type: "text",
                text: "หมวดหมู่",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: "ยอดรวม",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
          {
            type: "separator",
            margin: "sm",
          },

          //dynamic section
          ...data.list.map((item) => {
            return {
              type: "box",
              layout: "horizontal",
              margin: "md",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  action: {
                    type: "postback",
                    label: `ดูรายการในหมวดหมู่ ${item.tag}`,
                    text: `ดูรายการในหมวดหมู่ ${item.tag}`,
                    data: `{"postback_type": "history_tag", "tag": "${item.tag}", "month": "${data.month}"}`,
                  },

                  contents: [
                    {
                      type: "text",
                      text: `${item.tag}`,
                      size: "sm",
                      color: "#000000",
                      align: "start",
                      contents: [],
                    },
                  ],
                },
                {
                  type: "text",
                  text:
                    item.summary > 0 ? `+${item.summary}` : `${item.summary}`,
                  size: "xxs",
                  color: item.summary > 0 ? "#29BA24FF" : "#EA4444FF",
                  align: "end",
                  offsetEnd: "5px",
                  contents: [],
                },

                //summary bar
                {
                  type: "box",
                  layout: "horizontal",
                  //calculate width
                  width: `${calculateWidth(data.list, item.summary)}px`,
                  backgroundColor: "#F5E8E8FF",
                  contents: [
                    {
                      type: "text",
                      text: ".",
                      color: "#F5E8E8FF",
                      contents: [],
                    },
                  ],
                },
              ],
            };
          }),

          {
            type: "separator",
            margin: "md",
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "xs",
            contents: [
              {
                type: "text",
                text: "รวม",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: `${totalPrice} บาท`,
                color: totalPrice > 0 ? "#29BA24FF" : "#EA4444FF",
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "คำแนะนำ: แตะหมวดหมู่เพื่อดูรายละเอียด",
                size: "xxs",
                align: "center",
                contents: [],
              },
            ],
          },
        ],
      },
    },
  };
};

export const tagAccountingList = (data, tag, month) => {

  // Split array into multiple arrays (add new array every 15 items)
  const messages = [];
  const splitData = splitArray(data);

  // Calculate total price
  const totalPrice = calculateTotalPrice(data);
  const totalIncome = data.reduce((acc, item) => {
    if (item.type === "income") {
      return acc + item.price;
    }
    return acc;
  }, 0);
  const totalExpense = data.reduce((acc, item) => {
    if (item.type === "expense") {
      return acc + item.price;
    }
    return acc;
  }, 0);

  // Generate dynamic message
  splitData.forEach((data, index) => {
    const header = [
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `รายการในหมวดหมู่ ${tag}`,
            weight: "bold",
            size: "md",
            color: "#29BA24FF",
            contents: [],
          },
          {
            type: "text",
            text: `เดือน ${moment(month).locale("th").format("MMMM YYYY")}`,
            size: "md",
            gravity: "bottom",
            margin: "md",
            contents: [],
          },
        ],
      },
      {
        type: "separator",
        margin: "md",
      },
    ];

    const footer = [
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "message",
              label: "สรุปรายจ่ายเดือนนี้",
              text: "สรุปรายจ่ายเดือนนี้",
            },
            height: "sm",
            style: "primary",
          },
          {
            type: "text",
            text: "คำแนะนำ: แตะที่รายการเพื่อแก้ไขหมวดหมู่",
            size: "xxs",
            align: "center",
            margin: "md",
            contents: [],
          },
        ],
      },
    ];

    const summary = [
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
            text: "รายรับทั้งหมด",
            weight: "bold",
            size: "sm",
            contents: [],
          },
          {
            type: "text",
            text: `+${totalIncome} บาท`,
            color: "#29BA24FF",
            weight: "bold",
            size: "sm",
            align: "end",
            contents: [],
          },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "xs",
        contents: [
          {
            type: "text",
            text: "รายจ่ายทั้งหมด",
            weight: "bold",
            size: "sm",
            contents: [],
          },
          {
            type: "text",
            text: `-${totalExpense} บาท`,
            color: "#EA4444FF",
            weight: "bold",
            size: "sm",
            align: "end",
            contents: [],
          },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "xs",
        contents: [
          {
            type: "text",
            text: "รวม",
            weight: "bold",
            size: "sm",
            contents: [],
          },
          {
            type: "text",
            text: `${totalPrice} บาท`,
            color: totalPrice > 0 ? "#29BA24FF" : "#EA4444FF",
            weight: "bold",
            size: "sm",
            align: "end",
            contents: [],
          },
        ],
      },
    ];

    const fullmessage = {
      type: "flex",
      altText: `รายจ่ายในหมวดหมู่ ${tag} เดือน ${moment(month)
        .locale("th")
        .format("MMMM YYYY")}`,
      contents: {
        type: "bubble",
        direction: "ltr",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              margin: "sm",
              contents: [
                {
                  type: "text",
                  text: "รายละเอียด",
                  weight: "bold",
                  size: "sm",
                  contents: [],
                },
                {
                  type: "text",
                  text: "ราคา",
                  weight: "bold",
                  size: "sm",
                  align: "end",
                  offsetEnd: "55px",
                  contents: [],
                },
              ],
            },
            {
              type: "separator",
              margin: "sm",
            },
            // Generate dynamic detail sections
            ...data.map((item) => ({
              type: "box",
              layout: "horizontal",
              margin: "md",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  width: "160px",
                  contents: [
                    {
                      type: "text",
                      text: `${
                        item.detail === "" ? "ไม่มีรายละเอียด" : item.detail
                      } (${item.tag})`,
                      size: "sm",
                      action: {
                        type: "postback",
                        label: `แก้ไขหมวดหมู่ ${item.detail}`,
                        text: `แก้ไขหมวดหมู่ ${item.detail}`,
                        data: `{"postback_type": "require_tag", "item": {"id": "${item.id}", "date": "${item.date}", "detail": "${item.detail}"}}`,
                      },
                      contents: [],
                    },
                  ],
                },
                {
                  type: "text",
                  text:
                    item.type === "expense"
                      ? `-${item.price}`
                      : `+${item.price}`,
                  size: "sm",
                  color: item.type === "expense" ? "#EA4444FF" : "#29BA24FF",
                  align: "end",
                  offsetEnd: "8px",
                  contents: [],
                },
                {
                  type: "box",
                  layout: "vertical",
                  action: {
                    type: "postback",
                    label: "ลบรายการ",
                    text: `ลบรายการ ${item.detail}`,
                    data: `{"postback_type": "delete_item", "delete_item_id": "${item.id}", "date": "${data.date}"}`,
                  },
                  width: "50px",
                  backgroundColor: "#F5E8E8FF",
                  cornerRadius: "10px",
                  contents: [
                    {
                      type: "text",
                      text: "ลบ",
                      size: "sm",
                      color: "#EA4444FF",
                      align: "center",
                      gravity: "center",
                      contents: [],
                      offsetBottom: "3px",
                    },
                  ],
                  justifyContent: "center",
                  alignItems: "center",
                },
              ],
              justifyContent: "center",
              alignItems: "center",
            })),
          ],
        },
        footer: {
          type: "box",
          layout: "horizontal",
          contents: [],
        },
      },
    };

    if (index === 0) fullmessage.contents.body.contents.unshift(...header);
    if (index === splitData.length - 1) {
      fullmessage.contents.footer.contents.unshift(...footer);
      fullmessage.contents.body.contents.push(...summary);
    }
    return messages.push(fullmessage);
  });

  return messages;

  function splitArray(data) {
    //split array
    const maxLength = 15;
    if (data.length > maxLength) {
      const splitArrays = [];

      for (let i = 0; i < data.length; i += maxLength) {
        splitArrays.push(data.slice(i, i + maxLength));
      }

      return splitArrays;
    }

    return [data];
  }

  function calculateTotalPrice(data) {
    let totalPrice = 0;

    data.forEach((item) => {
      const type = item.type === "expense" ? -1 : 1;
      totalPrice += item.price * type;
    });

    return totalPrice;
  }
};
