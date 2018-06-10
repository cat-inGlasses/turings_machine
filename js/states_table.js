

function addNewRow(stateName, read, write, moveTo, nextState, rowNum, startState, haltState){

	let html = '<td class="state">'+stateName+'</sub> </td>'
	html += '<td class="read">'+read+'</td>';
	html += '<td class="write">'+write+'</td>';
	html += '<td class="move_to">'+moveTo+'</td>';
	html += '<td class="nex_state">'+nextState+'</sub>';

	// console.log((/[0-9]+/g).exec(stateName)[0]);
	let after = (rowNum == 0) ? "#row_S" : "#row_"+(rowNum-1);

	jQuery('<tr/>', {
		class : "state_row " + stateName + "_" + read,
		id : "row_"+rowNum,
		html: html
	}).insertAfter(after);

	$('#start_state').html("");

	$('#halt_state').html("");

	for(let i=0; i<statesNames.length; i++){
			
		$('#start_state').append($('<option>', {
			value: statesNames[i],
			text: statesNames[i]
		}));

		$('#halt_state').append($('<option>', {
			value: statesNames[i],
			text: statesNames[i]
		}));
	}
	const sS = (startState == "auto") ? statesNames[0] : startState;
	$("#start_state").val(sS);
	const hS = (haltState == "auto") ? statesNames[statesNames.length-1] : haltState;
	$("#halt_state").val(hS);
};