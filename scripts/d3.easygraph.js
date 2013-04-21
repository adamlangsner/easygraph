(function(_, d3){
	var default_options = {
		width: 640, height: 480,
		domain: [-50, 50],
		lines: [
			function(x) { return x; }
		]
	},

	TICK_SPACE = 5;

	var
	_proccess_options = function(options) {
		// extend default options with user options
		options = _.extend({}, default_options, options || {});

		// if user didn't provide a range, figure out the bounds
		options.range = options.range || _find_range(options.lines, options.domain);

		return options;
	},

	// loop through lines to find the highest y point
	_find_range = function(lines, domain) {
		return _.map([Math.max, Math.min], function(op) { // get max and min in an array
			return _.reduce(lines, function(memo, line) { // go thru each line
				for (var x=domain[0]; x <= domain[1]; x++) { // go thru the entire domain
					var y = line(x);
					memo = isNaN(memo) ? y : op(y, memo); // apply operator (min/max) to y
				}
				return memo;
			}, NaN);
		});
	};
	
	d3.selection.prototype.easygraph = function(options) {
		options = _proccess_options(options);

		// shortcuts for options
		var w = options.width,
			h = options.height,
			
			domain = options.domain,
			range = options.range,

			lines = options.lines;

		// create SVG container inside this HTML element
		var svg = this.append('svg')
            .style('width', w+'px')
            .style('height', h+'px');

        // define a clipping path to keep all drawing insie the box
        svg.append('defs')
            .append('clipPath')
                .attr('id', 'innerGraph')
            .append('path')
                .attr('d', 'M 0 0 L 0 '+h+' L '+w+' '+h+' L '+w+' 0');

        // create mapping for x axis from input units to pixels
        var x = d3.scale.linear()
        	.domain(domain)
        	.range([0, w]),

        // create mapping for y axis from input units to pixels
        	y = d3.scale.linear()
        	.domain(range)
        	.range([h, 0]);

       	// create containers
        svg.selectAll('g.container')
        	// these are in order in terms of vertical layering, rightmost is on top
	        .data(['grid-container', 'axis-container', 'line-container'])
	        	.enter()
	        		.append('g')
	        			.attr('class', function(d) { return d; })
	        			.attr("clip-path", "url(#innerGraph)");

	    // create axes
        var xAxis = d3.svg.axis()
			.scale(x)
			.orient('bottom')
			.tickFormat(function(x) { return x; }),

			yAxis = d3.svg.axis()
			.scale(y)
			.orient('left')
			.tickFormat(function(y) { return y; });

		// adde axes to graph
		var axisContainer = svg.select('g.axis-container');
		axisContainer.append('g')
			.attr("transform", "translate(0,"+y(0)+")")
			.attr("class", "axis x-axis")
			.call(xAxis);

		axisContainer.append('g')
			.attr("transform", "translate("+x(0)+",0)")
			.attr("class", "axis y-axis")
			.call(yAxis);

        // convert line functions into d3 lines
        lines = _.map(lines, function(line) {		
			return d3.svg.line()
	            .x(function(d, i) { return x(d); })
	            .y(function(d, i) { return y(line(d)); });
		});

       	// insert paths into line container
        svg.select('g.line-container').selectAll('path.line')
        	.data(_.map(_.range(lines.length), function() {
        		console.log();
        		var domain = x.domain(),
        			step =  TICK_SPACE * (domain[1]-domain[0]) / w;
        		return _.range(domain[0], domain[1] + step,  step);
        	}))
        	.enter()
        		.append('path')
        		.attr('class', 'line')
        		.attr('d', function(d, i) {
        			return lines[i](d);
        		});

        var gridContainer = svg.select('g.grid-container');
       	gridContainer.selectAll("line.grid-line.y")
				.data(y.ticks(10))
				.enter().append("line")
				.attr("class", "grid-line y")
				.attr("x1", x.range()[0])
				.attr("x2", x.range()[1])
				.attr("y1", y)
				.attr("y2", y);

		gridContainer.selectAll("line.grid-line.x")
			.data(x.ticks(25))
			.enter().append("line")
			.attr("class", "grid-line x")
			.attr("x1", x)
			.attr("x2", x)
			.attr("y1", y.range()[0])
			.attr("y2", y.range()[1]);
	};
})(_, d3);