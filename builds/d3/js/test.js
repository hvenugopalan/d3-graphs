var margin = {top: 20, right: 20, bottom: 90, left: 50},
    margin2 = {top: 230, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    height2 = 300 - margin2.top - margin2.bottom;
	
	//add svg with margin !important
	//this is svg is actually group
	var svg = d3.select("#diagram").append("svg")
				.attr("width",width+margin.left+margin.right)
				.attr("height",height+margin.top+margin.bottom);
		
	var focus = svg.append("g")  //add group to leave margin for axis
				.attr("transform","translate("+margin.left+","+margin.top+")");
	var context = svg.append("g")
				.attr("transform","translate("+margin2.left+","+margin2.top+")");
	
	var dataset = [4,2,6,13,4,8,32,19,10,12,2,15];
	var maxHeight=d3.max(dataset,function(d){return d});
	var minHeight=d3.min(dataset,function(d){return d})
	
	//set y scale
	var yScale = d3.scaleLinear().range([0,height]).domain([maxHeight,0]);
	//add x axis
	var xScale = d3.scaleBand().rangeRound([0,width]).padding(0.1);//scaleBand is used for  bar chart
	xScale.domain(d3.range(0,dataset.length,1));
	//set y scale
	var yScale2 = d3.scaleLinear().range([0,height2]).domain([maxHeight,0]);
	//add x axis
	var xScale2 = d3.scaleBand().rangeRound([0,width]).padding(0.1);//scaleBand is used for  bar chart
	xScale2.domain(d3.range(0,dataset.length,1));
	//add x and y axis
	var yAxis = d3.axisLeft(yScale).tickSize(-width);
	var yAxisGroup = focus.append("g").call(yAxis);
	var xAxis = d3.axisBottom(xScale).tickSize(-height);
	var xAxisGroup = focus.append("g").call(xAxis).attr("transform", "translate(0,"+height+")");
		
	var xAxis2 = d3.axisBottom(xScale2);
	var xAxisGroup2 = context.append("g").call(xAxis2).attr("transform", "translate(0,"+height2+")");	
		
	var bars1 = focus.selectAll("rect").data(dataset).enter().append("rect");
	bars1.attr("x",function(d,i){
		return xScale(i);//i*(width/dataset.length);
	})
	.attr("y",function(d){
		return yScale(d);
	})//for bottom to top
	.attr("width", xScale.bandwidth()/*width/dataset.length-barpadding*/)
	.attr("height", function(d){
		return height-yScale(d);
	});
	bars1.attr("fill",function(d){
		return "steelblue";
	});
		
	var bars2 = context.selectAll("rect").data(dataset).enter().append("rect");
	bars2.attr("x",function(d,i){
		return xScale2(i);//i*(width/dataset.length);
	})
	.attr("y",function(d){
		return yScale2(d);
	})//for bottom to top
	.attr("width", xScale2.bandwidth()/*width/dataset.length-barpadding*/)
	.attr("height", function(d){
		return height2-yScale2(d);
	});
	bars2.attr("fill",function(d){
		return "steelblue";
	});
			
	//add zoom
	/*var zoom = d3.zoom()
			.scaleExtent([1,Infinity])// &lt;1 means can resize smaller than  original size
			.translateExtent([[0,0],[width,height]])
			.extent([[0,0],[width,height]])//view point size
	svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/
	//add brush
	//Brush must be added in a group
	var brush = d3.brushX()
				.extent([[0,0],[width,height2]])//(x0,y0)  (x1,y1)
				.on("brush",brushed)//when mouse up, move the selection to the exact tick //start(mouse down), brush(mouse move), end(mouse up)
				.on("end",brushend);
	context.append("g")
		.attr("class","brush")
		.call(brush)
		.call(brush.move,xScale2.range());
		
		
	
	function brushed(){
		if (!d3.event.sourceEvent) return; // Only transition after input.
  		if (!d3.event.selection) return; // Ignore empty selections.
		if(d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-
		//scaleBand of bar chart is not continuous. Thus we cannot use method in line chart.
		//The idea here is to count all the bar chart in the brush area. And reset the domain
		var newInput = [];
		var brushArea = d3.event.selection;
		if(brushArea === null) brushArea = xScale.range();
		
		xScale2.domain().forEach(function(d){
			var pos = xScale2(d) + xScale2.bandwidth()/2;
			if (pos >= brushArea[0] && pos <= brushArea[1]){
			  newInput.push(d);
			}
		});

		xScale.domain(newInput);
	//	console.log(xScale.domain());
		//realocate the bar chart
		bars1.attr("x",function(d,i){//data set is still data
			return xScale(i)/*xScale(xScale.domain().indexOf(i))*/;
		})
		.attr("y",function(d){
			return yScale(d);
		})//for bottom to top
		.attr("width", xScale.bandwidth())//if you want to change the width of bar. Set the width to xScale.bandwidth(); If you want a fixed width, use xScale2.bandwidth(). Note because we use padding() in the scale, we should use xScale.bandwidth()
		.attr("height", function(d,i){
			if(xScale.domain().indexOf(i) === -1){
				return 0;
			}
			else
				return height-yScale(d);
		})
		/*.style("opacity", function(d,i){
		  return xScale.domain().indexOf(i) === -1 ? 0 : 100;
		})*/;
		
		xAxisGroup.call(xAxis);

		
		 /*svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
			.scale(width / (brushArea[1] - brushArea[0]))
			.translate(-brushArea[0], 0));*/

	}
	function brushend(){
		if (!d3.event.sourceEvent) return; // Only transition after input.
  		if (!d3.event.selection) return; // Ignore empty selections.
		if(d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-
		//scaleBand of bar chart is not continuous. Thus we cannot use method in line chart.
		//The idea here is to count all the bar chart in the brush area. And reset the domain
		var newInput = [];
		var brushArea = d3.event.selection;
		if(brushArea === null) brushArea = xScale.range();
		
		
		xScale2.domain().forEach(function(d){
			var pos = xScale2(d) + xScale2.bandwidth()/2;
			if (pos >= brushArea[0] && pos <= brushArea[1]){
			  newInput.push(d);
			}
		});
		//relocate the position of brush area
		var increment = 0;
		var left=xScale2(d3.min(newInput));
		var right = xScale2(d3.max(newInput))+xScale2.bandwidth();

		d3.select(this).transition().call(d3.event.target.move,[left,right]);//The inner padding determines the ratio of the range that is reserved for blank space between bands.
	}