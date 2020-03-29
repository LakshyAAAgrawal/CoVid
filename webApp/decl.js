var current_canvas;
var canvas_dict = {};
var mouse = {x: 0, y: 0};
var num_slides = 0;

function new_slide(){
	var slide_id = "slide" + (num_slides++);
	var new_canvas = $('<canvas/>', {"style":"border: solid 5pt blue", "width":800, "height":600, "id":slide_id}).get(0);
	canvas_dict[slide_id] = new_canvas;
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
			set_current(slide_id);
		}
	);
	$("#slides_list").append(switch_btn);
	return slide_id;
}

function set_current(slide_id){
	if(typeof current_canvas !== 'undefined'){
		current_canvas.style.display = 'none';
		current_canvas.removeEventListener('mousemove', updateMousePos, false);
		current_canvas.removeEventListener('mousedown', draw_start, false);	
		current_canvas.removeEventListener('mouseup', draw_stop, false);
	}
	canvas_dict[slide_id].style.display = 'block';
	current_canvas = canvas_dict[slide_id];
	current_canvas.addEventListener('mousemove', updateMousePos, false);
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

function updateMousePos(evt) {
	var rect = current_canvas.getBoundingClientRect();
    mouse.x = evt.clientX - rect.left;
    mouse.y = evt.clientY - rect.top;
}
