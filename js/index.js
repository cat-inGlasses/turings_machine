
//	adding states
	let states_arr = [];		//	array with states
	let statesNames = [];		//	array of state names
	let statesQnt = 0;			//	quantity of states
	let rowNum = 0;				//	row number

//	processing
	let processedString = "";	//	remember last processed string
	let lastHalted = ["auto"];	//	last halted state	
	let inProcess = false;		//	identify if TM is in process

//	drawing states
	let draw_states = [];		//	array with drawn states
	let connectors = [];		//	array with drawn connectors
	// let lastCoords = [0,100];	//	set and initiate coordinates for current drawn states
	let initCoords = {
		x:40,
		y:40
	};	//	set and initiate coordinates for current drawn states
	let thisState = "";		//

//	Set states
	let startState = "auto";
	let haltState = "auto";
	$( "#start_state" ).change(function() {
		startState = $( "#start_state" ).val();
	});
	$( "#halt_state" ).change(function() {
		haltState = $( "#halt_state" ).val();
	});

//	set speed
	let speed = 500;
	$( "#speed" ).val(speed);
	$("#speed_val").text(speed/1000);
	$("#speed").on("input", function(e) {
		speed = parseInt($( e.target ).val());
		$("#speed_val").text(speed/1000);
	});

//	set delays
	let delay = 300;
	$( "#delay" ).val(delay);
	$("#delay_val").text(delay/1000);
	$("#delay").on("input", function(e) {
		delay = parseInt($( e.target ).val());
		$("#delay_val").text(delay/1000);
	});

let lastChangeCoord = "x"
function processCoords(){
	
	xShift = 70;
	yShift = 100;

	switch(lastChangeCoord){
		case "x":
			initCoords.y += yShift;
			initCoords.x += xShift;
			lastChangeCoord = "y";
		break;

		case "y":
			initCoords.y -= yShift;
			initCoords.x += xShift;
			lastChangeCoord = "x";
		break;
	}

	if( (parseInt($("#graph").width())-40) < (initCoords.x)){
		initCoords.x = 40;
		if(lastChangeCoord == "x")
			initCoords.y += 2*yShift;
		else
			initCoords.y += yShift;
	}

	if(parseInt($("#graph").height()-40) < (initCoords.y)){
		$("#graph").height(initCoords.y + 40);
	}

}

$(".add_btn").click(() => { 

	if(inProcess)
		return;

	//	read fields
		let stateName = $("#v_state_name").val();
		let read = $("#v_read").val().trim();
		let write = $("#v_write").val().trim();
		let moveTo = $("select[name=move_select]").val();
		let nextState = $("#v_next_state").val();
	
	//	check for empty field
		if( stateName == ""){
			$("#v_state_name").focus();
			return;
		}
		if( read == "" || read.length > 1){
			$("#v_read").focus();
			return;
		}
		if( write == "" || write.length > 1){
			$("#v_write").focus();
			return;
		}
		if( nextState == ""){
			$("#v_next_state").focus();
			return;
		}


	//	adding state names into array
		if( $.inArray( stateName, statesNames ) == -1){
			statesNames.push(stateName);
		}
		if( $.inArray( nextState, statesNames ) == -1){
			statesNames.push(nextState);
		}
	
	//	add new tow into the table
		addNewRow(stateName, read, write, moveTo, nextState, rowNum, startState, haltState);
		rowNum++;

	//	add states int array
		if(states_arr[stateName] == undefined){	//	new state
			states_arr[stateName] = [];
			states_arr[stateName][read] = [];
			states_arr[stateName][read]["write"] = write;
			states_arr[stateName][read]["moveTo"] = moveTo;
			states_arr[stateName][read]["nextState"] = nextState;
			states_arr[stateName]["halt"] = false;

			//	draw new State circle, if there is no such
				states_arr[stateName]["svgState"] = addStateCircle(initCoords.x, initCoords.y, stateName);
				processCoords();
		}else if(states_arr[stateName]["read"] == read){	//	error - the same read value
			$("#v_state_name").val("");
			$("#v_read").val("");
			$("#v_write").val("");
			$("#v_next_state").val("");
			return;
		}else{	//	new read value in existed state
			states_arr[stateName][read] = [];
			states_arr[stateName][read]["write"] = write;
			states_arr[stateName][read]["moveTo"] = moveTo;
			states_arr[stateName][read]["nextState"] = nextState;
			states_arr[stateName]["halt"] = false;
		}

	//	draw new State circle, if there is no such
		if(states_arr[nextState] == undefined){
			states_arr[nextState] = [];
		
			states_arr[nextState]["svgState"] = addStateCircle(initCoords.x, initCoords.y, nextState);
			processCoords();
		}
		const text = "" + read + "/" + write + " , " + moveTo;
		connetcStates(stateName, nextState, text);			

	//	reset all states input fields
		$("#v_state_name").val("");
		$("#v_read").val("");
		$("#v_write").val("");
		$("#v_next_state").val("");
});

function processing(enState){
	
	inProcess = enState;

	$(".add_new_state input").attr("disabled", enState);
	$(".add_new_state input").attr("disabled", enState);
	$(".add_new_state select").attr("disabled", enState);
	$(".states_table select").attr("disabled", enState);
	$("#process_string").attr("disabled", enState);
}

$(".process_btn").click(()=>{

	//	if machine is in process now  OR
	//	if there are no rows in table (states in array) 
	//	--> return
		if(inProcess || rowNum == 0){
			$("#v_state_name").focus();
			return;
		}

	//	if there is empty field AND
	//	if process sttring is the same as in placeholder
	//	--> STOP
		if($("#process_string").val().trim() == "" &&  processedString != $("#process_string").attr("placeholder")){
			$("#process_string").focus();
			return;
		}

	//	read startState and haltState
		let startState = $("#start_state").val();
		let haltState = $("#halt_state").val();
	
	//	reset haltState, if it was set
		if( lastHalted[0] != "auto" ){	
			states_arr[lastHalted[0]]["halt"] = false;
		}
	//	set new last Halted State
		lastHalted[0] = haltState;

	//	set halt state
		if( states_arr[haltState] != undefined ){
			states_arr[haltState]["halt"] = true;
		}else{
			states_arr[haltState] = [];
			states_arr[haltState]['halt'] = true;
		}

	//	colorize on graph
		if(statesActive.start != "")
			states_arr[statesActive.start].svgState[0].attr({fill: 'black'});
		
		if(statesActive.end != "")
			states_arr[statesActive.end].svgState[0].attr({fill: 'black'});

		if(statesActive.error != "")
			states_arr[statesActive.error].svgState[0].attr({fill: 'black'});
			
		statesActive.start = startState;
		statesActive.end =  haltState;
		statesActive.error =  "";
		states_arr[statesActive.start].svgState[0].attr({fill: '#ffcc00'});
		states_arr[statesActive.end].svgState[0].attr({fill: '#ff9933'});

	
	//	set processing string
		if( processedString != $("#process_string").attr("placeholder") || 
		( processedString != $("#process_string").val() && $("#process_string").val().trim() != "" ) ){
		
			processedString = $("#process_string").val().replace(/(\s*)/g, "");
			$("#process_string").attr("placeholder", processedString);
			$("#process_string").val("");
		}
	
	//	block inputs
		processing(true);

	//	fill the tape with processing string
		fillTape(processedString, startState);
});

$(".string_input").width($(".add_new_state").width())
$(".string_input").height($(".add_new_state").height())




