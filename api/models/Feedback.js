/**
 * Feedback.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    connection: 'mongodbServer',
    tableName: 'feedback',
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        workspace_id: {
            type: 'string',
            index: true
        },
        conversation_id: {
            type: 'string',
            index: true
        },
        username: {
            type: 'string',
            index: true,
            required: true
        },
        intents: {
            type: 'json'
        },
        success: {
            type: 'boolean'
        },
        reviewed: {
            type: 'boolean',
            required: true,
            defaultsTo: false
        }
    }
};