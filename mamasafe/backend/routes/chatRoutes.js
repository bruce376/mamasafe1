const express = require('express');
const { createChatController } = require('../controllers/chatController');

function createChatRoutes(dependencies = {}) {
    const router = express.Router();
    const controller = createChatController(dependencies);
    const checkDbConnection = dependencies.checkDbConnection || ((req, res, next) => next());

    router.get('/status', controller.status);
    router.get('/ask', controller.status);
    router.post('/', checkDbConnection, controller.chat);
    router.post('/ask', checkDbConnection, controller.chat);
    router.post('/pregnancy', checkDbConnection, controller.chat);

    return router;
}

module.exports = {
    createChatRoutes
};
