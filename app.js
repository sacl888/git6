var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session      = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var mysql = require('mysql');

var app = require('express.io')();
app.http().io();


app.io.route('ready', function(req) {
    usuarios++;
    req.io.emit('talk', {
        message: 'Bienvenido'
    })
});

/*app.io.route('welcome', function(req){
    console.log(req.data.nameUser);
    req.io.broadcast('recibirUser', 'mensaje de bienvenida');
    req.io.emit('recibirUser', 'mensaje de bienvenida');
})*/

app.listen(3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

function login(req, res, next){
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
}

function BD(){
    var connection = mysql.createConnection({
        host : 'localhost',
        user : 'root',
        password : '',
        posrt: 3306,
        database: 'consummer'
    });    
    return connection; 
}
var usuarios = 0;
var usuariosOnline = new Array();
var bandera = false;
app.io.route('message', function(req, res){
    //if(!req.data.session){
        //usuariosOnline.push(req.data.session);
    //}    
    //console.log(req.data.session);
    if(req.data.msg != ''){
        req.io.broadcast('addMessage', usuariosOnline);
    }    
});



app.get('/privada', login, function(req, res){    
    var objBD = BD();
    var user = req.session.user;
    app.io.route('conectado', function(req) {
        console.log('El id del socket es: ' + req.socket.id); 
            objBD.query('UPDATE usuario SET usu_estado = 1, usu_socket_id = "'+req.socket.id+'" WHERE usu_email = "'+user+'" ', function(error, resultado, fila){
            if(!error){
                console.log('Id de socket de Usuario Actualizado satisfactoriamente "Conectado".');
            }else{
                console.log(error);
            }
        });
    });

    app.io.route('datosUser', function(req, res){
        objBD.query('SELECT * FROM usuario WHERE usu_email = "' + user + '" LIMIT 1', function(error, resultado, file){
            if(!error){ 
                req.io.emit('recibeDatosUser', resultado);
            }else{
                console.log('Error al intentar consultar datos de usuario');
            }
        });
    });
    
    app.io.route('listUsers', function(req, res){
        console.log(req);
        objBD.query('SELECT * FROM usuario WHERE usu_estado = 1', function(error, resultado, fila){
            if(!error){
                req.io.broadcast('addListUsers', resultado);
                req.io.emit('addListUsers', resultado);
            }else{
                console.log('Error al intentar consultar usuarios conectados');
            }
        });
    });

    res.render('dashboard', {title:'principal', sessionName:req.session.user, arrayUsers:'probando..' });
    
});

app.io.route('prueba', function(req, res){ 
    //console.log(req.session.user);
    //req.io.broadcast('addMessage');
    //req.io.emit('addMessage');
})

app.post('/autenticar', function(req, res){
    var objBD = BD();
    var user = req.body.user;
    var pass = req.body.pass;
    objBD.query('SELECT * FROM usuario WHERE usu_email LIKE "'+user+'" and usu_password LIKE "'+pass+'"', function(error, resultado, fila){
        if(!error){
            console.log(resultado.length);
            if(resultado.length > 0){
                //console.log(resultado);
                req.session.user = user;
                res.send(''); 
                //io.emit('welcome',req.session.user);
                //res.redirect('/privada');   
            }else{
                res.send('El usuario no existe');
            }
        }else{
            console.log('Error');
        }
    });  
});

app.get('/salir', function(req, res){
        var objBD = BD();
        objBD.query('UPDATE usuario SET usu_estado = 0 WHERE usu_email = "'+req.session.user+'" ', function(error, resultado, fila){
            if(!error){
                console.log('Id de socket de Usuario Actualizado satisfactoriamente "Conectado".');
            }else{
                console.log(error);
            }
        });
    delete req.session.user;
    res.redirect('/privada');
});

app.io.route('disconnect', function(req) {
    var objBD = BD();
    objBD.query('UPDATE usuario SET usu_estado = 0 WHERE usu_socket_id = "'+req.socket.id+'" ', function(error, resultado, fila){
        if(!error){ 
            console.log('Estado de usuario actualizado satisfactoriamente por medio se Id de socket "Desconectado".');
        }else{
            console.log(error);
        }
    });
    //console.log('El id del socked desconectado es: '+req.socket.id);
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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


module.exports = app;
