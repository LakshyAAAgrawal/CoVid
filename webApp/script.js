// Jai Shree Ram
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
    var t1 = performance.now();
    var move = {x: mouse.x, y: mouse.y, t:(t1-t0), s:true};
    movements.push(move);
    canvas.addEventListener('mousemove', onPaint, false);
}, false);

canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', onPaint, false);
}, false);

var onPaint = function() {
    var mousex = mouse.x;
    var mousey = mouse.y;
    var t1 = performance.now();
    ctx.lineTo(mousex, mousey );
    ctx.stroke();
    var move = {x: mousex, y: mouse.y, t:(t1-t0)};
    movements.push(move);
};

function download( name, type) {
    var a = document.getElementById("a");
    var toStore = JSON.stringify( movements );
    a.style.display = "block";
    var file = new Blob([toStore], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
  }








/// Uploaded vala part

var savedMovements =  new Array();


  function myFunction(){
    var x = document.getElementById("myFile");

    var txt = "";
    if ('files' in x) {
      if (x.files.length == 0) {
        txt = "Select one or more files.";
      } else {
        for (var i = 0; x.files.length; i++) {
        var filee = x.files[i];

        var fr = new FileReader();
        fr.onload = function(e) {

        savedMovements = JSON.parse( e.target.result );
        console.log(savedMovements);
        };
        fr.readAsText(filee);
      }

      }
    }
    else {
      if (x.value == "") {
        txt += "Select one or more files.";
      } else {
        txt += "The files property is not supported by your browser!";
        txt  += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead.
      }
    }
    document.getElementById("demo").innerHTML = txt;
  }



  function updateMovement(){
    var curmov = savedMovements.shift();
    //console.log("mm");
    console.log(curmov);
    if ('s' in curmov){
      //mouseSimulate(curmov.x,curmov.y,"mousedown")
      ctx.beginPath();
      ctx.moveTo(curmov.x, curmov.y);
    }
    else{
      //mouseSimulate(curmov.x,curmov.y,"mousemove")
      ctx.lineTo(curmov.x, curmov.y);
      ctx.stroke();
    }
  }


  var globalID;

/*
$("#replayButton").on("click", function() {

    console.log("kjndlc");
      globalID = requestAnimationFrame(replay);
    });
*/

var savedt0 = performance.now();
function startReply(){
  savedt0 = performance.now();
  globalID = requestAnimationFrame(replay);
}



  function replay(){


    if(savedMovements.length>0){
      var currentT = performance.now();
      var temp = currentT - savedt0;
      if (savedMovements[0].t < temp){
        updateMovement();

      }

    globalID = requestAnimationFrame(replay);
    }
  }



