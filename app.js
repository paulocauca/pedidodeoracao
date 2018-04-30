var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var routes = require('./routes/index');
var mysql = require('mysql');


var app = express();


var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'mysql.SEU_DOMINIO.net',
    user     : 'pedidosdeoraca',
    password : 'XXXX',
    database : 'pedidosdeoraca',
    debug    :  false
});


var server = require('http').Server(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//cauca

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/hashtag', routes);
app.all('*', require('./routes/saibamais').saibamais);
app.all('*', require('./routes/contato').contato);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var socketCount = 0;

io.on('connection',function(socket){

    socketCount++;
    io.emit('usuarios orando', socketCount);
    pedidos_oracao();
    selectAllOracoes();
    oracoes_realizadas();
    oracoes_respondidas();

    socket.on('disconnect', function () {
        socketCount-- ;
        io.emit('usuarios orando', socketCount);
    });

    socket.on('envia oracao', function (data) {

        //Extrai as HashTags antes de inserir no banco
        var str = data.oracao;
        var str_com_rash = str.match(/#\w+/g);
        var str_sem_rash = "";

        for(var i in  str_com_rash){
                str_sem_rash += str_com_rash[i].replace("#","");
                str_sem_rash += ' ';
        }

        var query = 'INSERT INTO OA01_ORACAO (NOME,EMAIL,ORACAO,HASHTAG) values (?,?,?,?);';

        pool.getConnection(function(err,connection) {
            if (err) {
                connection.release();
                res.json({"code": 100, "status": "Error in connection database"});
                return;
            }
            connection.query(query,[data.nome, data.email, data.oracao, str_sem_rash], function (err) {
                connection.release();
                if (!err) {
                    //io.emit('atualiza oracoes novas', data);
                    pedidos_oracao();
                }
            });
        });


    });

    socket.on('vou orar', function (data) {
        var query = 'UPDATE OA01_ORACAO set QTDE = QTDE + 1 WHERE ID_ORACAO = ? ;';

        pool.getConnection(function(err,connection) {
            if (err) {
                connection.release();
                res.json({"code": 100, "status": "Error in connection database"});
                return;
            }
            connection.query(query,[data.id_oracao], function (err) {
                connection.release();
                if (!err) {

                    oracoes_realizadas();
                }
            });
        });
    });


    socket.on('atualizar oracoes', function () {
        // Atualiza oracoes parqa quem clicar no notificador de oracao
        selectAllOracoes();
    });


    socket.on('Oracoes Respondidas', function () {
        var query = 'UPDATE OA00_CONTADOR set QTDE = QTDE + 1 WHERE ID = 1 ;';

        pool.getConnection(function(err,connection) {
            if (err) {
                connection.release();
                res.json({"code": 100, "status": "Error in connection database"});
                return;
            }
            connection.query(query, function (err) {
                connection.release();
                if (!err) {
                    oracoes_respondidas();
                }
            });
        });
    });

    socket.on('search hashtag', function (data) {
        //Extrai as HashTags antes de inserir no banco

        var query;
        var str;

        if(data.hashtag == "")  {
            query = 'SELECT * FROM OA01_ORACAO WHERE TIMESTAMPDIFF(DAY,DT_ORACAO,now()) < 5 ORDER BY ID_ORACAO DESC;';
        }else{
            str =  data.hashtag.toUpperCase();
            query = "SELECT * FROM OA01_ORACAO WHERE UPPER(HASHTAG) RLIKE '[[:<:]]" + str + "[[:>:]]' ;";
        }

        pool.getConnection(function(err,connection) {
            if (err) {
                connection.release();
                res.json({"code": 100, "status": "Error in connection database"});
                return;
            }
            connection.query(query, function (err, oracoes) {
                connection.release();
                if (!err) {
                    //EMite apenas para o cliente que chamou a requisicao
                    io.to(socket.id).emit('atualiza oracoes', oracoes);
                }else{
                    console.log(err);
                }
            });
        });


    });

    //TODO : Consulta a tabela de orações - funcao dentro do io.socket devido a necessidade de usar o socket.to

    function selectAllOracoes(){
        var query = 'SELECT * FROM OA01_ORACAO WHERE TIMESTAMPDIFF(DAY,DT_ORACAO,now()) < 10 ORDER BY ID_ORACAO DESC;';

        pool.getConnection(function(err,connection) {
            if (err) {
                connection.release();
                res.json({"code": 100, "status": "Error in connection database"});
                return;
            }
            connection.query(query, function (err, oracoes) {
                connection.release();
                if (!err) {
                    io.to(socket.id).emit('atualiza oracoes', oracoes);
                }
            });
        })
    };

});




//TODO : Painel lateral esquerdo Summary
function pedidos_oracao(){
    var query = "SELECT COUNT(1) QTDE FROM OA01_ORACAO;";
    pool.getConnection(function(err,connection) {
        if (err) {
            connection.release();
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }
        connection.query(query, function (err, oracaoCount) {
            connection.release();
            if (!err) {
                io.emit('pedidos oracao', oracaoCount);
            }
        });
    })
};

function oracoes_realizadas(){
    var query = "SELECT SUM(QTDE) QTDE FROM OA01_ORACAO;";
    pool.getConnection(function(err,connection) {
        if (err) {
            connection.release();
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }
        connection.query(query, function (err, oracaoCount) {
            connection.release();
            if (!err) {
                io.emit('oracoes realizadas', oracaoCount);
            }
        });
    })
};

function oracoes_respondidas(){
    var query = "SELECT QTDE FROM OA00_CONTADOR WHERE ID = 1;";
    pool.getConnection(function(err,connection) {
        if (err) {
            connection.release();
            res.json({"code": 100, "status": "Error in connection database"});
            return;
        }
        connection.query(query, function (err, oracaoCount) {
            connection.release();
            if (!err) {
                io.emit('oracoes respondidas', oracaoCount);
            }
        });
    })
};


module.exports = { app : app , server : server };
