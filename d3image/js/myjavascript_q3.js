$(document).ready(function() {
	doSearch();
});

function doSearch() {
	var queryUrl = "http://localhost:8983/solr/collection1/select?wt=json&indent=true&start=0&rows=10&q=*&fl=imageUploadYear,category&facet=true&facet.pivot=imageUploadYear,category";
	$.ajax({
		type : "get",
		url : queryUrl,
		dataType : "json",
		jsonp : "json.wrf",
		success : function(data) {
			showresults(data);
		}
	});
}

function showresults(dataObj) {
	var resultArray = dataObj.facet_counts.facet_pivot['imageUploadYear,category'];
	var data = getInputData(resultArray);
	createChart(data);
}

function getInputData(resultArray) {
	var result;
	var i,
	    j;
	var pivot_2015 = resultArray[0].pivot;
	var pivot_2014 = resultArray[1].pivot;

	var handgunsCount_2015 = 0;
	var riflesCount_2015 = 0;
	var shotgunsCount_2015 = 0;

	var handgunsCount_2014 = 0;
	var riflesCount_2014 = 0;
	var shotgunsCount_2014 = 0;

	for ( j = 0; j < pivot_2015.length; j++) {
		switch (pivot_2015[j].value) {
		case "handguns":
			handgunsCount_2015 = pivot_2015[j].count;
			break;
		case "rifles":
			riflesCount_2015 = pivot_2015[j].count;
			break;
		case "shotguns":
			shotgunsCount_2015 = pivot_2015[j].count;
			break;
		}
	}

	for ( j = 0; j < pivot_2014.length; j++) {
		switch (pivot_2014[j].value) {
		case "handguns":
			handgunsCount_2014 = pivot_2014[j].count;
			break;
		case "rifles":
			riflesCount_2014 = pivot_2014[j].count;
			break;
		case "shotguns":
			shotgunsCount_2014 = pivot_2014[j].count;
			break;
		}
	}

	result = {
		labels : ['rifles', 'shotguns', 'handguns'],
		series : [{
			label : '2015',
			values : [riflesCount_2015, shotgunsCount_2015, handgunsCount_2015]
		}, {
			label : '2014',
			values : [riflesCount_2014, shotgunsCount_2014, handgunsCount_2014]
		}]
	};
	return result;
}

function createChart(data) {
	var chartWidth = 300,
	    barHeight = 20,
	    groupHeight = barHeight * data.series.length,
	    gapBetweenGroups = 10,
	    spaceForLabels = 150,
	    spaceForLegend = 150;

	// Zip the series data together (first values, second values, etc.)
	var zippedData = [];
	for (var i = 0; i < data.labels.length; i++) {
		for (var j = 0; j < data.series.length; j++) {
			zippedData.push(data.series[j].values[i]);
		}
	}

	// Color scale
	var color = d3.scale.category20();
	var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

	var x = d3.scale.linear().domain([0, d3.max(zippedData)]).range([0, chartWidth]);

	var y = d3.scale.linear().range([chartHeight + gapBetweenGroups, 0]);

	var yAxis = d3.svg.axis().scale(y).tickFormat('').tickSize(0).orient("left");

	// Specify the chart area and dimensions
	var chart = d3.select(".chart").attr("width", spaceForLabels + chartWidth + spaceForLegend).attr("height", chartHeight);

	// Create bars
	var bar = chart.selectAll("g").data(zippedData).enter().append("g").attr("transform", function(d, i) {
		return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / data.series.length))) + ")";
	});

	// Create rectangles of the correct width
	bar.append("rect").attr("fill", function(d, i) {
		return color(i % data.series.length);
	}).attr("class", "bar").attr("width", x).attr("height", barHeight - 1);

	// Add text label in bar
	bar.append("text").attr("x", function(d) {
		return x(d) - 3;
	}).attr("y", barHeight / 2).attr("fill", "red").attr("dy", ".35em").text(function(d) {
		return d;
	});

	// Draw labels
	bar.append("text").attr("class", "label").attr("x", function(d) {
		return -10;
	}).attr("y", groupHeight / 2).attr("dy", ".35em").text(function(d, i) {
		if (i % data.series.length === 0)
			return data.labels[Math.floor(i / data.series.length)];
		else
			return "";
	});

	chart.append("g").attr("class", "y axis").attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups / 2 + ")").call(yAxis);

	// Draw legend
	var legendRectSize = 18,
	    legendSpacing = 4;

	var legend = chart.selectAll('.legend').data(data.series).enter().append('g').attr('transform', function(d, i) {
		var height = legendRectSize + legendSpacing;
		var offset = -gapBetweenGroups / 2;
		var horz = spaceForLabels + chartWidth + 40 - legendRectSize;
		var vert = i * height - offset;
		return 'translate(' + horz + ',' + vert + ')';
	});

	legend.append('rect').attr('width', legendRectSize).attr('height', legendRectSize).style('fill', function(d, i) {
		return color(i);
	}).style('stroke', function(d, i) {
		return color(i);
	});

	legend.append('text').attr('class', 'legend').attr('x', legendRectSize + legendSpacing).attr('y', legendRectSize - legendSpacing).text(function(d) {
		return d.label;
	});
}