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
var to_record = true;
var canvas_height = 700;
var canvas_width = 1000;
var delay = 0;
var pauseTime = 0
var ifpaused = false;
var mediaRecorder;
var recordTimeCounter;
var seconds = 0, minutes = 0, hours = 0; // For record Timer

function record_to_movements(entry){
	if(to_record){
		movements.push(entry);
	}
}

function startRecord(){
	t0 = performance.now();
	movements = new Array();
	startRecordingtimer();

	seconds = 0; minutes = 0; hours = 0;
	document.getElementById('recordingTime').style.display = "block";

	var button = document.getElementById("recordButton");
	button.innerHTML = "Stop Recording";
	button.onclick = stop_record;

	navigator.mediaDevices.getUserMedia({ audio: true })
		.then(stream => {
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
		});
}

function stop_record(){
	var button = document.getElementById("recordButton");
	button.innerHTML = "Start Recording";
	button.onclick = startRecord;

	document.getElementById('recordingTime').style.display = "none";

	clearTimeout(recordTimeCounter);
	if(mediaRecorder){
		mediaRecorder.stop();
	}
}

function download(audioBlob){
	var zip = new JSZip();
	var mouseBlob = getMouseBlob();
	zip.file("MouseMovements.txt",mouseBlob);
	zip.file("Audio.webm", audioBlob);
	zip.generateAsync({type:"blob",
					   compression: "DEFLATE",
    				   compressionOptions: {
                            level: 9
    				   }})
	.then(function(content) {
		saveAs(content, "LectureContent.zip");
	});
}

function getMouseBlob(){
	var toStore = JSON.stringify(movements);
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
	if(typeof current_canvas !== 'undefined'){
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

var onPaint = function(){
	var mousex = mouse.x;
    var mousey = mouse.y;
	var t1 = performance.now();
	var ctx = current_canvas.getContext('2d');
	ctx.lineTo(mousex, mousey);

    ctx.stroke();
	var move = {x: mousex, y: mouse.y, t:(t1-t0)};
    record_to_movements(move);
};

var draw_stop = function(){
	current_canvas.removeEventListener('mousemove', onPaint, false);
	current_canvas.removeEventListener('touchmove', onPaint, false);
};

var draw_start = function(e){
	var ctx = current_canvas.getContext('2d');
	ctx.beginPath();
	ctx.moveTo(mouse.x, mouse.y);
	var t1 = performance.now();
	var move = {x: mouse.x, y: mouse.y, t:(t1-t0), s:true};
    record_to_movements(move);
	current_canvas.addEventListener('mousemove', onPaint, false);

};

var draw_start_touch = function(e){
	var ctx = current_canvas.getContext('2d');
	updateTouchPos(e);
	ctx.beginPath();
	ctx.moveTo(mouse.x, mouse.y);
	var t1 = performance.now();
	var move = {x: mouse.x, y: mouse.y, t:(t1-t0), s:true};
	movements.push(move);
	current_canvas.addEventListener('touchmove', onPaint, false);
};

function updateMousePos(evt){
	var rect = current_canvas.getBoundingClientRect();
    mouse.x = evt.clientX - rect.left;
    mouse.y = evt.clientY - rect.top;
	$('#debug_elm').text(mouse.x + " " + mouse.y);
}

function updateTouchPos(evt){
	var rect = current_canvas.getBoundingClientRect();
    mouse.x = evt.changedTouches[0].clientX - rect.left;
	mouse.y = evt.changedTouches[0].clientY - rect.top;
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

function pause(){
	ifpaused = true;
	pauseTime = performance.now();
	var button = document.getElementById("controlButton");
	savedAudio.pause();
	button.onclick = unpause;
	button.innerHTML = 'Play';
}

function unpause(){
	delay +=  performance.now() - pauseTime;
	ifpaused = false;
	var button = document.getElementById("controlButton");
	savedAudio.play();
	button.onclick = pause;
	button.innerHTML = "Pause";
	globalID = requestAnimationFrame(replay);
}

function startReplay(){
	savedt0 = performance.now();
	var button = document.getElementById("controlButton");
	button.onclick = pause;
	button.innerHTML = "Pause";
	savedAudio.play();

	savedAudio.addEventListener("ended", function() {
		var button = document.getElementById("controlButton");
		button.onclick = "";
		button.innerHTML = "Recording finished";
	});

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

function handleFile(f){
	JSZip.loadAsync(f)
		.then(function(zip) {
			zip.forEach(function (relativePath, zipEntry) {
				if(relativePath == "MouseMovements.txt"){
					zipEntry.async("string")
						.then(function (mousemovement) {
							savedMovements = JSON.parse(mousemovement);
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
