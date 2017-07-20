module.exports = {
    getConfig: (objSearch) => {
        return new Promise((res, rej) => {
            ConfigConversation
                .find(objSearch)
                .then((result) => {
                    return res(result);
                })
                .catch((err) => {
                    return rej(err);
                });
        });
    },

    sendMessage: (conversation, message, context, workspace) => {
        var objConversation = {
            input: {
                text: message
            },
            workspace_id: workspace,
            alternate_intents: true,
            context: context
        };

        return new Promise((res, rej) => {
            conversation.message(objConversation, (err, resp) => {
                if (err)
                    return rej(err);
                return res(resp);
            });
        });
    }
}