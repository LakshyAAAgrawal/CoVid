// Jai Shree Ram

var current_canvas;
var canvas_dict = {};
var mouse = {x: 0, y: 0};
var num_slides = 0;
var movements = new Array();
var t0;
var savedMovements;
var savedAudio;
var savedt0;
var globalID;
var debug_count = 0;
var to_record = false;
var canvas_height = 700;
var canvas_width = 1000;
var delay = 0;
var pauseTime = 0
var ifpaused = false;
var mediaRecorder;
var recordTimeCounter;
var seconds = 0, minutes = 0, hours = 0; // For record Timer
var isSoundRecorded = true;
var isSoundinPlayback = false;   // true when sound is present is uploaded file


function record_to_movements(entry){
	if(to_record){
		movements.push(entry);
	}
}

function startRecord(){
	t0 = performance.now();
	to_record = true;
	movements = new Array();
	startRecordingtimer();

	seconds = 0; minutes = 0; hours = 0;
	document.getElementById('recordingTime').style.display = "block";
	document.getElementById('pauserecordButton').style.display = "block";

	var button = document.getElementById("recordButton");
	button.innerHTML = "Stop Recording";
	button.onclick = stop_record;

	navigator.mediaDevices.getUserMedia({ audio: true })
		.then(stream => {
			isSoundRecorded = true;
			document.getElementById('issoundRecorded').innerText = "";

			var options = {
				audioBitsPerSecond : 32000,
				mimeType : 'audio/webm;codecs=opus'
			  }
			mediaRecorder = new MediaRecorder(stream, options);
			mediaRecorder.start();

			const audioChunks = [];
			mediaRecorder.addEventListener("dataavailable", event => {
				audioChunks.push(event.data);
			});

			mediaRecorder.addEventListener("stop", () => {
				const audioBlob = new Blob(audioChunks, {type : 'audio/webm'});
				download(audioBlob);
			});
		})
		.catch(function(err) {
			document.getElementById('issoundRecorded').innerText = "Sound Not recorded";
			isSoundRecorded = false;
		  });

}

function stop_record(){
	var button = document.getElementById("recordButton");
	button.innerHTML = "Start Recording";
	button.onclick = startRecord;

	document.getElementById('pauserecordButton').style.display = "none";

	to_record = false;

	document.getElementById('recordingTime').style.display = "none";
	clearTimeout(recordTimeCounter);

	document.getElementById('issoundRecorded').innerText = "";

	if(isSoundRecorded && mediaRecorder){
		mediaRecorder.stop();
	}
	else{
		download();
	}
}

function pauseRecording(){
	var button = document.getElementById("pauserecordButton");
	button.innerHTML = "Resume Recording";
	button.onclick = resumeRecording;

	clearTimeout(recordTimeCounter);
	to_record = false;
	mediaRecorder.pause();
}

function resumeRecording(){

	var button = document.getElementById("pauserecordButton");
	button.innerHTML = "Pause Recording";
	button.onclick = pauseRecording;

	startRecordingtimer();
	to_record = true;
	mediaRecorder.resume();
}


// Make a zip and download
function download(audioBlob){
	var zip = new JSZip();
	var mouseBlob = getMouseBlob();
	zip.file("MouseMovements.txt",mouseBlob);

	if(typeof audioBlob !== "undefined"){
		zip.file("Audio.webm", audioBlob);
	}

	zip.generateAsync({type:"blob",
					   compression: "DEFLATE",
    				   compressionOptions: {
                            level: 9
    				   }})
	.then(function(content) {
		saveAs(content, "LectureContent.zip");
	});
}

/// To convert the movement array to store all valuse of one key in a list
/// PS mera sar dard ho raha hai
function convert_json_to_compressed_form(movementList){
	var t = new Array();
	var action = new Array();
	var action_param = new Array();

	movementList.forEach(function (item) {
		t.push(item['t']);
		action.push(item['action']);
		action_param.push(item['action_param']);
	  });

	var movementTosave = {};
	movementTosave['version'] = '1.0';
	movementTosave['t'] = t;
	movementTosave['action'] = action;
	movementTosave['action_param'] = action_param;
	return JSON.stringify(movementTosave);
}

function getMouseBlob(){
	var toStore = convert_json_to_compressed_form(movements);
	var file = new Blob([toStore], {type: 'text/plain'});
	return file
}

///// Update time counter block
//updateRecordTime updates the time counter when recording is on.
function updateRecordTime() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    recordingTime = document.getElementById('recordingTime'),
    recordingTime.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    startRecordingtimer();
}

function startRecordingtimer() {
    recordTimeCounter = setTimeout(updateRecordTime, 1000);
}
////////


function new_slide(){
	var slide_id = (num_slides++);
	var new_canvas = $('<canvas/>', {"style":"border: solid 5pt blue", "width":canvas_width, "height":canvas_height, "id":slide_id}).get(0);
	canvas_dict[slide_id] = new_canvas;
	$("#canvas_list").append(new_canvas);
	new_canvas.style.display = 'none';
	var ctx = new_canvas.getContext('2d');
	ctx.canvas.width = canvas_width;
	ctx.canvas.height = canvas_height;
	ctx.lineWidth = 3;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = '#00CC99';
	var switch_btn = $('<button/>').text("Slide " + slide_id).click(
		function () {
			set_current(slide_id);
		}
	);
	var li  = $('<li/>');
	li.append(switch_btn);
	$("#slides_list").append(li);

	var t1 = performance.now();
	record_to_movements({
		t: t1 - t0,
		action: "create_slide"
	});
	return slide_id;
}

function set_current(slide_id){
	var strokeStyle = '#00CC99';
	var lineWidth = 3;
	if(typeof current_canvas !== 'undefined'){

		ctx = current_canvas.getContext('2d');   /// To carry forward the same linewidth and
		strokeStyle = ctx.strokeStyle;			 /// color to next slide when the slide is changed
		lineWidth = ctx.lineWidth

		current_canvas.style.display = 'none';
		current_canvas.removeEventListener('mousemove', updateMousePos, false);
		current_canvas.removeEventListener('mousedown', draw_start, false);
		current_canvas.removeEventListener('mouseup', draw_stop, false);

		current_canvas.removeEventListener('touchmove', updateTouchPos, false);
		current_canvas.removeEventListener('touchstart', draw_start_touch, false);
		current_canvas.removeEventListener('touchend', draw_stop, false);
		current_canvas.removeEventListener('touchcancel', draw_stop, false);

		current_canvas.removeEventListener('touchmove', prevent_touch_move_callback, false);
		current_canvas.removeEventListener('touchstart', prevent_touch_move_callback, false);
		current_canvas.removeEventListener('touchend', prevent_touch_move_callback, false);
		current_canvas.removeEventListener('touchcancel', prevent_touch_move_callback, false);
	}

	canvas_dict[slide_id].style.display = 'block';
	current_canvas = canvas_dict[slide_id];

	ctx = current_canvas.getContext('2d');
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = strokeStyle;

	current_canvas.addEventListener('mousemove', updateMousePos, false);
	current_canvas.addEventListener('mousedown', draw_start, false);
	current_canvas.addEventListener('mouseup', draw_stop, false);

	current_canvas.addEventListener('touchmove', updateTouchPos, false);
	current_canvas.addEventListener('touchstart', draw_start_touch, false);
	current_canvas.addEventListener('touchend', draw_stop, false);
	current_canvas.addEventListener('touchcancel', draw_stop, false);

	current_canvas.addEventListener('touchmove', prevent_touch_move_callback, false);
	current_canvas.addEventListener('touchstart', prevent_touch_move_callback, false);
	current_canvas.addEventListener('touchend', prevent_touch_move_callback, false);
	current_canvas.addEventListener('touchcancel', prevent_touch_move_callback, false);

	var t1 = performance.now();
	record_to_movements({
		t: t1 - t0,
		action: "change_slide",
		action_param: [slide_id]
	});

	$('#debug_elm').text(mouse.x + " " + mouse.y);
}

function prevent_touch_move_callback(e){
	if (e.target == current_canvas) {
		e.preventDefault();
	}
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

// Called everytime there is a mouse movement and there is a need to draw
var onPaint = function(){

	var t1 = performance.now();
	var ctx = current_canvas.getContext('2d');
	drawPointer(mouse.x, mouse.y);

    record_to_movements({
		t:(t1-t0),
		action:'m', /// Stands for move
		action_param: [mouse.x,mouse.y]
	});
};

//Make a line from initial position to current position of mouse
function drawPointer(xCoordinate, yCoordinate){
	ctx.lineTo(xCoordinate, yCoordinate);
	ctx.stroke();
}

var draw_stop = function(){
	current_canvas.removeEventListener('mousemove', onPaint, false);
	current_canvas.removeEventListener('touchmove', onPaint, false);
};

var draw_start = function(e){
	var ctx = current_canvas.getContext('2d');

	movePointer(mouse.x, mouse.y);

	var t1 = performance.now();
    record_to_movements({
		t:(t1-t0),
		action:'movePointer',
		action_param: [mouse.x,mouse.y]
	});
	current_canvas.addEventListener('mousemove', onPaint, false);
};

var draw_start_touch = function(e){
	var ctx = current_canvas.getContext('2d');
	updateTouchPos(e);

	movePointer(mouse.x, mouse.y);
	var t1 = performance.now();
    record_to_movements({
		t:(t1-t0),
		action:'movePointer',
		action_param: [mouse.x,mouse.y]
	});
	current_canvas.addEventListener('touchmove', onPaint, false);
};

function updateMousePos(evt){
	var rect = current_canvas.getBoundingClientRect();
    mouse.x = evt.clientX - rect.left;
    mouse.y = evt.clientY - rect.top;
}

function updateTouchPos(evt){
	var rect = current_canvas.getBoundingClientRect();
    mouse.x = evt.changedTouches[0].clientX - rect.left;
	mouse.y = evt.changedTouches[0].clientY - rect.top;
}

function movePointer(xCoordinate, yCoordinate){
	ctx.beginPath();
	ctx.moveTo(xCoordinate, yCoordinate);
}

// Get a movement and simulate a particular movement
function updateMovement(){
    var curmove = savedMovements.shift();
	var ctx = current_canvas.getContext('2d');
    if (curmove.action == "movePointer"){
		movePointer.apply(this, curmove.action_param)
    }else if('action' in curmove &&
			curmove.action == "create_slide"){
		new_slide();
	}else if('action' in curmove &&
			 curmove.action == "change_slide"){
		set_current.apply(this, curmove.action_param);
	}else if('action' in curmove &&
			 curmove.action == "change_color"){
		change_color.apply(this, curmove.action_param);
	}else if('action' in curmove &&
			 curmove.action == "changePointerWidth"){
		changePointerWidth.apply(this, curmove.action_param);
	}else{
		drawPointer.apply(this, curmove.action_param)
    }
}

function pause(){
	ifpaused = true;
	pauseTime = performance.now();
	var button = document.getElementById("controlButton");
	if (isSoundinPlayback) {savedAudio.pause();}
	button.onclick = unpause;
	button.innerHTML = 'Play';
}

function unpause(){
	delay +=  performance.now() - pauseTime;
	ifpaused = false;
	var button = document.getElementById("controlButton");
	if (isSoundinPlayback) {savedAudio.play();}
	button.onclick = pause;
	button.innerHTML = "Pause";
	globalID = requestAnimationFrame(replay);
}

function startReplay(){
	savedt0 = performance.now();
	var button = document.getElementById("controlButton");
	button.onclick = pause;
	button.innerHTML = "Pause";
	if (isSoundinPlayback) {
		savedAudio.play();
		savedAudio.addEventListener("ended", function() {
			var button = document.getElementById("controlButton");
			button.onclick = "";
			button.innerHTML = "Recording finished";
		});
	}
	else{
		document.getElementById("issoundpresent").innerHTML = "Sound not present in uploaded file";
	}

	globalID = requestAnimationFrame(replay);

}

function replay(){
    if(savedMovements.length>0 && ifpaused == false){
		var currentT = performance.now();
		var temp = currentT - savedt0 - delay;
		if (savedMovements[0].t < temp){
			updateMovement();
		}
		globalID = requestAnimationFrame(replay);
	}
	else if(savedMovements.length == 0 && isSoundinPlayback == false){
		var button = document.getElementById("controlButton");
		button.onclick = "";
		button.innerHTML = "Recording finished";

		document.getElementById("issoundpresent").innerHTML = "";

	}
}

function readUploadedfile(evt){
	var button = document.getElementById("controlButton");
	button.onclick = startReplay;
	button.innerHTML = "Replay";
	button.style.display = 'block';

	var files = evt.target.files;
    for (var i = 0, f; f = files[i]; i++) {
        handleFile(files[i]);
    }
}

///// Unpack JSON into the desired format
function parse_saved_json_to_usable_format(mousemovement){
	movementJSON = JSON.parse(mousemovement)
	var movementList = new Array();
	var tList = movementJSON['t'];
	var actionList = movementJSON['action'];
	var actionParamList = movementJSON['action_param'];

	while(tList.length>0){
		var curmove = {}
		curmove['t'] = tList.shift();
		curmove['action'] = actionList.shift();
		curmove['action_param'] = actionParamList.shift();
		movementList.push(curmove)
	}

	return movementList;
}

function handleFile(f){
	JSZip.loadAsync(f)
		.then(function(zip) {
			zip.forEach(function (relativePath, zipEntry) {
				if(relativePath == "MouseMovements.txt"){
					zipEntry.async("string")
						.then(function (mousemovement) {
							savedMovements = parse_saved_json_to_usable_format(mousemovement);
						})

				}else{
					zipEntry.async("base64")
						.then(function(zip) {

							var clipContainer = document.createElement('article');
							savedAudio = document.createElement('audio');
							var deleteButton = document.createElement('button');
							var soundClips = document.querySelector('.sound-clips');

							clipContainer.classList.add('clip');
							savedAudio.setAttribute('controls', '');
							clipContainer.appendChild(savedAudio);
							soundClips.appendChild(clipContainer);

							savedAudio.controls = false;
							var blob = b64toBlob(zip, 'audio/webm;codecs=opus');
							chunks = [];
							var audioURL = URL.createObjectURL(blob);
							savedAudio.src = audioURL;
							isSoundinPlayback = true;
						})
				}
			});
		}, function (e) {
			console.log(e.message);
		});
}

function handleFileSelect(evt){
    var files = evt.target.files;
    for (var i = 0, f; f = files[i]; i++) {
		if (f.type.match('image.*')) {
			var reader = new FileReader();
			reader.addEventListener("load", function(e) {
				var image = new Image();
				image.src = e.target.result;
				image.onload = function(){
					var tmp = to_record;
					to_record = false;
					new_slide_id = new_slide();
					to_record = tmp;
					canvas_dict[new_slide_id].getContext('2d').drawImage(image, 0, 0, canvas_width, canvas_height);
				}
			}, false);
			reader.readAsDataURL(f);
		}else if(f.type == "application/pdf"){
			var reader = new FileReader();
			reader.addEventListener("load", function(e) {
				var pdfData = atob(e.target.result.slice(e.target.result.search(";base64,") + 8));
				var pdfjsLib = window['pdfjs-dist/build/pdf'];
				var loadingTask = pdfjsLib.getDocument({data: pdfData});
				loadingTask.promise.then(function(pdf) {
					var pageNumber = 1;
					for(var i = 1; i <= pdf.numPages; i++){
						pdf.getPage(i).then(function(page) {
							var scale = 1;
							var unscaledViewport = page.getViewport({scale: scale});
							canvas = canvas_dict[new_slide()];
							var r_scale = Math.min((canvas_height / unscaledViewport.height), (canvas_width / unscaledViewport.width));
							var viewport = page.getViewport({scale : r_scale});
							var context = canvas.getContext('2d');
							var renderContext = {
								canvasContext: context,
								viewport: viewport
							};
							var renderTask = page.render(renderContext);
							renderTask.promise.then(function () {
							});
						});
					}
				}, function (reason) {
				});

			}, false);
			reader.readAsDataURL(f);
		}
    }
}

function exportPDF(){
	var doc = new jsPDF('l');

	for(var index in canvas_dict){
		var imgData = canvas_dict[index].toDataURL('image/png');
		doc.addImage(imgData, 'PNG', 0, 0);
		doc.addPage();
	}

	doc.save('sample-file.pdf');
}

const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

function changePointerWidth(width){
	var t1 = performance.now();
	record_to_movements({
		t: t1 - t0,
		action: "changePointerWidth",
		action_param: [width]
	});

	var ctx = current_canvas.getContext('2d');
	ctx.lineWidth = width;
}

//// To pop up notification when tab is closed
window.onbeforeunload = function() {
	return "Are you Sure?"
}