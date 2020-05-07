const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://saknode:0kIr10Fcc5dmhMA0@cluster0-zykne.mongodb.net/shop?retryWrites=true&w=majority',
    { useUnifiedTopology: true } 
)
.then(client => {
    console.log('Connected');
    _db = client.db()
    callback(client);
})
.catch(err => {
    console.log(err);
    throw err;
});
};

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'No database found!'
}
exports.mongoConnect = mongoConnect;  
exports.getDb = getDb;
//module.exports = mongoConnect;

/* const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'node-course', 
    'root', 
    '',
    {
    dialect: 'mysql',
    host: 'localhost'
})

module.exports = sequelize; */

/* const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-course',
    password: ''
})

module.exports = pool.promise(); */