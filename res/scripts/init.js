function init(){
	canvas_list = [];
	var initial_canvas = new_slide();
	set_current(initial_canvas);
	movements = new Array();
	t0 = 0;
	savedMovements =  new Array();
	savedt0 = performance.now();
	$('#upload_slides').on('change', handleFileSelect);
	$('#upload_recording').on('change', readUploadedfile);
	document.getElementById('recordingTime').style.display = "none";

	var slider = document.getElementById("pointerWidthRange");
	// Update the current slider value (each time you drag the slider handle)
	slider.oninput = function() {
		changePointerWidth(this.value);
	}
}

init();
