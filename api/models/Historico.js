/**
 * Historico.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    connection: 'mongodbServer',
    tableName: 'historico',
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        workspace_id: {
            type: 'string',
            index: true,
            required: true
        },
        conversation_id: {
            type: 'string',
            index: true,
            required: true
        },
        text: {
            type: 'string'
        },
        typeAgent: {
            type: 'integer',
            index: true,
            required: true
        },
        username: {
            type: 'string',
            index: true,
            required: true
        },
        intents: {
            type: 'json'
        },
        entities: {
            type: 'json'
        },
        info: {
            type: 'json'
        }
    }
};