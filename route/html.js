module.exports = function(app){

 var express = require('express');
 var route = express.Router();
 var date = Date();

 //---mysql 외부 분리 모듈 로드---
var {conn} = require('../db');

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

// 라우트: 토픽수정후 데이터 전송
app.post(['/html/:id/edit2'], (req, res) => {
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var id = req.params.id; //  id값은 request.params. id 값으로 받는다.
  var sql = 'UPDATE html SET title=?, description=?, author=? WHERE id=?';
  conn.query(sql, [title, description, author, id], (err, rows, fields) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/html/' + id);
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
