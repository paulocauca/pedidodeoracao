var express = require('express');
var saibamais = express.Router();

saibamais.get('/saibamais', function(req, res, next) {
    res.render('saibamais', { title: '::. Chegou o momento da ação, junte-se a nós nesta plataforma de oração!  .::' });
});

module.exports.saibamais = saibamais;
