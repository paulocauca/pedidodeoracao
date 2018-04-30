var express = require('express');
var doe = express.Router();

doe.get('/doe', function(req, res, next) {
    res.render('doe', { title: '::. Chegou o momento da ação, junte-se a nós nesta plataforma de oração!  .::' });
});

module.exports.doe = doe;
