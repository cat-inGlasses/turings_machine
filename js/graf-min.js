
 start = function() {
	this.rx = parseInt(this.attr("rx"));
	this.ry = parseInt(this.attr("ry"));

	thisState = parseInt((/[0-9]+/g).exec(this[1].attr("text")));
 }

 move = function(dx, dy) {
	this.attr({
		transform: "t" + (this.rx + dx) + "," + (this.ry + dy),
		rx: this.rx + dx, 
		ry: this.ry + dy});
		movingState();
 }

 stop = function() {
	 this.rx = parseInt(this.attr("rx"));
	 this.ry = parseInt(this.attr("ry"));
 }




const graph = Snap("#graph");


//	creating arrow marker element
var arrow = graph.polygon([0, 10, 4, 10, 2, 0])
				.attr({ fill: '#000000' })
				.transform('r90');
var marker = arrow.marker(-10, -10, 20, 20, 0, 5);

//---------------------------------------------------------------------
// 
// 	cx, cy - center coordinates
//	cText - text inside circle
// 



function addStateCircle(cx, cy, cText) {

	// console.log(draw_states[0].attr());

	let fsz = 20;		// fontsize
	return graph.group(
		graph.circle(cx, cy, cText.length*fsz/1.5)
			.attr({fill: 'black',
					stroke: '#d1d1e0',
					strokeOpacity: 1,
					strokeWidth: fsz/3}), 
		graph.text(cx-(cText.length*fsz/4), cy+(fsz/4), cText)
			.attr({fill: '#fff',
					"font-size": fsz})
	)
	.attr({
		cursor: 'pointer',
		state: cText,
		links: "-",
		gx: cx,
		gy: cy,
		rx: 0,
		ry: 0
	})
	.drag(move, start, stop)
	// .drag(() => {movingState()},
	// .drag(function(){
	// 		console.log(draw_states[thisState]);
	// 		console.log(draw_states[thisState].transform());
	// 	},
	// 	function(){
	// 		//	start moving
	// 		thisState = parseInt((/[0-9]+/g).exec(cText));
	// 	},
	// 	function(){
	// 		//	stopped moving
	// 		// console.log("Move stopped");
	// 	}
	// )
};

//---------------------------------------------------------------------
// 
// 	----	changing coord from center of cirle to its boudary
//	stateFrom - the first state
//	stateTo	 - the end state
// 
function changeCoords(stateFrom, stateTo){

	// console.log("--------- changeCoords --------- ");
	// console.log("---------    start   --------- ");
	// console.log("stateFrom= " + stateFrom);
	// console.log("stateTo= " + stateTo);

	var stateFrom = parseInt(stateFrom);
	var stateTo = parseInt(stateTo);

	let x1 = parseFloat(draw_states[stateFrom][0].attr("cx")) + draw_states[stateFrom].attr("transform").globalMatrix.e;
	let y1 = parseFloat(draw_states[stateFrom][0].attr("cy")) + draw_states[stateFrom].attr("transform").globalMatrix.f;
	let x2 = parseFloat(draw_states[stateTo][0].attr("cx")) + draw_states[stateTo].attr("transform").globalMatrix.e;
	let y2 = parseFloat(draw_states[stateTo][0].attr("cy")) + draw_states[stateTo].attr("transform").globalMatrix.f;



	const b = Math.abs(y2-y1);
	const c = Math.abs(x2-x1);
	const a = Math.sqrt( b*b + c*c );
	const sinAlfa =  a / b;
	const cosAlfa =  a / c;
	const R = Math.round(parseFloat(draw_states[stateFrom][0].attr("r")),2);
	

	const moveX = (y2 == y1) ? R+3 : (R+3) / cosAlfa ;
	const moveY = (x2 == x1) ? R+3 : (R+3) / sinAlfa ;

	if(x1 < x2){
		if(y1 < y2){
			x1 += moveX;
			y1 += moveY;
			x2 -= moveX;
			y2 -= moveY;
		}
		else{
			x1 += moveX;
			y1 -= moveY;
			x2 -= moveX;
			y2 += moveY;		
		}
	}
	else{
		if(y1 < y2){
			x1 -= moveX;
			y1 += moveY;
			x2 += moveX;
			y2 -= moveY;
		}
		else{
			x1 -= moveX;
			y1 -= moveY;
			x2 += moveX;
			y2 += moveY;
		}
	}

	// console.log("---------      end     --------- ");
	// console.log("--------- changeCoords --------- ");

	return {
		x1: x1,
		y1: y1,
		x2: x2,
		y2: y2
	};
};

//---------------------------------------------------------------------
//
//	----	connecting circle states with lines
//	sFrom - states connected from
//	sTo - states connected to
//
function connetcStates(sFrom, sTo, text){

	// console.log("--------- connetcStates --------- ");
	// console.log("---------    start   --------- ");

	const start = (/[0-9]+/g).exec(sFrom);
	const end = (/[0-9]+/g).exec(sTo);
	
	// console.log("start = " + start);
	// console.log("end = " + end);

	const coords = changeCoords(parseInt(start), parseInt(end));
	// console.log("coords = ");
	// console.log(coords);
	// console.log(coords.x1);
	

	// var fsz = 20;



	// console.log(draw_states[parseInt(end)][0].attr());
	// console.log("connection: "+ "M "+coords.x1+" "+coords.y2+" L "+coords.x2+" "+coords.y2);

	connectors.push(graph.group(
			graph.path("M "+coords.x1+" "+coords.y1+" L "+coords.x2+" "+coords.y2)
				.attr({
					stroke: '#000',
					strokeWidth: 2,
					fill: 'none',
					stateFrom: start,
					stateTo: end,
					markerEnd: marker
				}),
			// graph.group(
				graph.rect((coords.x1 + coords.x2)/2-35, (coords.y1 + coords.y2)/2-15, 60, 25, 5)
					.attr({fill: 'rgba(199, 219, 249, 0.8)',
						stroke: '#9dacc4',
						strokeOpacity: 1,
						strokeWidth: 1
					}),
				graph.text( (coords.x1 + coords.x2)/2-30, (coords.y1 + coords.y2)/2+7, text)
					.attr({fill: '#000',
						"font-size": 20})
				// )
			)
	);

	// console.log(connectors);
	// console.log(connectors[connectors.length-1][1].attr());

	let links = "";
	
	// console.log(draw_states[parseInt(start)].attr());
	if(draw_states[parseInt(start)].attr("links") !== "-"){
		if(draw_states[parseInt(start)].attr("links").length != 1){
			let buf = draw_states[parseInt(start)].attr("links").split("_");
			buf.push("1:"+(connectors.length-1));
			links = buf.join("_");
		}
		else{
			links = draw_states[parseInt(start)].attr("links")+"_1:"+(connectors.length-1);
			// console.log("links = " + links);
			// console.log(connectors.length-1);
		}
	}else{
		links = "1:"+(connectors.length-1);
	}
	draw_states[parseInt(start)].attr({ links: links });

	
	if(draw_states[parseInt(end)].attr("links") !== "-"){
		if(draw_states[parseInt(end)].attr("links").length != 1){
			let buf = draw_states[parseInt(end)].attr("links").split("_");
			buf.push("0:"+(connectors.length-1));
			links = buf.join("_");
		}
		else{
			links = draw_states[parseInt(end)].attr("links")+"_0:"+(connectors.length-1);
		}
	}else{
		links = "0:"+(connectors.length-1);
	}
	draw_states[parseInt(end)].attr({ links: links });

	// console.log(draw_states[parseInt(start)].attr());
	// console.log(draw_states[parseInt(end)].attr());

	// console.log("---------      end     --------- ");
	// console.log("--------- connetcStates --------- ");
};

//---------------------------------------------------------------------
//
//  ----	moving line
//	dAttr - attribut from line woth path
//	point - 1 - change start, 0 - change end
//	xTo, yTo - coordinates
//
function moveline(lineNr, stateFrom, stateTo){

	// console.log("--------- moveline --------- ");
	// console.log("---------    start   --------- ");
	
	// console.log("stateFrom:" + stateFrom);
	// console.log("stateTo:" + stateTo);
	
	
	const coords = changeCoords(stateFrom, stateTo);

	// console.log("---------      end     --------- ");
	// console.log("--------- moveline --------- ");

	connectors[lineNr][0].attr({
		path: "M " + coords.x1 + " " + coords.y1 + " L " + coords.x2 + " " + coords.y2
	});
	connectors[lineNr][1].attr({
		x : "" + ((coords.x1 + coords.x2)/2-35),
		y : "" + ((coords.y1 + coords.y2)/2-15)
	});	
	connectors[lineNr][2].attr({
		x : "" + ((coords.x1 + coords.x2)/2-30),
		y : "" + ((coords.y1 + coords.y2)/2+7)
	});	

	// return "M " + coords.x1 + " " + coords.y1 + " L " + coords.x2 + " " + coords.y2;
};


//---------------------------------------------------------------------
//
//	moving state circle
//
function movingState(){

	// console.log("--------- movingState --------- ");
	// console.log("---------    start   --------- ");

	let allLinks = draw_states[thisState].attr("links").split("_");
	const linksQnt = allLinks.length;

	// console.log(draw_states[thisState]);
	// console.log(draw_states[thisState].transform());

	// console.log("allLinks");
	// console.log(allLinks);

	for(let i=0; i<linksQnt; i++){

		const changeFrom = parseInt(connectors[allLinks[i].split(":")[1]][0].attr("stateFrom"));
		const changeTo = parseInt(connectors[allLinks[i].split(":")[1]][0].attr("stateTo"));

		// console.log("changeFrom = " + changeFrom);
		// console.log("changeTo = " + changeTo);
		// console.log("before");
		// console.log(connectors[allLinks[i].split(":")[1]][0].attr());



		moveline(allLinks[i].split(":")[1], changeFrom, changeTo)

		// connectors[allLinks[i].split(":")[1]][0].attr({
		// 	path: moveline(allLinks[i].split(":")[1], changeFrom, changeTo)
		// });

		// console.log("after:");		
		// console.log(connectors[allLinks[i].split(":")[1]][0].attr());
	
	}

	// console.log("---------      end     --------- ");
	// console.log("--------- movingState --------- ");
};