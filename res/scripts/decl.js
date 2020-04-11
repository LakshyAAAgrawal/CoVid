// Jai Shree Ram

var current_canvas;
var current_back_canvas;
var canvas_dict = {};
var mouse = {x: 0, y: 0};
var num_slides = 0;
var movements = new Array();
var t0;
var savedMovements;
var playedSavedMovements;
var savedAudio;
var savedt0;
var globalID;
var debug_count = 0;
var to_record = false;
var side_bar_width = 75;
var canvas_height = 900;
var canvas_width = 1600;
var delay = 0;
var pauseTime = 0;
var ifpaused = false;
var mediaRecorder;
var recordTimeCounter;
var seconds = 0, minutes = 0, hours = 0; // For record Timer
var isSoundRecorded = true;
var isSoundinPlayback = false;   // true when sound is present is uploaded file
var current_mode = "view";
var isTimelineUpdated;
var isrecordingMode = true;   /// Default is recording
var duration;
var pButton; // play button
var playhead ; // playhead
var timeline; // timeline
// timeline width adjusted for playhead
var timelineWidth;
// Boolean value so that audio position is updated only when the playhead is released
var onplayhead = false;


function record_to_movements(entry){
	if(to_record){
		movements.push(entry);
	}
}

function change_mode(target){
	if(target === "view"){
		$(".left_bar").css("display", "none");
		$(".right_bar").css("display", "none");
		$(".rec").css("display", "none");
		$(".view").css("display", "block");
		current_mode = "view";
		$("#view_mode_button").css("background", "blue");
		$("#rec_mode_button").css("background", "white");
		$(".bottom_bar").css("right", "20px");
		$(".bottom_bar").css("left", "20px");
		isrecordingMode = false;
		removeEventFromcanvas(current_canvas);

	}else if(target === "rec"){
		$(".view").css("display", "none");
		$(".rec").css("display", "block");
		$(".left_bar").css("display", "block");
		$(".right_bar").css("display", "block");
		current_mode = "rec";
		$("#rec_mode_button").css("background", "blue");
		$("#view_mode_button").css("background", "white");
		$(".bottom_bar").css("right", "80px");
		$(".bottom_bar").css("left", "80px");
		isrecordingMode = true;
		addEventListenertoCanvas(current_canvas);
	}
	reset_canvas_dimension();
}

function reset_canvas_dimension(e){

	var max_canvas_width = 0;
	if(current_mode == "rec"){
		max_canvas_width = $(window).width() - (2*side_bar_width + 10);
	}else{
		max_canvas_width = $(window).width() - 10;
	}
	var max_canvas_height = $(window).height() - (side_bar_width + 20);
	var canvas_scale = Math.min((max_canvas_height / canvas_height), (max_canvas_width / canvas_width));
	canvas_width = Math.floor(canvas_width * canvas_scale);
	canvas_height = Math.floor(canvas_height * canvas_scale);
	if(typeof current_canvas !== 'undefined'){
		var strokeStyle = current_canvas.getContext('2d').strokeStyle;
		var lineCap = current_canvas.getContext('2d').lineCap;
		var lineJoin = current_canvas.getContext('2d').lineJoin;
		var lineWidth = current_canvas.getContext('2d').lineWidth;

		var img = new Image();
		img.src = current_canvas.toDataURL();
		img.onload = function(){

			current_canvas.height = canvas_height;
			current_canvas.width = canvas_width;
			current_canvas.style.height = canvas_height.toString() + "px";
			current_canvas.style.width = canvas_width.toString() + "px";
			current_canvas.getContext('2d').drawImage(img, 0, 0, canvas_width, canvas_height);

			var ctx = current_canvas.getContext('2d');
			ctx.lineWidth = lineWidth;
			ctx.lineJoin = lineJoin;
			ctx.lineCap = lineCap;
			ctx.strokeStyle = strokeStyle;
		}

		var backimg = new Image();
		backimg.src = current_back_canvas.toDataURL();
		backimg.onload = function(){
			current_back_canvas.height = canvas_height;
			current_back_canvas.width = canvas_width;
			current_back_canvas.style.height = canvas_height.toString() + "px";
			current_back_canvas.style.width = canvas_width.toString() + "px";
			current_back_canvas.getContext('2d').drawImage(backimg, 0, 0, canvas_width, canvas_height);
		}

	}
}

function startRecord(){
	to_record = true;
	movements = new Array();
	startRecordingtimer();
	record_to_movements({
		t: -1,
		action: "change_slide",
		action_param: [current_canvas.id]
	});
	record_to_movements({
		t: -1,
		action: "change_color",
		action_param: [current_canvas.getContext('2d').strokeStyle]
	});

	record_to_movements({
		t: -1,
		action: "changePointerWidth",
		action_param: [current_canvas.getContext('2d').lineWidth]
	});

	seconds = 0; minutes = 0; hours = 0;
	document.getElementById('recordingTime').style.display = "inline-block";
	document.getElementById('pauserecordButton').style.display = "inline-block";

	var button = document.getElementById("recordButton");
	button.setAttribute("src", "res/images/stop_recording.svg");
	button.onclick = stop_record;
	t0 = performance.now();
	navigator.mediaDevices.getUserMedia({ audio: true })
		.then(stream => {
			isSoundRecorded = true;
			document.getElementById('issoundRecorded').innerText = "";

			var options = {
				audioBitsPerSecond : 32000,
				mimeType : 'audio/webm;codecs=opus'
			}

			t0 = performance.now();

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
			t0 = performance.now();
		});

}

function stop_record(){
	var button = document.getElementById("recordButton");
	button.setAttribute("src", "res/images/start_recording.svg")
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
	return file;
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
    recordingTime = document.getElementById('recordingTime');
    recordingTime.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    startRecordingtimer();
}

function startRecordingtimer() {
    recordTimeCounter = setTimeout(updateRecordTime, 1000);
}
////////


function new_slide(){
	var slide_id = (num_slides++);

	var new_canvas = $('<canvas/>', { "id":slide_id, "z-index": 1,"width":canvas_width, "height":canvas_height, "class":"canvas_instance"}).get(0);
	var new_canvas_back = $('<canvas/>', {"id":"back"+slide_id, "z-index": 0,"width":canvas_width, "height":canvas_height, "class":"canvas_instance"}).get(0);

	$(new_canvas).css("margin", "auto");
	$(new_canvas_back).css("margin", "auto");

	canvas_dict[slide_id] = { "front_canvas": new_canvas,
							"back_canvas": new_canvas_back
						};
	$("#canvas_list").append(new_canvas_back);
	$("#canvas_list").append(new_canvas);


	new_canvas.style.display = 'none';
	new_canvas_back.style.display = 'none';

	var ctx = new_canvas.getContext('2d');
	ctx.globalCompositeOperation = "source-over";
	ctx.canvas.width = canvas_width;
	ctx.canvas.height = canvas_height;

	var back_ctx = new_canvas_back.getContext('2d');
	back_ctx.canvas.width = canvas_width;
	back_ctx.canvas.height = canvas_height;

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
		action: "create_slide",
		action_param: []
	});
	return slide_id;
}

//Sets the current slide to a specific slide id

function removeEventFromcanvas(current_canvas){
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

function addEventListenertoCanvas(current_canvas){
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
}


function set_current(slide_id){
	var strokeStyle = '#00CC99';
	var lineWidth = 3;
	if(typeof current_canvas !== 'undefined'){

		ctx = current_canvas.getContext('2d');   /// To carry forward the same linewidth and
		strokeStyle = ctx.strokeStyle;			 /// color to next slide when the slide is changed
		lineWidth = ctx.lineWidth

		current_canvas.style.display = 'none';
		current_back_canvas.style.display = 'none';

		if(isrecordingMode){
			removeEventFromcanvas(current_canvas);
		}
	}

	//Create slides if not present
	while(slide_id >= num_slides){
		new_slide();
	}

	current_canvas = canvas_dict[slide_id]['front_canvas'];
	current_back_canvas = canvas_dict[slide_id]['back_canvas'];
	current_canvas.style.display = 'block';
	current_back_canvas.style.display = 'block'

	ctx = current_canvas.getContext('2d');
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = strokeStyle;
	reset_canvas_dimension();
	if(isrecordingMode){
		addEventListenertoCanvas(current_canvas);
	}

	setPen();
	var t1 = performance.now();
	record_to_movements({
		t: t1 - t0,
		action: "change_slide",
		action_param: [slide_id]
	});
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
	setPen();
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
	drawPointer(mouse.x/canvas_width, mouse.y/canvas_height);
    record_to_movements({
		t:(t1-t0),
		action:'m', /// Stands for move
		action_param: [mouse.x/canvas_width, mouse.y/canvas_height]
	});
};

//Make a line from initial position to current position of mouse
function drawPointer(xCoordinate, yCoordinate){
	var ctx = current_canvas.getContext('2d');
	ctx.lineTo(xCoordinate*canvas_width, yCoordinate*canvas_height);
	ctx.stroke();
}

var draw_stop = function(){
	current_canvas.removeEventListener('mousemove', onPaint, false);
	current_canvas.removeEventListener('touchmove', onPaint, false);
};

var draw_start = function(e){

	movePointer(mouse.x/canvas_width, mouse.y/canvas_height);

	var t1 = performance.now();
    record_to_movements({
		t:(t1-t0),
		action:'movePointer',
		action_param: [mouse.x/canvas_width, mouse.y/canvas_height]
	});
	current_canvas.addEventListener('mousemove', onPaint, false);
};

var draw_start_touch = function(e){
	updateTouchPos(e);
	movePointer(mouse.x/canvas_width, mouse.y/canvas_height);
	var t1 = performance.now();
    record_to_movements({
		t:(t1-t0),
		action:'movePointer',
		action_param: [mouse.x/canvas_width, mouse.y/canvas_height]
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
	var ctx = current_canvas.getContext('2d');
	ctx.beginPath();
	ctx.moveTo(xCoordinate*canvas_width, yCoordinate*canvas_height);
}

////////////////////////////////////////////////
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
					canvas_dict[new_slide_id]['back_slide'].getContext('2d').drawImage(image, 0, 0, canvas_width, canvas_height);
					//document.getElementById(new_slide_id).style.backgroundImage = "url(" + image.src +")";
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
							var new_slide_id = new_slide();
							var canvas = canvas_dict[new_slide_id]['back_canvas'];
							var r_scale = Math.min((canvas_height / unscaledViewport.height), (canvas_width / unscaledViewport.width));
							var viewport = page.getViewport({scale : r_scale});
							var context = canvas.getContext('2d');
							var renderContext = {
								canvasContext: context,
								viewport: viewport
							};
							var renderTask = page.render(renderContext);
							/*
							For eraser
							renderTask.promise.then(function () {
								/// Convert canvas to image and put it in background to make it non erasable by eraser
								var imgData = canvas.toDataURL('image/png');
								canvas.getContext('2d').clearRect(0, 0, canvas_width, canvas_height);
								document.getElementById(new_slide_id).style.backgroundImage = "url(" + imgData +")";
							});
							*/
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
	//var width = doc.internal.pageSize.getWidth();
	//var height = doc.internal.pageSize.getHeight();
	for(var index in canvas_dict){
		doc.addPage(canvas_width,canvas_height);
		canvas_dict[index]['back_canvas'].getContext('2d').drawImage(canvas_dict[index]['front_canvas'], 0, 0, canvas_width, canvas_height);
		var slideImage = canvas_dict[index]['back_canvas'].toDataURL('image/jpeg',1);
		doc.addImage(slideImage, 'JPEG',0,0,canvas_width, canvas_height);

	}

	doc.save('LecturePDF.pdf');
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
	return "Eak bar punha vichar kare"
}

///For eraser extension
function setEraser(){
	current_canvas.getContext("2d").globalCompositeOperation = "destination-out";
}

function setPen(){
	current_canvas.getContext("2d").globalCompositeOperation = "source-over";
}


//////////////////////////////////   Viewer Mode

////// Uploaded Recorded Lecture
function handleFile(f){
	JSZip.loadAsync(f)
		.then(function(zip) {
			zip.forEach(function (relativePath, zipEntry) {
				if(relativePath == "MouseMovements.txt"){
					document.getElementById('audioplayer').style.display = "inline-block";
					zipEntry.async("string")
						.then(function (mousemovement) {
							savedMovements = parse_saved_json_to_usable_format(mousemovement);
							timelineWidth = timeline.offsetWidth - playhead.offsetWidth;
						});
				}else{
					document.getElementById('audioplayer').style.display = "none";
					zipEntry.async("base64")
						.then(function(zip) {
							var blob = b64toBlob(zip, 'audio/webm;codecs=opus');
							chunks = [];
							var audioURL = URL.createObjectURL(blob);
							isSoundinPlayback = true;

							savedAudio = new Howl({
								src: [audioURL],
								format: ['webm']
							  });

							savedAudio.once('load', function(){
								duration = savedAudio._duration;
								document.getElementById('audioplayer').style.display = "inline-block";
								timelineWidth = timeline.offsetWidth - playhead.offsetWidth;
							  });

						})
				}
			});
		}, function (e) {
			console.log(e.message);
		});
}

function readUploadedfile(evt){

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

// To replay the mouse movements
function replay(){
    if(savedMovements.length>0 && ifpaused == false){
		var currentT = performance.now();
		var temp = currentT - savedt0 - delay;
		if (savedMovements[0].t < temp){
			var curmove = savedMovements.shift();
			playedSavedMovements.push(curmove);
			updateMovement(curmove);
		}
		globalID = requestAnimationFrame(replay);
	}
	else if(savedMovements.length == 0 && isSoundinPlayback == false){
		document.getElementById("issoundpresent").innerHTML = "";

	}
}

// Get a movement and simulate a particular movement
function updateMovement(curmove){
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
	}
	else{
		drawPointer.apply(this, curmove.action_param)
    }
}

////////////////////////////// Replay Timeline
// mouseDown EventListener
function timelineSelected() {
    onplayhead = true;
    window.addEventListener('mousemove', moveplayhead, true);
}

// mouseUp EventListener
// getting input from all mouse clicks
function timelineDeselected(event) {
    if (onplayhead == true) {
        moveplayhead(event);
		window.removeEventListener('mousemove', moveplayhead, true);
		if(isSoundinPlayback){
			var currTime = savedAudio.seek();
			savedAudio.seek(duration*clickPercent(event));
			mouserewindForward(currTime,duration*clickPercent(event));
		}
		else{
			var temp = getCurrenttimeofMouseMovement();
			mouserewindForward(temp, duration*clickPercent(event));
		}


    }
    onplayhead = false;
}

function timelineClicked(event) {
	moveplayhead(event);
	if(isSoundinPlayback){
		var currTime = savedAudio.seek();
		savedAudio.seek(duration*clickPercent(event));
		mouserewindForward(currTime,duration*clickPercent(event));
	}
	else{
		var temp = getCurrenttimeofMouseMovement();
		mouserewindForward(temp, duration*clickPercent(event));
	}
}

// mousemove EventListener
// Moves playhead as user drags
function moveplayhead(event) {
    var newMargLeft = event.clientX - getPosition(timeline);
    if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
        playhead.style.marginLeft = newMargLeft + "px";
    }
    if (newMargLeft < 0) {
        playhead.style.marginLeft = "0px";
    }
    if (newMargLeft > timelineWidth) {
        playhead.style.marginLeft = timelineWidth + "px";
    }
}

function getCurrenttimeofMouseMovement(){
	var temp = performance.now() - savedt0 - delay;
	return temp/1000;
}
// timeUpdate
// Synchronizes playhead position with current point in audio
function timeUpdate() {
	var curTime;
	if(isSoundinPlayback){
		curTime = savedAudio.seek();
	}
	else{
		curTime = getCurrenttimeofMouseMovement();
	}

	var playPercent = timelineWidth * (curTime / duration);
	playhead.style.marginLeft = playPercent + "px";

	if (curTime >= duration) {
		pButton.className = "";
		pButton.className = "play";
		pButton.addEventListener("click", startReplay);
		pButton.removeEventListener("click", playPauserecording);
		savedMovements = playedSavedMovements;
	}
	else{
		requestAnimationFrame(timeUpdate);
	}
}

function timelineupdate() {
	requestAnimationFrame(timeUpdate);
}

function startReplay() {
	pButton.removeEventListener("click", startReplay);
	pButton.addEventListener("click", playPauserecording);
	savedt0 = performance.now();
	delay = 0;
	timelineupdate();
	pButton.className = "pause";
	if (isSoundinPlayback) {
		savedAudio.play();
		syncAudioMouseCall();
	}
	else{
		duration = savedMovements[savedMovements.length - 1]['t']/1000;
		document.getElementById("issoundpresent").innerHTML = "Sound not present";
	}
	globalID = requestAnimationFrame(replay);
}


function playPauserecording() {
	if (ifpaused) {  // remove pause, add play
		if (isSoundinPlayback) { savedAudio.play();}
        pButton.className = "";
		pButton.className = "pause";
		ifpaused = false;
		globalID = requestAnimationFrame(replay);
	}
	else { // pause music
		if (isSoundinPlayback) { savedAudio.pause();}
		ifpaused = true;
        pButton.className = "";
		pButton.className = "play";
	}
}

function getPosition(el) {
    return el.getBoundingClientRect().left;
}

function clickPercent(event) {
    return (event.clientX - getPosition(timeline)) / timelineWidth;
}


function mouserewindForward(currentTime, newtime){
	timeline.removeEventListener("click", timelineClicked,false);
	var toChange = false;
	if(isSoundinPlayback && ifpaused == false){
		toChange = true;
		ifpaused = true;
		savedAudio.pause();
		syncAudioMouse(true);
	}

	if(currentTime>newtime){
		rewind(newtime*1000);
	}
	else{
		forward((newtime-currentTime)*1000);
	}
	timeline.addEventListener("click", timelineClicked,false);
	if(toChange){
		ifpaused = false;
		savedAudio.play();
	}

}

function forward(time){
	//delay -= time;
	while(savedMovements.length>0){
		var currentT = performance.now();
		var temp = currentT - savedt0 - delay;
		if (savedMovements[0].t < temp){
			var curmove = savedMovements.shift();
			playedSavedMovements.push(curmove);
			updateMovement(curmove);
		}
		else{
			break;
		}
	}
}

function clearEverything(){
	for (var k in canvas_dict) {
		canvas_dict[k]['front_canvas'].getContext('2d').clearRect(0,0,canvas_width,canvas_height);
	}
}

function switch_canvas_for_replay(new_slide_id){
	var ctx = current_canvas.getContext('2d');
	var lineWidth = ctx.lineWidth;
	var strokeStyle = ctx.lineWidth;
	current_canvas = canvas_dict[new_slide_id]['front_canvas'];
	ctx = current_canvas.getContext('2d');
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = strokeStyle;
}

function rewind(time){
	clearEverything();
	var i = 0;
	var last_slide_to_display;
	var curCanvasID = current_canvas.id;
	while(i<playedSavedMovements.length){

		var curmove = playedSavedMovements[i];
		if(curmove['t']<time){

			if('action' in curmove &&
					 curmove.action == "create_slide"){
						////Nothing
			}else if('action' in curmove &&
					 curmove.action == "change_slide"){

						switch_canvas_for_replay(curmove.action_param[0])
						last_slide_to_display = curmove.action_param[0];
			}
			else{
				updateMovement(curmove);
			}
		}
		else{
			break;
		}
		i += 1;
	}

	while(i!= playedSavedMovements.length){
		var curmove = playedSavedMovements.pop();
		if (curmove.action !== "create_slide") {savedMovements.unshift(curmove);}
	}

	switch_canvas_for_replay(curCanvasID);
	set_current(last_slide_to_display);		// Set the final slide to display
}

function syncAudioMouse(toRepet){
	var temp = performance.now() - savedt0 - delay;
	var currAudio = savedAudio.seek()*1000;

	if(temp!=currAudio){
		delay = delay + temp - currAudio;
	}

	if(toRepet == undefined){
		syncAudioMouseCall();
	}

}

function syncAudioMouseCall(){
	setTimeout(syncAudioMouse, 1000);
}
