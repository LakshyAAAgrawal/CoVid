function init(){
	canvas_list = [];
	var initial_canvas = new_slide();
	set_current(initial_canvas);
	movements = new Array();
	t0 = performance.now();
	savedMovements =  new Array();
	savedt0 = performance.now();
}

init();
