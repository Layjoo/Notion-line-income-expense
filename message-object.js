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

  if (data.list.length === 0) {
    return {
      type: "flex",
      altText: `รายจ่ายวันนีี้ ${calculateTotalPrice(
        data.list
      ).toString()} บาท`,
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
                type: "text",
                text: item.detail === "" ? "ไม่มีรายละเอียด" : item.detail,
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text:
                  item.type === "expense" ? `-${item.price}` : `+${item.price}`,
                size: "sm",
                color: item.type === "expense" ? "#EA4444FF" : "#000000",
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
            margin: "sm",
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
                text: `${calculateTotalPrice(data.list).toString()} บาท`,
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

  function findMaxExpense(data) {
    let max = 0;

    data.forEach((item) => {
      const onlyPrice = item.summary < 0 ? item.summary * -1 : item.summary;

      if (onlyPrice > max) {
        max = onlyPrice;
      }
    });

    return max;
  }

  function calculateWidth(summary, data) {
    const max = findMaxExpense(data);
    const onlyPrice = summary < 0 ? summary * -1 : summary;

    return Math.floor((onlyPrice / max) * 180);
  }
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
            margin: "md",
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
                  text: item.summary > 0 ? `+${item.summary}` : `${item.summary}`,
                  size: "xxs",
                  color: item.summary > 0 ? "#29BA24FF" : "#EA4444FF",
                  align: "end",
                  offsetEnd: "5px",
                  contents: [],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  //calculate width (max width = 200px)
                  width: `${calculateWidth(item.summary, data.list)}px`,
                  backgroundColor: item.summary > 0 ? "#CAF2C9FF" : "#F5E8E8FF",
                  contents: [
                    {
                      type: "text",
                      text: ".",
                      color: item.summary > 0 ? "#CAF2C9FF" : "#F5E8E8FF",
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
                text: "รวม",
                weight: "bold",
                size: "sm",
                contents: [],
              },
              {
                type: "text",
                text: `${calculateTotalPrice(data.list).toString()} บาท`,
                weight: "bold",
                size: "sm",
                align: "end",
                contents: [],
              },
            ],
          },
        ],
      },
    },
  };
};
