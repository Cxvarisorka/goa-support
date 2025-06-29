const express = require("express");

// controllers
const { addAnswer, editAnswer, deleteAnswer, getAnswers } = require("../controllers/answer.controller.js");

// middlewares
const verifyToken = require("../middlewares/auth.js");
const contentFilterOpenAi = require("../middlewares/AI Filters/contentFilterOpenAI.js");


const answerRouter = express.Router();

answerRouter.post('/:questionId', verifyToken, express.json(), contentFilterOpenAi, addAnswer);
answerRouter.get('/question/:questionId', verifyToken, express.json(), getAnswers);
answerRouter.put('/:id', verifyToken, express.json(), editAnswer);
answerRouter.delete('/:id', verifyToken, deleteAnswer);

module.exports = answerRouter;