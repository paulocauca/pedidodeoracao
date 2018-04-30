var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '::. Chegou o momento de orar, junte-se a nós nesta plataforma de oração!  .::' });
});

// router.get('/hashtag',function (req,res, next) {
//
// });
//
//




module.exports = router;
