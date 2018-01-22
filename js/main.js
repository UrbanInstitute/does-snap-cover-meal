var SNAP_COST = 1.7;
var US_MEAL = 2.29;
var PERCENT = d3.format(".0%")
var DOLLARS = d3.format("$.2f")

var pie_radius = 100;
var pie_inner_radius = 40;
var pie_width = 220;
var pie_height = pie_radius*2;

var map_width = 700;
var legend_height = 80;
var map_height = map_width * (600/960) + legend_height;


    function scale (scaleFactor) {
        return d3.geoTransform({
            point: function(x, y) {
                this.stream.point(x * scaleFactor, y  * scaleFactor);
            }
        });
    }

    // path = d3.geoPath().projection(scale(2));


var path = d3.geoPath().projection(scale(map_width/960));

var mapSvg = d3.select("#map").append("svg")
  .attr("width", map_width)
  .attr("height", map_height)


var colors =["#12719e","#1696d2","#46abdb","#73bfe2","#a2d4ec","#cfe8f3","#fff2cf"]
var breaks = [.5,.6,.7,.8,.9,1,1.1]
var colorScale = d3.scaleThreshold();    

colorScale.range(colors);
colorScale.domain(breaks);

mapSvg.append("text")
  .attr("x", 10)
  .attr("y", 20)
  .attr("id", "legendTitle")
  .text("SNAP Benefits as Percentage of Meal Costs")

var keyW = 40
var keyH = 20;
var legend = mapSvg.append("g")
  .attr("transform", "translate(10, 30)")
legend.append("text")
  .attr("class", "keyItem")
  .attr("dx", 0)
  .attr("text-anchor", "middle")
  .attr("dy", keyH + 13)
  .text(PERCENT(0))
for (var i = 0; i < breaks.length; i++){
  legend.append("rect")
    .attr("x", i*keyW)
    .attr("y", 0)
    .attr("width", keyW)
    .attr("height", keyH)
    .attr("fill", colors[i])
    .attr("stroke", "none")
    .datum(i)
    .on("mouseover", function(d){
      d3.selectAll(".countyPath").classed("hide", true)
      d3.selectAll(".countyPath.q-" + d).classed("hide", false)
    })
    .on("mouseout", function(d){
      d3.selectAll(".countyPath").classed("hide", false)
    })
  legend.append("text")
    .attr("class", "keyItem")
    .attr("dx", (i+1)*keyW)
    .attr("text-anchor", "middle")
    .attr("dy", keyH + 13)
    .text(PERCENT(breaks[i]))
}


d3.select("#pie")
  .style("height", map_height + "px")
  .style("width", pie_width)

d3.select("#pie").append("div")
  .style("width", pie_width + "px")
  .style("height", "40px")
  .attr("id", "countyLabel")
  .text("National Average")
  .style("margin-top", legend_height + "px")

var pieSvg = d3.select("#pie").append("svg")
  .attr("width", pie_width)
  .attr("height", pie_height)
  .append("g").attr("transform", "translate(" + pie_width / 2 + "," + pie_radius + ")");

d3.select("#pie").append("div")
  .attr("id", "tt-text")
  .html("SNAP benefits of $1.70 per meal cover <span id = \"tt-percent\">" + PERCENT(SNAP_COST/ US_MEAL) + "</span> of <span id = \"tt-dollars\">" + DOLLARS(US_MEAL) + "</span>, the cost of a meal at 130% of the poverty rate.")

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.ratio; });

var piePath = d3.arc()
    .outerRadius(pie_radius - 10)
    .innerRadius(0);

var US_RATIO = SNAP_COST / US_MEAL
var arc = pieSvg.selectAll(".arc")
    .data(pie([{"ratio": 1 - US_RATIO,"fill":"empty"},{"ratio": US_RATIO,"fill":"chart"}]))
    .enter().append("g")
      .attr("class", "arc");

var slice = arc.append("path")
    .attr("d", piePath)
    .attr("fill", function(d) { return (d.data.fill == "empty") ? "none" : colorScale(d.data.ratio) });

arc.append("circle")
  .attr("r", pie_inner_radius)
  .attr("cx",0)
  .attr("cy",0)
  .attr("fill","#ffffff")


var pieLabel = arc.append("text")
  .attr("class","pieLabel")
  .attr("text-anchor","middle")
  .attr("dy",9)
  .text(function(d){ return (d.data.fill == "chart") ? PERCENT(d.data.ratio) : ""})

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return piePath(i(t));
  };
}


function restoreNational(){
  d3.select("#tt-dollars").text(DOLLARS(US_MEAL))
  d3.select("#tt-percent").text(PERCENT(SNAP_COST/ US_MEAL))
  d3.select("#countyLabel").text("National Average")
  slice
    .data(pie([{"ratio": 1.0 - US_RATIO,"fill":"empty"},{"ratio": US_RATIO,"fill":"chart"}]))
    .transition().duration(400).attrTween("d", arcTween)
      .attr("fill", function(c) { return (c.data.fill == "empty") ? "none" : colorScale(c.data.ratio) });

  d3.selectAll(".pieLabel")
    .data(pie([{"ratio": 1 - US_RATIO,"fill":"empty"},{"ratio": US_RATIO,"fill":"chart"}]))
    .text(function(c){ return (c.data.fill == "chart") ? PERCENT(c.data.ratio) : ""})

}

restoreNational();

d3.json("data/data.json", function(error, us) {
  if (error) throw error;

  mapSvg.append("g")
    .attr("class", "counties")
    .attr("transform", "translate(0," + legend_height + ")")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", function(d){
        var cost = +d.properties.cost;
        var color = colorScale(SNAP_COST/cost)
        return "countyPath q-" + colors.indexOf(color)
      })
      .attr("display", function(d){
        return d.properties.hasOwnProperty("cost") ? "block" : "none"
      })
      .attr("fill", function(d){
        var cost = +d.properties.cost;
        return colorScale(SNAP_COST/cost)
      })
      .attr("stroke", function(d){
        var cost = +d.properties.cost;
        return colorScale(SNAP_COST/cost)
      })
      .on("mouseover", function(d){

        var ratio = SNAP_COST/+d.properties.cost        


        d3.select(this)
          .classed("mouseover", true)

        d3.select("#tt-percent")
          .text(PERCENT(ratio))

        d3.select("#tt-dollars")
          .text(DOLLARS(+d.properties.cost))


        d3.select("#countyLabel")
          .text(d.properties.label)

        slice
          .data(pie([{"ratio": 1.0 - ratio,"fill":"empty"},{"ratio": ratio,"fill":"chart"}]))
          .transition().duration(400).attrTween("d", arcTween)
            .attr("fill", function(c) { return (c.data.fill == "empty") ? "none" : colorScale(c.data.ratio) });

        d3.selectAll(".pieLabel")
          .data(pie([{"ratio": 1 - ratio,"fill":"empty"},{"ratio": ratio,"fill":"chart"}]))
          .text(function(c){ return (c.data.fill == "chart") ? PERCENT(c.data.ratio) : ""})

      })
      .on("mouseout", function(d){
          restoreNational();
          d3.select(this)
            .classed("mouseover", false)
      });

  mapSvg.append("path")
      .attr("class", "county-borders")
      .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })))

  mapSvg.append("path")
      .attr("transform", "translate(0," + legend_height + ")")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);





});
