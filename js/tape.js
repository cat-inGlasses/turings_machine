

// const s = Snap(['object']);
// console.log(s);
// console.log(s[0]);


// const tape = Snap("#tape");


class Tape{

	constructor(svgID){
		this.instance  = Snap(svgID);
		this.id = svgID;
		return this.instance
	}

	// get width() {
	// 	return getWidth();
	// }

	// getWidth(){
	// 	const id = this.id;
	// 	return document.getElementById('#tape').offsetWidth;
	// }
}

class Head{
	constructor(x,y,startText){
		this.x = x;
		this.y = y;
		this.relx = 0;
		this.rely = 0;
		return this.constructHead(x,y,startText);
	}

	get pointer (){
		return this.block;
	}

	set pointer(a){}

	set text(text){
		this.block[3].attr({text});
	}

	error(){
		this.block[2].attr({fill: '#cc0000'});
	}

	success(){
		this.block[2].attr({fill: '#00802b'});
	}

	reset(startState){
		this.block[2].attr({fill: '#000'});
		this.block[3].attr({text: startState});
	}

	constructHead(x,y,startText){

		let pointer = {
			x: x,
			y: y
		};
		let arrow_Side = 20 * 1.8;
		let tr_whiete = {
			p1x: pointer.x - arrow_Side/2,
			p1y: pointer.y + arrow_Side/2,
			p2x: pointer.x + arrow_Side/2,
			p2y: pointer.y + arrow_Side/2,
			p3x: pointer.x,
			p3y: pointer.y - arrow_Side/2,
		};
		pointer = {
			x: x,
			y: pointer.y-3
		};
		arrow_Side = 20;
		let tr_blck = {
			p1x: pointer.x - arrow_Side/2,
			p1y: pointer.y + arrow_Side/2,
			p2x: pointer.x + arrow_Side/2,
			p2y: pointer.y + arrow_Side/2,
			p3x: pointer.x,
			p3y: pointer.y - arrow_Side/2,
		};
		this.block = tape.group(
					tape.polygon([tr_whiete.p1x, 
									tr_whiete.p1y, 
									tr_whiete.p2x, 
									tr_whiete.p2y, 
									tr_whiete.p3x, 
									tr_whiete.p3y])
						.attr({ fill: '#e6e6e6' }),
					tape.polygon([tr_blck.p1x, 
									tr_blck.p1y, 
									tr_blck.p2x, 
									tr_blck.p2y, 
									tr_blck.p3x, 
									tr_blck.p3y])
						.attr({ fill: '#000' }),
					tape.circle(pointer.x, pointer.y+arrow_Side*1.5, 22)
						.attr({fill: 'black',
								stroke: '#d1d1e0',
								strokeOpacity: 1,
								strokeWidth: 5}), 
					tape.text(pointer.x-arrow_Side/2, pointer.y + arrow_Side*1.8, startText)
						.attr({fill: '#fff',
								"font-size": 20})
				);

	}
}


var tape = new Tape("#tape");



const blockWidth = $("#tape").width();
const rs = 40; // rectangle side
let rect = {
	w: rs,
	h: rs,
	r: rs/15
};
const k = 1.1;
const spBtw = k*rect.w - rect.w; //	space between blocks on tape

let tape_arr = [];
const y = 15;
for(let x = -rect.w/2; x<blockWidth; x += spBtw + rect.w){
	tape_arr.push(tape.group(
		tape.rect(x, y, rect.w, rect.h, rect.r)
			.attr({fill: '#c7dbf9',
				stroke: '#9dacc4',
				strokeOpacity: 1,
				strokeWidth: 1}),
		tape.text(x+rect.w/3, y+rect.h/1.5, "")
			.attr({fill: '#000',
					"font-size": rect.w/1.2})
	));
}

var head = new Head(50, 100, "");


// const string = "ababaad";

let sTapeBlock = 0;
function fillTape(string, startState){

	//	reaset head
	head.reset(startState);


	const blocksQnt = tape_arr.length;
	for(let i = 0; i<blocksQnt; i++){
		tape_arr[i][1].attr({
			text: ""
		});
	}

	//	calculate start position for the given string
	const tapeLength = $("#tape").width();
	let start = tapeLength/2 - rect.w*string.length/2;
	if(start <= 0)
		start = rect.w;

	//	look for start block for the give string
	let start_block = 0;

	for( start_block = 0; start_block<blocksQnt; start_block++ ){
		if( (start >= parseFloat(tape_arr[start_block][0].attr("x"))) && (start <= ( parseFloat(tape_arr[start_block][0].attr("x")) + rect.w + spBtw) ) )
			break;
	}
	sTapeBlock = start_block;





	//	positioning header
	const px = parseFloat(tape_arr[start_block][0].attr("x")) + rect.w/2;
	const py = parseFloat(tape_arr[0][0].attr("y")) + rect.h*1.1;
	
	head.relx = -(head.x - px);
	head.rely = -(head.y - py);
	
	head.pointer.animate(
		{transform: "t" + head.relx + "," + head.rely }, 
		speed,
		"",
		() => {
			circlePointer = graph.circle(50, 50, 10).attr({ fill: 'blue', opacity: 0, id:'circlePointer' });
			setTimeout(moveHead, delay, startState);
		}
	);



	//	srite string into blocks of cells
	const stringLength = string.length;
	for( let s = 0; s < stringLength; s++ ){
		tape_arr[start_block++][1].attr({
			text: string[s]
		});
	}
}


function moveHead(state){
	
	let read = tape_arr[sTapeBlock][1].attr("text");

	//	return if it is halt state
	if(states_arr[state]["halt"]){
		processing(false);
		$("#circlePointer").remove();
		if(read == ""){
			head.success();
			states_arr[statesActive.end].svgState[0].attr({fill: '#009900'});
		}else{
			processing(false);
			head.error();
			statesActive.error = state;
			states_arr[statesActive.error].svgState[0].attr({fill: '#cc2900'});
		}
		return;
	}

	//	return if there if bad value or null
	if(read == "" || states_arr[state][read] == undefined){
		processing(false);
		head.error();
		$("#circlePointer").remove();
		statesActive.error = state;
		states_arr[statesActive.error].svgState[0].attr({fill: '#cc2900'});
		return;
	}

	//	set colored row
	$("." + state + "_" + read).css({"background-color": "#ff884d"});

	//	writing new value to block
	tape_arr[sTapeBlock][1].attr({
		text: states_arr[state][read]["write"]
	});

	//	setting new coords
	let transform = "";
	switch(states_arr[state][read]["moveTo"]){
		case "L":
			transform = "t" + (parseFloat(head.pointer.transform().globalMatrix.e) - (spBtw + rect.w) + "," + head.rely);
			sTapeBlock--;
			break;
		case "R":
		default:
			transform = "t" + (parseFloat(head.pointer.transform().globalMatrix.e) + (spBtw + rect.w) + "," + head.rely);
			sTapeBlock++;
			break;
	}

	//	
	let allLinks = states_arr[state].svgState.attr("links").split("_");
	const linksQnt = allLinks.length;
	let index = 0;
	if(linksQnt == 1){
		index = allLinks[0].split(":")[1];
	}else{
		for(let i=0; i<linksQnt; i++){
			if( connectors[allLinks[i].split(":")[1]][0].attr("stateFrom") == state &&
			    connectors[allLinks[i].split(":")[1]][0].attr("stateTo") == states_arr[state][read]["nextState"])
				index = allLinks[i].split(":")[1];
		}
	}

	//	move circlePointer
	circlePointer
		.attr({ opacity: 1 })
		.drawAtPath(connectors[index][0], speed);
	//	move head to next block
	head.pointer.animate(
		{transform}, 	//	transforms
		speed, 			//	speed
		"",				//	easing (null)
		() => {
			//	remove colored row
			$("." + state + "_" + read).css({"background-color": ""});
			//	change head text
			head.text = states_arr[state][read]["nextState"];
			//	move element
			setTimeout(moveHead, delay, states_arr[state][read]["nextState"]);
	});
}
