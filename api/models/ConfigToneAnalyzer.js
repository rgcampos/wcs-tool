/**
 * ConfigToneAnalyzer.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    connection: 'mongodbServer',
    tableName: 'configuracaoToneAnalyze',
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        url_api: {
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
        version_date: {
            type: 'string',
            required: true
        }
    }
};