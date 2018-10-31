var abc = document.querySelector('.abc')
 abc.addEventListener('click', function(){
    alert('아흑~!');
 });

var question = document.querySelector('.id')
question.addEventListener('click', function () {
    var e = prompt('ID 를  입력하세요', 'ID');    
    if (e == 'ID') {
        alert('회원 가입을 해주세요');
    } else if(e) {
        alert('당신의 ID 는 ' + e + ' 입니다.');
    } else {
        alert('회원 가입을 해주세요');
    }
});
var question = document.querySelector('.question')
    question.addEventListener('click', function(){
        var e = confirm('궁금하신거 있으세용?','질문 하세요');   
        if(e){
            alert('think Big');
        } else {
            alert('없다구요?');
        }
  });

var hidden = document.querySelector('.hidden')
    hidden.addEventListener('click', function(){
        hidden.style.visibility="hidden";
});

var change = document.querySelector('.change')
    change.addEventListener('click', function(){
        change.innerHTML = "변경";
        change.style.backgroundColor = "white";
        change.style.color = "black";
    });