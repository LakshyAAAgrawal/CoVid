var current_canvas;
var canvas_list;
var mouse = {x: 0, y: 0};

function new_slide(){
	var new_canvas = $('<canvas/>', {"style":"border: solid 5pt blue", "width":800, "height":600}).get(0);
	canvas_list.push(new_canvas);
	$("#canvas_list").append(new_canvas);
	new_canvas.style.display = 'none'; 
	var ctx = new_canvas.getContext('2d');
	ctx.canvas.width = 800;
	ctx.canvas.height = 600;
	ctx.lineWidth = 3;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = '#00CC99';
	var switch_btn = $('<button/>').text('Test').click(
		function () {
			set_current(new_canvas);
		}
	);
	$("#slides_list").append(switch_btn);
	return new_canvas;
}

function set_current(target_canvas){
	if(typeof current_canvas !== 'undefined'){
		current_canvas.style.display = 'none';
	}
	target_canvas.style.display = 'block';
	current_canvas = target_canvas;
	current_canvas.addEventListener(
		'mousemove',
		function(e) {
			updateMousePos(current_canvas, e);
			//console.log(mouse);
		},
		false);
	current_canvas.addEventListener('mousedown', draw_start, false);	
	current_canvas.addEventListener('mouseup', draw_stop, false);
}

var onPaint = function() {
	var ctx = current_canvas.getContext('2d');
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
};

var draw_stop = function() {
	current_canvas.removeEventListener('mousemove', onPaint, false);
};

var draw_start = function(e) {
	var ctx = current_canvas.getContext('2d');
	ctx.beginPath();
	ctx.moveTo(mouse.x, mouse.y);
	current_canvas.addEventListener('mousemove', onPaint, false);
};

function updateMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
    mouse.x = evt.clientX - rect.left;
    mouse.y = evt.clientY - rect.top;
}
