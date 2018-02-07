var SNAP_COST = 1.86;
var US_MEAL = 2.29;
var PERCENT = d3.format(".0%")
var DOLLARS = d3.format("$.2f")






function scale (scaleFactor) {
    return d3.geoTransform({
        point: function(x, y) {
            this.stream.point(x * scaleFactor, y  * scaleFactor);
        }
    });
}



function drawGraphic(cw){
var MOBILE = (cw < 900);
var bars_width = (MOBILE) ? cw - 50 : 320;
var bars_height = 100;

var map_width = (MOBILE) ? cw - 50 : cw -50-bars_width;
var legend_height = 80;
var map_height = map_width * (600/960) + legend_height;
var active = ""

d3.selectAll("svg").remove()
d3.selectAll(".toRemove").remove()
var path = d3.geoPath().projection(scale(map_width/960));



var legendSvg = d3.select("#map")
.classed("mobile",MOBILE)
.append("svg")
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

var bHeight = (MOBILE) ? bars_height : map_height + legend_height;
d3.select("#bars")
  .classed("mobile",MOBILE)
  .style("height", bHeight + "px")
  .style("width", bars_width)

d3.select("#map")
  .style("height", (map_height + legend_height) + "px")
  .style("width", map_width)

var mTop = (MOBILE) ? -50 : legend_height;
d3.select("#bars").append("div")
  .style("width", bars_width + "px")
  .style("height", "40px")
  .attr("id", "countyLabel")
  .attr("class","toRemove")
  .text("National Average")
  .style("margin-top", mTop + "px")

var barsSvg = d3.select("#bars").append("svg")
  .attr("width", bars_width)
  .attr("height", bars_height)

d3.select("#bars").append("div")
  .attr("id", "tt-text")
  .attr("class","toRemove")
  .html("The average cost of a meal is <span id = \"tt-dollars\">" + DOLLARS(US_MEAL) + "</span>,<br/><span id = \"tt-percent\">" + PERCENT(1 - SNAP_COST/ US_MEAL) + " more</span> than the SNAP benefit.")


var US_RATIO = (US_MEAL - SNAP_COST) / SNAP_COST
var marginLeft = 70,
    marginRight = 45
var barX = d3.scaleLinear().domain([4.4,0]).range([bars_width-marginLeft-marginRight,0])

var b1 = barsSvg.append("rect")
  .attr("x", marginLeft)
  .attr("y",0)
  .attr("height",40)
  .attr("fill", "#d2d2d2")
  .attr("width", barX(SNAP_COST))

var b2 = barsSvg.append("rect")
  .attr("id", "costRect")
  .attr("x", marginLeft)
  .attr("y",50)
  .attr("height",40)
  .attr("fill", "#fdbf11")
  .attr("width", barX(US_MEAL))

barsSvg.append("text")
  .attr("class","barCat")
  .attr("x",marginLeft - 10)
  .attr("y",16)
  .attr("text-anchor","end")
  .text("SNAP")

barsSvg.append("text")
  .attr("class","barCat")
  .attr("x",marginLeft - 10)
  .attr("y",31)
  .attr("text-anchor","end")
  .text("benefit")


barsSvg.append("text")
  .attr("class","barCat")
  .attr("x",marginLeft - 10)
  .attr("y",16+50)
  .attr("text-anchor","end")
  .text("Average")

barsSvg.append("text")
  .attr("class","barCat")
  .attr("x",marginLeft - 10)
  .attr("y",31+50)
  .attr("text-anchor","end")
  .text("meal cost")

barsSvg.append("text")
  .attr("class","barVal snap")
  .attr("x",barX(SNAP_COST) + 7 + marginLeft)
  .attr("y",25)
  .attr("text-anchor","start")
  .text(DOLLARS(SNAP_COST))

barsSvg.append("text")
  .attr("class","barVal meal")
  .attr("x",barX(US_MEAL) + 7 + marginLeft)
  .attr("y",25+50)
  .attr("text-anchor","start")
  .text(DOLLARS(US_MEAL))



function restoreNational(){
  d3.selectAll(".clicked").classed("clicked",false)
  d3.select("#tt-dollars").text(DOLLARS(US_MEAL))
  d3.select("#tt-percent").text(PERCENT(US_RATIO) + " more")
  d3.select("#countyLabel").text("National Average")
  d3.select(".barVal.meal")
    .transition()
    .attr("x",barX(US_MEAL) + 7 + marginLeft)
    .text(DOLLARS(US_MEAL))

  d3.select("#costRect")
    .transition()
    .attr("width", barX(US_MEAL))
}

restoreNational();

d3.json("data/data.json", function(error, us) {
  if (error) throw error;

  var g = mapSvg.append("g")

    g.attr("class", "counties")
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

        d3.select(this)
          .classed("mouseover", true)

          mouseover(d)

      })
      .on("mouseout", function(c){
          if(d3.selectAll(".clicked").nodes().length != 0){
            var d = d3.select(".clicked").datum()
            d3.select(this)
              .classed("mouseover", false)
            mouseover(d)
          }else{
            restoreNational();
            d3.select(this)
              .classed("mouseover", false)
          }
      })
      .on("click", clicked)

            


g.append("path")
    .attr("class", "county-borders")
    .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })))

g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("class", "states")
    .attr("d", path)

var noteWidth = 140;
var zoomOut = mapSvg.append("g")
  .attr("transform", "translate(" + (map_width - noteWidth) + "," + (map_height + 50) + ")")
  .style("cursor","pointer")
  .on("click", reset)

zoomOut.append("rect")
  .attr("fill","rgba(255,255,255,.7)")
  .attr("x",0)
  .attr("y",0)
  .attr("width",noteWidth)
  .attr("height",30)
zoomOut.append("text")
  .attr("x", noteWidth/2)
  .attr("y", 20)
  .attr("id", "zoomOut")
  .attr("text-anchor","middle")
  .text("Reset to National")

function mouseover(d){
    var ratio = (+d.properties.cost - SNAP_COST)/SNAP_COST

    d3.select("#tt-percent").text(function(){
      var moreLess = (ratio < 0) ? " less" : " more"
      return PERCENT(Math.abs(ratio)) + moreLess;
    })
    d3.select("#tt-dollars")
      .text(DOLLARS(+d.properties.cost))


    d3.select("#countyLabel")
      .text(d.properties.label)

    d3.select("#costRect")
      .transition()
      .attr("width", barX(+d.properties.cost))

    d3.select(".barVal.meal")
      .transition()
      .attr("x",barX(+d.properties.cost) + 7 + marginLeft)
      .text(DOLLARS(+d.properties.cost))
}
function clicked(c) {
  var clicked = d3.select(this).classed("clicked")
  d3.selectAll(".clicked").classed("clicked", false)

  d3.select(this).classed("clicked", !clicked)
  var st = c.id.substring(0,2)

  var d = topojson.feature(us, us.objects.states).features.filter(function(s){ return s.id == st})[0]

  d3.selectAll(".countyPath:not(.st-" + st + ")")
    .classed("zoomed", false)
    .transition()
    .style("opacity",.4)
    .style("stroke-opacity",0)
  d3.selectAll(".countyPath.st-" + st)
    .classed("zoomed", true)
    .style("opacity",1)
    .style("stroke-opacity",1)

  active = st;

  zoomOut
    .transition()
    .attr("transform", "translate(" + (map_width - noteWidth) + "," + (map_height - 30) + ")")

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
  restoreNational();

  d3.selectAll(".countyPath")
  .classed("zoomed", false)
  .transition()
    .style("opacity",1)
    .style("stroke-opacity",1)

  active = ""

  zoomOut
    .transition()
    .attr("transform", "translate(" + (map_width - noteWidth) + "," + (map_height + 50) + ")")


  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "");
}




});
}
var pymChild = new pym.Child({ renderCallback: drawGraphic });
