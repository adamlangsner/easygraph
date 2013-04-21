(function(_, d3){
	var default_options = {
		width: 640, height: 480,
		xMin: -50, yMin: -50,
		xMax: 50, yMax: 50,
		lines: [
			function(x) { return x*2; }
		]
	};

	var
	_proccess_options = function(options) {
		options = _.extend({}, default_options, options || {});

		// if user explicitly set yMax to false, figure it out for them
		yMax = options.yMax || 
				_find_max_y(options.lines, [options.xMin, options.xMax]) ||
				default_options.yMax; 

		return options;
	},

	// loop through lines to find the highest y point
	_find_max_y = function(lines, range) {
		return _.reduce(lines, function(max_y, line) {
			for (var x=range[0]; x <= range[1]; x++) {
				var y = line(x);
				if (isNaN(max_y) || y > max_y) {
					max_y = y;
				}
			}
			return max_y;
		}, NaN);
	};
	
	d3.selection.prototype.easygraph = function(options) {
		options = _proccess_options(options);

		// shortcuts for options
		var w = options.width,
			h = options.height,
			
			xMin = options.xMin,
			xMax = options.xMax,
			
			yMin = options.yMin,
			yMax = options.yMax,

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
        	.domain([xMin, xMax])
        	.range([0, w]),

        // create mapping for y axis from input units to pixels
        	y = d3.scale.linear()
        	.domain([yMin, yMax])
        	.range([h, 0]);

       	// create containers
        svg.selectAll('g.container')
	        .data(['axis-container', 'line-container'])
	        	.enter()
	        		.append('g')
	        			.attr('class', function(d) { return d; })
	        			.attr("clip-path", "url(#innerGraph)");


	    // create axes
        var xAxis = d3.svg.axis()
			.scale(x)
			.ticks(20)
			.orient('bottom')
			.tickFormat(function(x) { return x; }),

			yAxis = d3.svg.axis()
			.scale(y)
			.orient('left')
			.tickFormat(function(y) { return y; });

		// adde axes to graph
		console.log(x(0));
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
        		return _.range.apply(_, x.domain());
        	}))
        	.enter()
        		.append('path')
        		.attr('class', 'line')
        		.attr('d', function(d, i) {
        			return lines[i](d);
        		});
	};
})(_, d3);