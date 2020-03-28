var current_canvas;
var canvas_list;
var mouse = {x: 0, y: 0};


var onPaint = function() {
    ctx.lineTo(mouse.x, mouse.y);
	console.log(mouse);
    ctx.stroke();
};

function updateMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
    mouse.x = evt.clientX - rect.left;
    mouse.y = evt.clientY - rect.top;
}

function init(){
	canvas_list = [];
	var initial_canvas = $('<canvas/>', {"style":"border: solid 5pt blue"}).width(800).height(600).get(0);
	canvas_list.push(initial_canvas);
	$("#canvas_list").append(initial_canvas);
	current_canvas = initial_canvas;

	ctx = current_canvas.getContext('2d');
	current_canvas.addEventListener('mousemove',
							function(e) {
								updateMousePos(current_canvas, e);
								//console.log(mouse);
							},
							false);
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = '#00CC99';
 
	current_canvas.addEventListener('mousedown', function(e) {
		ctx.beginPath();
		ctx.moveTo(mouse.x, mouse.y);
		current_canvas.addEventListener('mousemove', onPaint, false);
	}, false);
	
	current_canvas.addEventListener('mouseup', function() {
		current_canvas.removeEventListener('mousemove', onPaint, false);
	}, false);
}

init();
