$(document).ready(function() {
	doSearch();
});

function doSearch() {
	var queryUrl = "";
	queryUrl += "http://localhost:8983/solr/collection1/select?";
	queryUrl += "q=(imageUploadYear:[2013%20TO%202015])";
	queryUrl += "&wt=json&indent=true&start=0&rows=1";
	queryUrl += "&facet=true&facet.pivot=imageUploadYear,imageUrlExist";
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
	var resultArray = dataObj.facet_counts.facet_pivot['imageUploadYear,imageUrlExist'];
	var count_2015 = resultArray[0].count;
	var count_2014 = resultArray[1].count;
	var count_2013 = resultArray[2].count;

	var pivot_2015 = resultArray[0].pivot;
	var pivot_2014 = resultArray[1].pivot;
	var pivot_2013 = resultArray[2].pivot;

	var imageExistRatio_2015 = Math.round(pivot_2015[0].count / count_2015 * 100);
	var imageExistRatio_2014 = Math.round(pivot_2014[0].count / count_2014 * 100);
	var imageExistRatio_2013 = Math.round(pivot_2013[0].count / count_2013 * 100);

	var rp1 = radialProgress(document.getElementById('div1')).label("2013").onClick(onClick1).diameter(150).value(imageExistRatio_2013).render();
	var rp2 = radialProgress(document.getElementById('div2')).label("2014").onClick(onClick2).diameter(150).value(imageExistRatio_2014).render();
	var rp3 = radialProgress(document.getElementById('div3')).label("2015").onClick(onClick3).diameter(150).value(imageExistRatio_2015).render();

}

function onClick1() {
	deselect();
	document.getElementById('div1').attr("class", "selectedRadial");
}

function onClick2() {
	deselect();
	document.getElementById('div2').attr("class", "selectedRadial");
}

function onClick3() {
	deselect();
	document.getElementById('div3').attr("class", "selectedRadial");
}

function labelFunction(val, min, max) {

}

function deselect() {
	div1.attr("class", "radial");
	div2.attr("class", "radial");
	div3.attr("class", "radial");
}

function radialProgress(parent) {
	var _data = null,
	    _duration = 1000,
	    _selection,
	    _margin = {
		top : 0,
		right : 0,
		bottom : 30,
		left : 0
	},
	    __width = 300,
	    __height = 300,
	    _diameter = 150,
	    _label = "",
	    _fontSize = 10;

	var _mouseClick;

	var _value = 0,
	    _minValue = 0,
	    _maxValue = 100;

	var _currentArc = 0,
	    _currentArc2 = 0,
	    _currentValue = 0;

	var _arc = d3.svg.arc().startAngle(0 * (Math.PI / 180));
	//just radians

	var _arc2 = d3.svg.arc().startAngle(0 * (Math.PI / 180)).endAngle(0);
	//just radians

	_selection = d3.select(parent);

	function component() {

		_selection.each(function(data) {

			// Select the svg element, if it exists.
			var svg = d3.select(this).selectAll("svg").data([data]);

			var enter = svg.enter().append("svg").attr("class", "radial-svg").append("g");

			measure();

			svg.attr("width", __width).attr("height", __height);

			var background = enter.append("g").attr("class", "component").attr("cursor", "pointer").on("click", onMouseClick);

			_arc.endAngle(360 * (Math.PI / 180));

			background.append("rect").attr("class", "background").attr("width", _width).attr("height", _height);

			background.append("path").attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")").attr("d", _arc);

			background.append("text").attr("class", "label").attr("transform", "translate(" + _width / 2 + "," + (_width + _fontSize) + ")").text(_label);
			var g = svg.select("g").attr("transform", "translate(" + _margin.left + "," + _margin.top + ")");

			_arc.endAngle(_currentArc);
			enter.append("g").attr("class", "arcs");
			var path = svg.select(".arcs").selectAll(".arc").data(data);
			path.enter().append("path").attr("class", "arc").attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")").attr("d", _arc);

			//Another path in case we exceed 100%
			var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
			path2.enter().append("path").attr("class", "arc2").attr("transform", "translate(" + _width / 2 + "," + _width / 2 + ")").attr("d", _arc2);

			enter.append("g").attr("class", "labels");
			var label = svg.select(".labels").selectAll(".label").data(data);
			label.enter().append("text").attr("class", "label").attr("y", _width / 2 + _fontSize / 3).attr("x", _width / 2).attr("cursor", "pointer").attr("width", _width)
			// .attr("x",(3*_fontSize/2))
			.text(function(d) {
				return Math.round((_value - _minValue) / (_maxValue - _minValue) * 100) + "%";
			}).style("font-size", _fontSize + "px").on("click", onMouseClick);

			path.exit().transition().duration(500).attr("x", 1000).remove();

			layout(svg);

			function layout(svg) {

				var ratio = (_value - _minValue) / (_maxValue - _minValue);
				var endAngle = Math.min(360 * ratio, 360);
				endAngle = endAngle * Math.PI / 180;

				path.datum(endAngle);
				path.transition().duration(_duration).attrTween("d", arcTween);

				if (ratio > 1) {
					path2.datum(Math.min(360 * (ratio - 1), 360) * Math.PI / 180);
					path2.transition().delay(_duration).duration(_duration).attrTween("d", arcTween2);
				}

				label.datum(Math.round(ratio * 100));
				label.transition().duration(_duration).tween("text", labelTween);

			}

		});

		function onMouseClick(d) {
			if ( typeof _mouseClick == "function") {
				_mouseClick.call();
			}
		}

	}

	function labelTween(a) {
		var i = d3.interpolate(_currentValue, a);
		_currentValue = i(0);

		return function(t) {
			_currentValue = i(t);
			this.textContent = Math.round(i(t)) + "%";
		};
	}

	function arcTween(a) {
		var i = d3.interpolate(_currentArc, a);

		return function(t) {
			_currentArc = i(t);
			return _arc.endAngle(i(t))();
		};
	}

	function arcTween2(a) {
		var i = d3.interpolate(_currentArc2, a);

		return function(t) {
			return _arc2.endAngle(i(t))();
		};
	}

	function measure() {
		_width = _diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
		_height = _width;
		_fontSize = _width * .2;
		_arc.outerRadius(_width / 2);
		_arc.innerRadius(_width / 2 * .85);
		_arc2.outerRadius(_width / 2 * .85);
		_arc2.innerRadius(_width / 2 * .85 - (_width / 2 * .15));
	}


	component.render = function() {
		measure();
		component();
		return component;
	};

	component.value = function(_) {
		if (!arguments.length)
			return _value;
		_value = [_];
		_selection.datum([_value]);
		return component;
	};

	component.margin = function(_) {
		if (!arguments.length)
			return _margin;
		_margin = _;
		return component;
	};

	component.diameter = function(_) {
		if (!arguments.length)
			return _diameter;
		_diameter = _;
		return component;
	};

	component.minValue = function(_) {
		if (!arguments.length)
			return _minValue;
		_minValue = _;
		return component;
	};

	component.maxValue = function(_) {
		if (!arguments.length)
			return _maxValue;
		_maxValue = _;
		return component;
	};

	component.label = function(_) {
		if (!arguments.length)
			return _label;
		_label = _;
		return component;
	};

	component._duration = function(_) {
		if (!arguments.length)
			return _duration;
		_duration = _;
		return component;
	};

	component.onClick = function(_) {
		if (!arguments.length)
			return _mouseClick;
		_mouseClick = _;
		return component;
	};

	return component;

}