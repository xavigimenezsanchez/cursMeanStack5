var db = require("../db");

var user = db.Schema({
    username: String,
    password: {type:String, select:false}  //amb select a false ens assegurem que hem de forçar a posar el password quan fem una consulta
});

module.exports = db.model('User',user);