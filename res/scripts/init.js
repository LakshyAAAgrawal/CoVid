function init(){
	canvas_list = [];
	window.addEventListener('resize', reset_canvas_dimension);
	reset_canvas_dimension();
	var initial_canvas = new_slide();
	set_current(initial_canvas);
	movements = new Array();
	t0 = 0;
    savedMovements =  new Array();
    playedSavedMovements = new Array();
	savedt0 = performance.now();
	$('#upload_slides').on('change', handleFileSelect);
	$('#upload_recording').on('change', readUploadedfile);
	document.getElementById('recordingTime').style.display = "none";

    // Update the current pointer width
	var slider = document.getElementById("pointerWidthRange");
	slider.oninput = function() {
		changePointerWidth(this.value);
	}
	change_mode('rec');
	$("#right_scroll_bar").css("height", $(window).height() - (side_bar_width * 3 + 10));
	pButton = document.getElementById('pButton'); // play button
	playhead = document.getElementById('playhead'); // playhead
	timeline = document.getElementById('timeline'); // timeline
    pButton.addEventListener("click", startReplay);

    // timeupdate event listener
    // makes timeline clickable
    timeline.addEventListener("click", function(event) {
        moveplayhead(event);
        console.log("duration",duration);
        console.log(clickPercent(event));
        mouserewindForward(savedAudio.seek(),duration*clickPercent(event));
        savedAudio.seek(duration*clickPercent(event));
    }, false);

    // makes playhead draggable
    playhead.addEventListener('mousedown', timelineSelected, false);
    window.addEventListener('mouseup', timelineDeselected, false);
}

init();
