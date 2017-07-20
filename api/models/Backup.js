/**
 * Backup.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    connection: 'mongodbServer',
    tableName: 'backup',
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        workspace: {
            type: 'json',
            required: true
        }
    }
};

