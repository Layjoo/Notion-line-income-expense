import moment from "moment";
moment.locale("th");

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
    },
  };
};
