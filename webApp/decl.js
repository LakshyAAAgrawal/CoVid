// Jai Shree Ram

var current_canvas;
var canvas_dict = {};
var mouse = {x: 0, y: 0};
var num_slides = 0;
var movements = new Array();
var t0;
var savedMovements;
var savedt0;
var globalID;
var debug_count = 0;
var to_record = true;

function record_to_movements(entry){
	if(to_record){
		movements.push(entry);
	}
}

function startRecord(){
	t0 = performance.now();
	movements = new Array();
}

function new_slide(){
	var slide_id = (num_slides++);
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
	var switch_btn = $('<button/>').text("Slide " + slide_id).click(
		function () {
			set_current(slide_id);
		}
	);

	$("#slides_list").append(switch_btn);

	var t1 = performance.now();
	record_to_movements({
		t: t1 - t0,
		action: "create_slide"
	});
	return slide_id;
}

function set_current(slide_id){
	if(typeof current_canvas !== 'undefined'){
		current_canvas.style.display = 'none';
		current_canvas.removeEventListener('mousemove', updateMousePos, false);
		current_canvas.removeEventListener('mousedown', draw_start, false);
		current_canvas.removeEventListener('mouseup', draw_stop, false);

		//current_canvas.removeEventListener('touchmove', updateMousePos, false);
		//current_canvas.removeEventListener('touchstart', draw_start, false);	
		//current_canvas.removeEventListener('touchend', draw_stop, false);
	}
	canvas_dict[slide_id].style.display = 'block';
	current_canvas = canvas_dict[slide_id];
	current_canvas.addEventListener('mousemove', updateMousePos, false);
	current_canvas.addEventListener('mousedown', draw_start, false);
	current_canvas.addEventListener('mouseup', draw_stop, false);

	//current_canvas.addEventListener('touchmove', updateMousePos, false);
	//current_canvas.addEventListener('touchstart', draw_start, false);	
	//current_canvas.addEventListener('touchend', draw_stop, false);

	var t1 = performance.now();
	record_to_movements({
		t: t1 - t0,
		action: "change_slide",
		action_param: [slide_id]
	});
	
	$('#debug_elm').text(mouse.x + " " + mouse.y);
}

function change_slide(increment){
	var new_slide_id = parseInt(current_canvas.id) + increment;
	if(new_slide_id>=0 && new_slide_id<num_slides ){
		set_current(new_slide_id);
	}
}

function change_color(color){
	var t1 = performance.now();
	record_to_movements({
		t: t1 - t0,
		action: "change_color",
		action_param: [color]
	});
	current_canvas.getContext('2d').strokeStyle = color;
}

var onPaint = function() {
	var mousex = mouse.x;
    var mousey = mouse.y;
	var t1 = performance.now();
	var ctx = current_canvas.getContext('2d');
    ctx.lineTo(mousex, mousey);
    ctx.stroke();
	var move = {x: mousex, y: mouse.y, t:(t1-t0)};
    record_to_movements(move);
};

var draw_stop = function() {
	current_canvas.removeEventListener('mousemove', onPaint, false);
};

var draw_start = function(e) {
	var ctx = current_canvas.getContext('2d');
	ctx.beginPath();
	ctx.moveTo(mouse.x, mouse.y);
	var t1 = performance.now();
	var move = {x: mouse.x, y: mouse.y, t:(t1-t0), s:true};
    record_to_movements(move);
	current_canvas.addEventListener('mousemove', onPaint, false);
};

function updateMousePos(evt) {
	var rect = current_canvas.getBoundingClientRect();
    mouse.x = evt.clientX - rect.left;
    mouse.y = evt.clientY - rect.top;
	$('#debug_elm').text(mouse.x + " " + mouse.y);
}

function download(name, type) {
    var a = document.getElementById("a");
    var toStore = JSON.stringify( movements );
    a.style.display = "block";
    var file = new Blob([toStore], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
}

function updateMovement(){
    var curmove = savedMovements.shift();
	var ctx = current_canvas.getContext('2d');
    if ('s' in curmove){
		//mouseSimulate(curmov.x,curmov.y,"mousedown")
		ctx.beginPath();
		ctx.moveTo(curmove.x, curmove.y);
    }else if('action' in curmove &&
			 curmove.action == "create_slide"){
		new_slide();
	}else if('action' in curmove &&
			 curmove.action == "change_slide"){
		set_current.apply(this, curmove.action_param);
	}else if('action' in curmove &&
			 curmove.action == "change_color"){
		change_color.apply(this, curmove.action_param);
	}else{
		//mouseSimulate(curmov.x,curmov.y,"mousemove")
		ctx.lineTo(curmove.x, curmove.y);
		ctx.stroke();
    }
}

function startReplay(){
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

function read_and_upload_file(){
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

function handleFileSelect(evt) {
    var files = evt.target.files;	
    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {
		
		// Only process image files.
		if (!f.type.match('image.*')) {
			continue;
		}
		
		var reader = new FileReader();
		
		// Closure to capture the file information.
		reader.addEventListener("load", function(e) {
			var image = new Image();
			image.src = e.target.result;
			image.onload = function(){
				var tmp = to_record;
				to_record = false;
				new_slide_id = new_slide();
				to_record = tmp;
				canvas_dict[new_slide_id].getContext('2d').drawImage(image, 0, 0, 800, 600);
			}
		}, false);
		
		// Read in the image file as a data URL.
		reader.readAsDataURL(f);
    }
}
