var express = require('express');
var jwt = require('jwt-simple');
var bcrypt = require("bcrypt");
var User = require("./models/user");

var app = express();
var secretKey = 'superMegaSecretKey';

app.use(require('body-parser').json());


app.post('/session', function(req,res, next) {
    //Si la contrasenya enviada per l'usuari és correcte
    //enviem un toke d'autenticació
    User.findOne({username: req.body.username})
            .select('username password')
            .exec(function(err,user) {
                if (err) return next(err);
                if (!user) return res.status(401).json({"missatge": "auth problem"});
                bcrypt.compare(req.body.password, user.password, function (err, valid) {
                    if (err) return next(err);
                    if (!valid) return res.status(401).json({"missatge": "auth problem"});
                    var token = jwt.encode({username: user.username}, secretKey);
                    res.status(200).json(token);
                });
            });
});


app.get('/user', function(req,res) {
    //Si el token d'autenticació és correcte enviem 
    // el nom de l'usuari per provar que funciona.
    var token = req.headers['x-auth'];
    if (token) {
        var auth = jwt.decode(token,secretKey);
        User.findOne({username:auth.username}, function(err, user) {
            res.status(200).json(user);
        });
    } else {
        res.status(401).json({"missatge": "bad token"});
    }
});

app.post('/user', function(req,res,next) {
    //Afegim un usuari i contrasenya nous a la base de dades
    console.log(req.body);
    User.findOne({"username": req.body.username}, function(err,user) {
        if (err) return next(err);
        if (user) return res.status(409).json({"missatge":"User exists"});
        
        bcrypt.hash(req.body.password, 11, function(err,hash) {
            console.log(hash);
            var user = new User({username: req.body.username});
            user.password = hash;
            user.save(function(erro, user) {
                if (err) return next(err);
                res.status(201).json({"missatge":"User Created"});
            });
        });
    });
        
});

app.listen(process.env.PORT, function(){
    console.log('App listening at port ' + process.env.PORT);
});

