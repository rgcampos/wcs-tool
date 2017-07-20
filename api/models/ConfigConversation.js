/**
 * ConfigConversation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

/**
 * Configuracao.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    connection: 'mongodbServer',
    tableName: 'configuracaoConversation',
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        url_api: {
            type: 'string',
            required: true
        },
        workspace_id: {
            type: 'string',
            required: true
        },
        user: {
            type: 'string',
            required: true
        },
        token: {
            type: 'string',
            required: true
        },
        feedback: {
            type: 'boolean',
            defaultsTo: false
        },
        emoji: {
            type: 'boolean',
            defaultsTo: false
        },
        history: {
            type: 'boolean',
            defaultsTo: false
        },
        version_date: {
            type: 'string',
            required: true
        },
        end_conversation_message: {
            type: 'string',
            required: true
        },
        evaluation_message: {
            type: 'string',
            required: true
        },
        conversation_start: {
            type: 'boolean',
            defaultsTo: false
        },
        external_token: {
            type: 'string'
        }
    }
};