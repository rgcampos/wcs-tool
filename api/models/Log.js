/**
 * Log.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    connection: 'mongodbServer',
    tableName: 'log',
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        info: {
            type: 'json',
            required: true
        }
    }
};