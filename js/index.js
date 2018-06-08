
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
	$( "#speed" ).change(function() {
		speed = parseInt($( "#speed" ).val());
		$("#speed_val").text(speed/1000);
	});

//	set delays
	let delay = 300;
	$( "#delay" ).val(delay);
	$("#delay_val").text(delay/1000);
	$( "#delay" ).change(function() {
		delay = parseInt($( "#delay" ).val());
		$("#delay_val").text(delay/1000);
	});
	

// draw_states.push(addStateCircle(200, 100, 'q0'));
// draw_states.push(addStateCircle(270, 200, 'qH'));
// draw_states.push(addStateCircle(340, 300, 'q2'));
// draw_states.push(addStateCircle(440, 300, 'q3'));
// draw_states.push(addStateCircle(240, 350, 'q4'));

// draw_states.push(addStateCircle(640, 400, 'q3'));
// draw_states.push(addStateCircle(140, 500, 'q4'));
// statesQnt = 3;


// connetcStates('q0', 'q1');
// connetcStates('q1', 'q2');
// connetcStates('q2', 'q3');
// connetcStates('q1', 'q4');
// connetcStates('q4', 'q3');



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
				addNewCircleState(stateName, initCoords);
				initCoords.x += 150;	
				if(parseInt($("#graph").width()) < (initCoords.x-40)){
					initCoords.x = 40;
					initCoords.y += 100;
				}	
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

	console.log(states_arr);

	//	draw new State circle, if there is no such
		if(states_arr[nextState] == undefined){
			states_arr[nextState] = [];
		
			addNewCircleState(nextState, initCoords);
			initCoords.x += 150;
			if((parseInt($("#graph").width())-40) < (initCoords.x)){
				initCoords.x = 40;
				initCoords.y += 100;
			}	
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

	if(inProcess)
		return;

	//	if there is empty field AND
	//	if process sttring is the dsame as in placeholder
	//	 --> STOP
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
	
	//	UNblock inputs
		// inputs(false);

		// console.log('$(".add_new_state input").attr("disabled") = ' + $(".add_new_state input").attr("disabled"));


	
	// let string = [];
	// for(let  i = 0; i < string1.length; i++){
	// 	string.push(string1[i]);
	// }

	// console.log(string);
	// console.log(string.length);
	// console.log(string[0]);
	// // string[0] = "f";
	// console.log(string[0]);
	// console.log(statesQnt);
	// states_arr.length

	// let new_state = "q0";
	// let halt = false;
	// let index = 0;
	// do{

		
		
	
	// 	console.log("Read value: " + string[index]);
	// 	string[index] = states_arr[new_state]["write"];
	// 	console.log("Write state: " + string[index]);
	// 	console.log("Move To: " + states_arr[new_state]["moveTo"]);
	// 	new_state = states_arr[new_state]["nextState"];
	// 	console.log("Change state to: " + new_state);
	// 	// string[index] = states_arr[new_state]["write"]
	// 	console.log("result string value: " + string.join(""));
	// 	console.log("-------------------------------------");
	
	// 	switch(states_arr[new_state]["moveTo"]){
	// 		case "L":
	// 			index--;
	// 		break;

	// 		case "R":
	// 			index++;
	// 		break;
	// 	}

	// 	if(index < 0){
	// 		halt = true;
	// 	}

	// 	if(index > string.length){
	// 		halt = true;
	// 	}

	// // console.log("indexes");
	// // console.log("statesNames["+index+"] = " + statesNames[index]);
	// // console.log("statesNames["+(statesQnt-1)+"] = " + statesNames[statesQnt-1]);
		
	// 	if(states_arr[new_state]["halt"] == 1){
	// 		halt = true;
	// 	}
	
	// }while(!halt);

});

$(".string_input").width($(".add_new_state").width())
$(".string_input").height($(".add_new_state").height())




