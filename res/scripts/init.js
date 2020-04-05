function init(){
	canvas_list = [];
	window.addEventListener('resize', reset_canvas_dimension);
	reset_canvas_dimension();
	var initial_canvas = new_slide();
	set_current(initial_canvas);
	movements = new Array();
	t0 = 0;
	savedMovements =  new Array();
	savedt0 = performance.now();
	$('#upload_slides').on('change', handleFileSelect);
	$('#upload_recording').on('change', readUploadedfile);
	change_mode('view');
	$("#right_scroll_bar").css("height", $(window).height() - (side_bar_width * 3 + 10));
	console.log($(window).height() - (side_bar_width * 3 + 10));
}

init();
