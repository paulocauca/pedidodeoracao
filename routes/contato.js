var express = require('express');
var contato = express.Router();
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.pedidosdeoracao.net',
    port: 587,
    auth: {
        user: 'contato@pedidosdeoracao.net',
        pass: 'm1ck31'
    },
    tls:{
        rejectUnauthorized: false
    }
}));







// send mail with defined transport object


contato.get('/contato', function(req, res, next) {
    res.render('contato', { title: '::. Chegou o momento da ação, junte-se a nós nesta plataforma de oração!  .::' });
    console.log(req.body)
});



contato.post('/contato', function(req, res) {


    console.log(req.body.c_nome + " : " + req.body.c_assunto  + " : " + req.body.c_email  + " : " + req.body.c_descricao )

   // req.body.c_nome + " : " + req.body.c_assunto  + " : " + req.body.c_email  + " : " + req.body.c_descricao

    var mailOptionsToCliente = {
        from: '".:: pedidodeoracao.net ::.." <contato@pedidosdeoracao.net>', // sender address
        to: req.body.c_email , // list of receivers
        subject: 'Contato - Pedidos de Oração  \o/',
        html: 'Olá, <b>'+ req.body.c_nome + ' </b>, <br> Primeiramente muito obrigado pelo seu e-mail, que Deus te abençoe e nos vemos em breve :-).<br> <br>Att. <br> Equipe pedidosdeoracao.net'
    };

    sendMail(mailOptionsToCliente);

    var mailOptionsToAdmin = {
        from: '<contato@pedidosdeoracao.net>', // sender address
        to: 'contato@pedidosdeoracao.net', // list of receivers
        subject: '[Contato Site - ' + req.body.c_assunto +']', // Subject line
        html: '<br>' +
        'Nome : '       + req.body.c_nome       + '<br>' +
        'Email : '       + req.body.c_email      + '<br>' +
        'Assunto : '    + req.body.c_assunto     + '<br>' +
        'Desc : <br>'  + req.body.c_descricao
    };

    sendMail(mailOptionsToAdmin);

    res.redirect('/contato')
});


 function sendMail(mailOptions) {

     transporter.sendMail(mailOptions, function(error, info){
         if(error){
             return console.log(error);
         }
         console.log('Message sent: ' + info.response);
     });

 }

module.exports.contato = contato;
