/**
 * AcuraciaExperimento.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    connection: 'mongodbServer',
    tableName: 'acuraciaExperimento',
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        resultado: {
            type: 'json',
            required: true
        }
    }
};

