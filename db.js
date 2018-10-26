 
//---mysql 외부 모듈---
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'coonjin2',
    database: 'opentutorials'
});
conn.connect();
 
module.exports = {
  conn
}
