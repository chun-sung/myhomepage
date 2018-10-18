//---express 모듈 로드---
var express = require('express');
var app = express();
var date = Date();


//---비밀번호 보안 pbkdf2 모듈로드---
 var bkfd2Password = require('pbkdf2-password');
 var hasher = bkfd2Password();

//---session 모듈 로드---
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

//---세션 미들웨어 등록---
app.use(session({
    secret:'#@$RFDSFsd343f',
    resave:false,
    saveUninitialized: true,
    store: new MySQLStore({
        host:'localhost',
        port:3306,
        user:'root',
        password:'coonjin2',
        database:'opentutorials'
    })
}));

//---express listen---
app.listen(3000, () => {
    console.log('Connected 3000 port!');
 });
 
//---mysql 외부 분리 모듈 로드---
var { mysql, conn} = require('./db');

//----multer 모듈 로드 (파일 업로드)----
var multer = require('multer');                // multer 모듈 로드
var _storage = multer.diskStorage({
    destination: function (req, file, cb) {    // cb 는 callback 함수를 의미한다.
        cb(null, 'uploads/');                  //콜백 함수의 두번째 인자로 저장 폴더 지정
    },                                         // 여기서 조건문을 사용하여 파일형식에 따라
    filename: function (req, file, cb) {       // 폴더를 다르게 지정 하는 콜백 함수를 만들 수 있다.
        cb(null, file.originalname);           // 콜백함수의 두번째 인자로 오리지날 파일이름 지정
    }
})
var upload = multer({ storage: _storage })

//---템플릿 엔진 설정(pug)---
app.locals.pretty = true;
app.set('view engine', 'pug');
app.set('views', './views');

//---post 및 json 데이터 처리---
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

//---정적디렉터리 public설정---
app.use(express.static('public'));
 
//---라우트: 루트 페이지 및 그외 경로---
app.get('/', (req, res) => {         
     res.render('index', {date:date, session:req.session.displayName});         
});

//---라우트html 모듈 호출---
var html = require('./route/html.js')(app); // html 라우트 모듈 호출
app.use('/html', html);                     // /html로 시작하는 요청을 html 라우터 객체에 위임

app.get('/css', (req, res) => {
    res.render('css', { date: date, session:req.session.displayName});
});
app.get('/javascript', (req, res) => {
    res.render('javascript', { date: date, session:req.session.displayName});
});
app.get('/jquery', (req, res) => {
    res.render('jquery', { date: date, session:req.session.displayName});
});

//--- upload 파일 올리기---
app.get('/upload', (req, res) => {    
    res.render('upload', { date:date, session:req.session.displayName});
});
app.post('/upload', upload.single('userfile'), (req, res) => {
    if(!req.file){
        res.render('uploadfail',{date: date, session:req.session.displayName})
    } else {
        var filename = req.file.filename
        res.render('uploadsucess', {date: date, name:filename, session:req.session.displayName});
    }
}); 

//---라우트: 로그인 페이지---
app.get('/login', (req, res) => {           // 로그인 페이지 이동
    res.render('login', {date: date});
});
app.post('/login', (req, res) => {  // 로그인 처리
    var uname = req.body.username;
    var pwd = req.body.password;    
    var sql = 'SELECT * FROM users';          
    conn.query(sql, (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            for(var i = 0; i < rows.length; i++){
                var user = rows[i];
                if(uname == user.username){                    
                   return hasher({password:pwd, salt:user.salt}, (err, pass, salt, hash) => {                        
                        if(hash === user.password){
                            req.session.displayName = user.displayName // 세션 생성 (발급)
                            res.redirect('/');                        
                        } else {
                            res.render('loginfail');
                        }
                    })                
                }
            }           
        }                        
        return res.render('LoginFail');
    });   
});

//---라우트: 로그아웃 페이지---
app.get('/logout', (req, res) => {    
    delete req.session.displayName;    
    res.redirect('/');
});

//---회원 가입---
app.get('/member', (req, res) => {
    res.render('member');
});
app.post('/member', (req, res) => {
    var uname = req.body.username;    
    var pwd = req.body.password;
    var dname = req.body.displayName;     
    if(uname == '' || dname == '' || pwd == ''){
        res.render('memberfail');
    } else {
        hasher({password:pwd}, (err, pass, salt, hash) => { // 패스워드 암호화 (pbkdf2)
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            }else {
                var sql = 'INSERT INTO users (username, password, displayName, salt) VALUES (?, ?, ?, ?)'
                conn.query(sql, [uname, hash, dname, salt], (err) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        var sql = 'SELECT * FROM users';
                        conn.query(sql, (err, rows) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send('Internal Server Error');
                            } else {
                                for (var i = 0; i < rows.length; i++) {
                                    var user = rows[i];
                                    if (uname == user.username) {
                                        return hasher({
                                            password: pwd,
                                            salt: user.salt
                                        }, (err, pass, salt, hash) => {
                                            if (hash === user.password) {
                                                req.session.displayName = user.displayName // 세션 생성 (발급)
                                                res.redirect('/');
                                            } else {
                                                // res.render('loginfail');
                                            }
                                        })
                                    }
                                }
                            }
                            // return res.render('LoginFail');
                        });
                        // res.redirect('/');
                    }
                });
            }        
        });      
    } 
      
});

//---라우트: 토픽 목록 출력---
app.get(['/node', '/node/:id'], (req, res ) => {
    var sql = 'SELECT id,title FROM nodejs';
    var id = req.params.id
    var date = Date();
    conn.query(sql, (err, rows) => {
        if(id){
            var sql = 'SELECT * FROM nodejs WHERE id=?';
            conn.query(sql, [id], (err, topic) => {
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('node', {date:date, list:rows, topic:topic[0], session:req.session.displayName});
                }
            });
        } else {
            res.render('node', {date:date, list:rows, session:req.session.displayName} )
        }
    });
});

//---라우트: 토픽 추가하기 페이지---
app.get('/add', (req, res) => {
    var sql = 'SELECT id,title FROM nodejs';
    var date = Date();
    conn.query(sql, (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('add', {date:date, list:rows, session:req.session.displayName});
        }
    });
});

//---라우트: 추가한 토픽 데이터 POST 수신---
app.post('/add_process', (req, res) => {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var sql = 'INSERT INTO nodejs (title, description, author) VALUES(?, ?, ?)';
    conn.query(sql, [title, description, author], (err, rows) => {
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/node/'+rows.insertId);
        }
    });
});

app.post('/add2_process', (req, res) => {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var sql = 'INSERT INTO html (title, description, author) VALUES(?, ?, ?)';
    conn.query(sql, [title, description, author], (err, result, fields) => {
        if (err) {
            console.log(err)
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/html/' + result.insertId);
        }
    });
});

//---라우트: 토픽 수정 페이지 ---
app.get('/update/:id/edit', (req, res) => {
    var sql = 'SELECT * FROM nodejs';
    conn.query(sql, (err, rows) => {
        var id = req.params.id;
        if(id){
            var sql = 'SELECT * FROM nodejs WHERE id=?';
            conn.query(sql, [id], (err, topic) => {
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('edit', {topics:rows, topic:topic[0], session:req.session.displayName});
                }
            });
        } else {
            console.log('There is no id');
            res.status(500).send('Internal Server Error');
        }
    });
});

app.get(['/update/:id/edit2'], (req, res) => {
    var sql = 'SELECT * FROM html';
    conn.query(sql, (err, rows, fields) => {
        var id = req.params.id;
        if (id) {
            var sql = 'SELECT * FROM html WHERE id=?';
            conn.query(sql, [id], (err, list, fields) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('edit2', { date: date, topics: list, topic: list[0], session:req.session.displayName });
                }
            });
        } else {
            console.log('There is no id.');
            res.status(500).send('Internal Server Error');
        }
    });
});

//--- 라우트: 수정된 토픽 POST데이터 수신---
app.post('/node/:id/edit', (req, res) => {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;
    var sql = 'UPDATE nodejs SET title=?, description=?, author=? WHERE id=?';
    conn.query(sql, [title, description, author, id], (err,rows) => {
        if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/node/'+id);
        }
    });
});

app.post(['/html/:id/edit2'], (req, res) => {
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;        //  id값은 request.params. id 값으로 받는다.
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

//---라우트: 토픽 삭제 페이지---
app.get('/node/:id/delete', (req, res) => {
    var sql = 'SELECT id,title FROM nodejs';
    var id = req.params.id;
    conn.query(sql, (err, rows) => {
        var sql = 'SELECT * FROM nodejs WHERE id=?';
        conn.query(sql, [id], (err, rows) => {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                if (rows.length === 0) {
                    console.log('There is no record');
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('delete', {list:rows, topic:rows[0], session:req.session.displayName});
                }
            }
        });        
    });
});

app.get('/html/:id/delete2', (req, res) => {
    var sql = 'SELECT id,title FROM html';
    var id = req.params.id;
    conn.query(sql, (err, rows, fields) => {
        var sql = 'SELECT * FROM html WHERE id=?';
        conn.query(sql, [id], (err, rows) => {
            if (err) {
                console.log(err);
                res.status(500).send('Internal Server Error');
            } else {
                if (rows.length === 0) {
                    console.log('There is no record.');
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('delete2', { date: date, list: rows, topic: rows[0], session:req.session.displayName });
                }
            }
        });
    });
});

//---라우트: 삭제 클릭시 POST 데이터 수신---
app.post('/node/:id/delete', (req, res) => {
    var id = req.params.id;
    var sql = 'DELETE FROM nodejs WHERE id=?';
    conn.query(sql, [id], (err, rows) => {
        res.redirect('/node/');
    });
});

app.post('/html/:id/delete2', (req, res) => {
    var id = req.params.id;
    var sql = 'DELETE FROM html WHERE id=?';
    conn.query(sql, [id], (err, result) => {
        res.redirect('/html/');
    });
});

//-------404---------------------
app.use((req, res, next) => {
    res.render('404page',{date:date, session:req.session.displayName});
});