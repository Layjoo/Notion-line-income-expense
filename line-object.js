const { json } = require("express/lib/response");

const sendSelectTags = (pageId, tags) => {
    const quickReply = {
        type: "text",
        text: `เลือกรายการ`,
        quickReply: {
            items: [],
        },
    };

    for (let i in tags) {
        quickReply.quickReply.items.push({
            type: "action",
            action: {
                type: "postback",
                label: tags[i],
                data: JSON.stringify({"input": "add_list", "pageId": pageId, "list": tags[i]}),
                displayText: tags[i],
            },
        })
    }

    return quickReply;
}

const sendSelectWallet = (pageId) => {
    const quickReply = {
        type: "text",
        text: `เลือกกระเป๋า`,
        quickReply: {
            items: [],
        },
    };

    const wallets = ["กระเป๋าหลัก","ส่วนเกิน", "เงินเก็บ"]

    for (let i in wallets) {
        quickReply.quickReply.items.push({
            type: "action",
            action: {
                type: "postback",
                label: wallets[i],
                data: JSON.stringify({"input": "add_wallet", "pageId": pageId, "wallet": wallets[i]}),
                displayText: wallets[i],
            },
        })
    }

    return quickReply;
}

const message = (message) => {
    const reply = {
        type: "text",
        text: message,
    };

    return reply;
}
module.exports = {
    sendSelectTags,
    sendSelectWallet,
    message
}