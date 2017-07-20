module.exports = {

    connection: 'mongodbServer',
    tableName: 'user',
    autoCreatedAt: true,
    autoUpdatedAt: true,


    attributes: {
        name: {
            type: "string",
            required: true
        },
        email: {
            type: "string",
            required: true
        },
        level: {
            type: "integer",
            required: true,
            defaultsTo: 0
        },
        active: {
            type: "boolean",
            required: true,
            defaultsTo: false
        },
        password: {
            type: "string",
            required: true
        }
    }
}