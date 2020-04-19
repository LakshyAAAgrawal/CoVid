function init(){
	hide_error();
	display_loading_screen();
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

	//// To pop up notification when tab is closed
	window.onbeforeunload = function() {
		return ""
	}

	change_mode('rec');
	$("#right_scroll_bar").css("height", $(window).height() - (side_bar_width * 3 + 10));
	pButton = document.getElementById('pButton'); // play button
	playhead = document.getElementById('playhead'); // playhead
	timeline = document.getElementById('timeline'); // timeline
    pButton.addEventListener("click", startReplay);
    //timeline.addEventListener("click", timelineClicked,false);
    //playhead.addEventListener('mousedown', timelineSelected, false);
    //window.addEventListener('mouseup', timelineDeselected, false);
	hide_loading_screen();
}

init();
