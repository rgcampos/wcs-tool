/**
 * AcuraciaTuring.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    connection: 'mongodbServer',
    tableName: 'acuraciaTuring',
    autoCreatedAt: true,
    autoUpdatedAt: true,

    attributes: {
        nome_teste: {
            type: 'string',
            required: true
        },
        pergunta_resposta: {
            type: 'json',
            required: true
        }
    }
};

