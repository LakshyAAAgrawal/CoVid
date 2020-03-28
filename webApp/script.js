var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var painting = document.getElementById('paint');
var paint_style = getComputedStyle(painting);
canvas.width = parseInt(paint_style.getPropertyValue('width'));
canvas.height = parseInt(paint_style.getPropertyValue('height'));

var mouse = {x: 0, y: 0};
var movements =  new Array();
var t0 = performance.now();


canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.pageX - this.offsetLeft;
  mouse.y = e.pageY - this.offsetTop;
}, false);

ctx.lineWidth = 3;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = '#00CC99';

canvas.addEventListener('mousedown', function(e) {
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);

    canvas.addEventListener('mousemove', onPaint, false);
}, false);

canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', onPaint, false);
}, false);

var onPaint = function() {
    ctx.lineTo(mouse.x, mouse.y);
    //console.log(mouse.x, mouse.y);
    ctx.stroke();
    var t1 = performance.now();
    var move = {x: mouse.x, y: mouse.y, t:t1-t0};
    movements.push(move);
};

function saveMouse() {


    return 0;
  }


function download( name, type) {
    var a = document.getElementById("a");
    var toStore = JSON.stringify( movements );
    a.style.display = "block";
    var file = new Blob([toStore], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
  }
