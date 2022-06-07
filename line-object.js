const sendSelectTags = (pageId, tags, hasDetail) => {
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
                data: JSON.stringify({"input": "add_list", "pageId": pageId, "list": tags[i], "has_detail": hasDetail}),
                displayText: tags[i],
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
    message
}