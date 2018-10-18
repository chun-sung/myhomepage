module.exports = function(app){

 var express = require('express');
 var route = express.Router();
 var date = Date();

 //---MySQL 접속 코드---
 var mysql = require('mysql');
 var conn = mysql.createConnection({
     host: 'localhost',
     user: 'root',
     password: 'coonjin2',
     database: 'opentutorials'
 });
 conn.connect();

//---라우트: 토픽 추가하기---
 app.get('/html/add2', (req, res) => {
   var sql = 'SELECT id,title FROM html';
   conn.query(sql, (err, rows, fields) => {
     var id = req.params.id;
     if(id){
       var sql = 'SELECT * FROM html WHERE id=?';
       conn.query(sql, [id], (err, topic, fields) => {
         if(err){
           console.log(err);
           res.status(500).send('Internal Server Error');
         } else {
           res.render('html', {date:date, list:rows, topic:topic[0], session:req.session.displayName});
         }
       });
     } else {
       res.render('add2', {date:date, list:rows, session:req.session.displayName});
     }
   });
   });

//---html 토픽 리스트 출력---
app.get(['/html', '/html/:id'], (req, res) => {
  var sql = 'SELECT id,title FROM html';
  conn.query(sql, (err, rows, fields) => {
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM html WHERE id=?';
      conn.query(sql, [id], (err, topic, fields) => {
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('html', {date:date, list:rows, topic:topic[0], session:req.session.displayName});
        }
      });
    } else {
      res.render('html', {date:date, list:rows, session:req.session.displayName});
    }
  });
});

 route.get('/r1', function(req, res){  // 라우트 2
   res.send('Hello /p1/r1');
 });
 route.get('/r2', function(req, res){  // 라우트 3
   res.send('Hello /p1/r2');
 });
 
 return route;
};
