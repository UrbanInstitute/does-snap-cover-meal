var SNAP_COST = 1.86;
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
var active = ""


    function scale (scaleFactor) {
        return d3.geoTransform({
            point: function(x, y) {
                this.stream.point(x * scaleFactor, y  * scaleFactor);
            }
        });
    }

    // path = d3.geoPath().projection(scale(2));



function drawGraphic(){
d3.selectAll("svg").remove()
d3.selectAll(".toRemove").remove()
var path = d3.geoPath().projection(scale(map_width/960));

var legendSvg = d3.select("#map").append("svg")
  .attr("width", map_width)
  .attr("height", legend_height)


var mapSvg = d3.select("#map").append("svg")
  .attr("width", map_width)
  .attr("height", map_height)


var colors =["#fff2cf","#cfe8f3","#a2d4ec","#73bfe2","#46abdb","#1696d2","#12719e"]
var breaks = [0,.1,.2,.3,.4,.5,1]
var colorScale = d3.scaleThreshold();    

colorScale.range(colors);
colorScale.domain(breaks);

legendSvg.append("text")
  .attr("x", 15)
  .attr("y", 20)
  .attr("id", "legendTitle")
  .text("Gap between SNAP benefit and meal cost")

var keyW = 40
var keyH = 20;
var legend = legendSvg.append("g")
  .attr("transform", "translate(15, 30)")
legend.append("text")
  .attr("class", "keyItem")
  .attr("dx", 0)
  .attr("text-anchor", "middle")
  .attr("dy", keyH + 13)
  .text(PERCENT(-.1))
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
  .style("height", (map_height + legend_height) + "px")
  .style("width", pie_width)

d3.select("#map")
  .style("height", (map_height + legend_height) + "px")
  .style("width", map_width)

d3.select("#pie").append("div")
  .style("width", pie_width + "px")
  .style("height", "40px")
  .attr("id", "countyLabel")
  .attr("class","toRemove")
  .text("National Average")
  .style("margin-top", legend_height + "px")

var pieSvg = d3.select("#pie").append("svg")
  .attr("width", pie_width)
  .attr("height", pie_height)
  .append("g").attr("transform", "translate(" + pie_width / 2 + "," + pie_radius + ")");

d3.select("#pie").append("div")
  .attr("id", "tt-text")
  .attr("class","toRemove")
  .html("The average cost of a meal is <span id = \"tt-dollars\">" + DOLLARS(US_MEAL) + "</span>, <span id = \"tt-percent\">" + PERCENT(1 - SNAP_COST/ US_MEAL) + "</span> more than the SNAP benefit.")

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return 1 - d.ratio; });

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
    .attr("fill", function(d) { return (d.data.fill == "empty") ? "#d2d2d2" : colorScale(1 - d.data.ratio) });

arc.append("circle")
  .attr("r", pie_inner_radius)
  .attr("cx",0)
  .attr("cy",0)
  .attr("fill","#ffffff")


var pieLabel = arc.append("text")
  .attr("class","pieLabel")
  .attr("text-anchor","middle")
  .attr("dy",9)
  .text(function(d){ return (d.data.fill == "chart") ? PERCENT(1 - d.data.ratio) : ""})

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return piePath(i(t));
  };
}


function restoreNational(){
  d3.select("#tt-dollars").text(DOLLARS(US_MEAL))
  d3.select("#tt-percent").text(PERCENT(1- SNAP_COST/ US_MEAL))
  d3.select("#countyLabel").text("National Average")
  slice
    .data(pie([{"ratio": 1.0 - US_RATIO,"fill":"empty"},{"ratio": US_RATIO,"fill":"chart"}]))
    .transition().duration(400).attrTween("d", arcTween)
      .attr("fill", function(c) { return (c.data.fill == "empty") ? "#d2d2d2" : colorScale(1 - c.data.ratio) });

  d3.selectAll(".pieLabel")
    .data(pie([{"ratio": 1 - US_RATIO,"fill":"empty"},{"ratio": US_RATIO,"fill":"chart"}]))
    .text(function(c){ return (c.data.fill == "chart") ? PERCENT(1 - c.data.ratio) : ""})

}

restoreNational();

d3.json("data/data.json", function(error, us) {
  if (error) throw error;

  var g = mapSvg.append("g")
  
    g.attr("class", "counties")
    // .attr("transform", "translate(0," + legend_height + ")")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", function(d){
        var cost = +d.properties.cost;
        var color = colorScale(1 - SNAP_COST/cost)
        var st = d.id.substring(0,2)

        return "countyPath q-" + colors.indexOf(color) + " st-" + st
      })
      .attr("display", function(d){
        return d.properties.hasOwnProperty("cost") ? "block" : "none"
      })
      .attr("fill", function(d){
        var cost = +d.properties.cost;
        return colorScale(1 - SNAP_COST/cost)
      })
      .attr("stroke", function(d){
        var cost = +d.properties.cost;
        return colorScale(1 - SNAP_COST/cost)
      })
      .on("mouseover", function(d){

        var ratio = (+d.properties.cost - SNAP_COST)/SNAP_COST

        d3.select(this)
          .classed("mouseover", true)

        d3.select("#tt-percent")
          .text(PERCENT(1-ratio))

        d3.select("#tt-dollars")
          .text(DOLLARS(+d.properties.cost))


        d3.select("#countyLabel")
          .text(d.properties.label)

        slice
          .data(pie([{"ratio": 1.0 - ratio,"fill":"empty"},{"ratio": ratio,"fill":"chart"}]))
          .transition().duration(400).attrTween("d", arcTween)
            .attr("fill", function(c) { return (c.data.fill == "empty") ? "#d2d2d2" : colorScale(1 - c.data.ratio) });

        d3.selectAll(".pieLabel")
          .data(pie([{"ratio": 1 - ratio,"fill":"empty"},{"ratio": ratio,"fill":"chart"}]))
          .text(function(c){ return (c.data.fill == "chart") ? PERCENT(1 - c.data.ratio) : ""})

      })
      .on("mouseout", function(d){
          restoreNational();
          d3.select(this)
            .classed("mouseover", false)
      })
      .on("click", clicked)

            


  g.append("path")
      .attr("class", "county-borders")
      .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })))

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path)





// function clicked(c) {
//   console.log(d, us.objects.states)
//   var st = c.id.substring(0,2),
//     state = topojson.feature(us, us.objects.states).features.filter(function(s){ return s.id == st})[0]
// var d = state;
//   var x, y, k;

//   if (d && centered !== d) {
//     var centroid = path.centroid(d);
//     x = centroid[0];
//     y = centroid[1];
//     k = 4;
//     centered = d;
//   } else {
//     x = width / 2;
//     y = height / 2;
//     k = 1;
//     centered = null;
//   }

//   g.selectAll("path")
//       .classed("active", centered && function(d) { return d === centered; });

//   g.transition()
//       .duration(750)
//       .attr("transform", "translate(" + map_width / 2 + "," + map_height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
//       .style("stroke-width", 1.5 / k + "px");
// }



function clicked(c) {
  var st = c.id.substring(0,2)
  if (active == st){ return reset() }

  var d = topojson.feature(us, us.objects.states).features.filter(function(s){ return s.id == st})[0]

  d3.selectAll(".countyPath:not(.st-" + st + ")").transition()
    .style("opacity",.4)
    .style("stroke-opacity",0)
  d3.selectAll(".countyPath.st-" + st)
    .style("opacity",1)
    .style("stroke-opacity",1)


  

  active = st;


  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / map_width, dy / map_height),
      translate = [map_width / 2 - scale * x, map_height / 2 - scale * y];

  g.transition()
      .duration(750)
      .style("stroke-width", 1.5 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function reset() {
  d3.selectAll(".countyPath").transition()
    .style("opacity",1)
    .style("stroke-opacity",1)
  active = ""
  

  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "");
}




});
}
drawGraphic() 
