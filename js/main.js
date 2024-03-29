var US_SNAP_COST = 1.97;
var US_SNAP_COST15 = 2.27;
var US_SNAP_COST21 = 2.38;
var US_MEAL = 2.41;
var PERCENT = d3.format(".0%")
var DOLLARS = d3.format("$.2f")

var RUCC_TEXT = [
"",
"Counties in metropolitan areas of 1 million people or more",
"Counties in metropolitan areas of 250,000 to 1 million people",
"Counties in metropolitan areas of fewer than 250,000 people",
"Nonmetropolitan counties: urban population of 20,000 or more, adjacent to a metropolitan area",
"Nonmetropolitan counties: urban population of 20,000 or more, not adjacent to a metropolitan area",
"Nonmetropolitan counties: urban population of 2,500 to 19,999, adjacent to a metropolitan area",
"Nonmetropolitan counties: urban population of 2,500 to 19,999, not adjacent to a metropolitan area",
"Nonmetropolitan counties: completely rural, or urban population of less than 2,500, adjacent to a metropolitan area",
"Nonmetropolitan counties: completely rural, or urban population of less than 2,500, not adjacent to a metropolitan area"
]




function scale (scaleFactor) {
    return d3.geoTransform({
        point: function(x, y) {
            this.stream.point(x * scaleFactor, y  * scaleFactor);
        }
    });
}

function getSnapType(){
  // return d3.select(".toggle").classed("on") ? "snap21" : "snap"
  return $("#scenarioMenu").val()
  // return "snap21"
}


function drawGraphic(cw){


d3.selectAll("svg").remove()
d3.selectAll(".toRemove").remove()



var MOBILE = (cw < 900);
var PHONE = (cw < 520);
console.log(PHONE)
var bars_width = (MOBILE) ? cw - 30 : 330;
var bars_height = 100;

var map_width = (MOBILE) ? cw - 0 : cw -50-bars_width;
var legend_height = 80;
var map_height = map_width * (600/960) + legend_height;
var active = ""


var path = d3.geoPath().projection(scale(map_width/960));



var legendSvg = d3.select("#map")
.classed("mobile",MOBILE)
.append("svg")
  .attr("width", map_width)
  .attr("height", legend_height)


var mapSvg = d3.select("#map").append("svg")
  .attr("id", "mapSvg")
  .attr("width", map_width)
  .attr("height", map_height)


var colors =["#e88e2d","#fdbf11","#fccb41", "#fdd870", "#fce39e", "#fff2cf","#cfe8f3","#a2d4ec","#73bfe2","#46abdb","#1696d2","#12719e"]
var breaks = [-.5,-.4,-.3,-.2,-.1, 0,.1,.2,.3,.4,.5,.65]
var colorScale = d3.scaleThreshold();    

colorScale.range(colors);
colorScale.domain(breaks);

// legendSvg.append("text")
//   .attr("x", 15)
//   .attr("y", 20)
//   .attr("id", "legendTitle")
//   .text("Gap between SNAP benefit and meal cost in 2020")

var keyW = (PHONE) ? 20 : 35;
var keyH = 15;
var legend = legendSvg.append("g")
  .attr("transform", "translate(15, 30)")
legend.append("text")
  .attr("class", "keyItem")
  .attr("dx", 0)
  .attr("text-anchor", "middle")
  .attr("dy", keyH + 13)
  .text(PERCENT(-.75))

for (var i = 0; i < breaks.length; i++){
  legend.append("rect")
    .attr("x", i*keyW)
    .attr("y", 0)
    .attr("width", keyW)
    .attr("height", keyH)
    .attr("fill", colors[i])
    .attr("stroke", "none")
    .datum(i)
    // .on("mouseover", function(d){
    //   d3.selectAll(".countyPath").classed("hide", true)
    //   d3.selectAll(".countyPath.q-" + d).classed("hide", false)
    // })
    // .on("mouseout", function(d){
    //   d3.selectAll(".countyPath").classed("hide", false)
    // })
  legend.append("text")
    .attr("class", "keyItem")
    .attr("dx", (i+1)*keyW)
    .attr("text-anchor", "middle")
    .attr("dy", keyH + 13)
    .text(PERCENT(breaks[i]))
  .style("opacity", function(){
    if(!PHONE) return 1
    else return(i%2 == 1) ? 1 : 0;
  })
}



var bHeight = (MOBILE) ? bars_height + 100: map_height + legend_height;
d3.select("#bars")
  .classed("mobile",MOBILE)
  .style("height", bHeight + "px")
  .style("width", bars_width)

d3.select("#map")
  .style("height", (map_height + legend_height) + "px")
  .style("width", map_width)

var mTop = (MOBILE) ? 0 : legend_height;
d3.select("#bars").append("div")
  .style("width", bars_width + "px")
  .style("height", "24px")
  .attr("id", "countyLabel")
  .attr("class","toRemove")
  .text("National average")
  .style("margin-top", mTop + "px")
  .style("top","22px")

var ruccLabel = d3.select("#bars").append("div")
  // .style("width", bars_width + "px")
  // .style("height", "40px")
  .attr("id", "ruccLabel")
  .attr("class","toRemove")
  .style("visibility","hidden")


ruccLabel.append("div")
  .attr("class", "ruccLabelText")
  .html("RUCC code <span></span>")

ruccLabel.append("span")
  .attr("class", "ruccLabelTt")
  .text("i")
  .on("mouseover", function(){
    d3.select("#ruccPopup").style("display", "block")
  })
  .on("mouseout", function(){
    d3.select("#ruccPopup").style("display", "none")
  })

ruccLabel.append("div")
  .attr("id", "ruccPopup")
  .style("display", "none")

  // .html("RUCC code <span></span>")

  // .style("margin-top", mTop + "px")  
// (a - b) / a  = a/a  - b/a
var barsSvg = d3.select("#bars").append("svg")
  .attr("width", bars_width)
  .attr("height", bars_height)

d3.select("#bars").append("div")
  .attr("id", "tt-text")
  .attr("class","toRemove")
  .html("A modestly priced meal costs <span id = \"tt-dollars\">" + DOLLARS(US_MEAL) + "</span>,<br/><span id = \"tt-percent\">" + PERCENT(1 - US_SNAP_COST21/ US_MEAL) + " more</span> than the SNAP benefit.")


var US_RATIO = (US_MEAL - US_SNAP_COST) / US_SNAP_COST
var US_RATIO21 = (US_MEAL - US_SNAP_COST21) / US_SNAP_COST21
var US_RATIO15 = (US_MEAL - US_SNAP_COST15) / US_SNAP_COST15
var marginLeft = 100,
    marginRight = 45
var barX = d3.scaleLinear().domain([6.5,0]).range([bars_width-marginLeft-marginRight,0])

var b1 = barsSvg.append("rect")
  .attr("id", "snapRect")
  .attr("x", marginLeft)
  .attr("y",0)
  .attr("height",40)
  .attr("fill", "#000")
  .attr("width", barX(US_SNAP_COST21))

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
  .text("SNAP benefit")

barsSvg.append("text")
  .attr("class","barCat")
  .attr("x",marginLeft - 10)
  .attr("y",31)
  .attr("text-anchor","end")
  .text("per meal")


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
  .attr("x",barX(US_SNAP_COST21) + 7 + marginLeft)
  .attr("y",25)
  .attr("text-anchor","start")
  .text(DOLLARS(US_SNAP_COST21))

barsSvg.append("text")
  .attr("class","barVal meal")
  .attr("x",barX(US_MEAL) + 7 + marginLeft)
  .attr("y",25+50)
  .attr("text-anchor","start")
  .text(DOLLARS(US_MEAL))




// restoreNational();

d3.json("data/data.json", function(error, us) {

var ruccC = d3.select("#ruccInnerContainer")
for(var i = 1; i < 10; i++){
ruccC.append("div")
    .attr("class", "ruccInner toRemove")
    .text(i)
    .datum(i)
    .on("mouseover", function(d){
      d3.selectAll(".countyPath").classed("hide", true)
      d3.selectAll(".countyPath.rucc-" + d).classed("hide", false)
      if(d3.selectAll(".clicked").nodes().length == 0){
        restoreNational(d)
      }
    })
    .on("mouseout", function(d){
      
      if(d3.selectAll(".ruccInner.ruccClicked").nodes().length == 0){
        d3.selectAll(".countyPath").classed("hide", false)
      }else{
        d3.selectAll(".countyPath").classed("hide", true)
        var cl = d3.select(".ruccInner.ruccClicked").datum()
        console.log(cl)
        d3.selectAll(".countyPath.rucc-" + cl).classed("hide", false)
      }
      if(d3.selectAll(".clicked").nodes().length == 0){
        restoreNational()
      }
    })
    .on("click", function(d){
      if(d3.select(this).classed("ruccClicked")){
        d3.select(this).classed("ruccClicked", false)
        d3.selectAll(".countyPath").classed("hide", false)
      }else{
        d3.selectAll(".ruccInner").classed("ruccClicked", false)
        d3.select(this).classed("ruccClicked", true)
        d3.selectAll(".countyPath").classed("hide", true)
        d3.selectAll(".countyPath.rucc-" + d).classed("hide", false)
      }
      if(d3.selectAll(".clicked").nodes().length == 0){
        restoreNational()
      }
    })
    .style("left", function(){
      var w = d3.select("#graphic").node().getBoundingClientRect().width
      var total = (MOBILE) ? Math.min(cw-20, 506-20) : 506;
      return (((i-1)*total/9) + .5*(w-total) + "px")
    })
}


function restoreNational(ruccOverride){
  // var natlSnap = (getSnapType() == "snap") ? US_SNAP_COST : US_SNAP_COST15,
      // natlRatio = (getSnapType() == "snap") ? US_RATIO : US_RATIO21;
  var natlSnap,
      natlRatio,
      snapType = getSnapType()
      ruccClicked = d3.select(".ruccInner.ruccClicked")
    console.log(typeof(ruccOverride))

  if(ruccClicked.node() == null && typeof(ruccOverride) == "undefined" ){

    if(snapType == "snap"){
      natlSnap = US_SNAP_COST
      natlRatio = US_RATIO
    }
    else if(snapType == "snap15"){
      natlSnap = US_SNAP_COST15
      natlRatio = US_RATIO15
    }
    else if(snapType == "snap21"){
      natlSnap = US_SNAP_COST21
      natlRatio = US_RATIO21    
    }
    d3.selectAll(".clicked").classed("clicked",false)
    d3.select("#tt-dollars").text(DOLLARS(US_MEAL))
    d3.select("#tt-percent").text(function(){
      return (getSnapType() == "snap") ? PERCENT(natlRatio) + " more" : PERCENT(Math.abs(natlRatio)) + " more"
    })
    d3.select("#countyLabel").text("National average")
    d3.select(".barVal.meal")
      .transition()
      .attr("x",barX(US_MEAL) + 7 + marginLeft)
      .text(DOLLARS(US_MEAL))

    d3.select("#snapRect")
      .transition()
      .attr("width", barX(natlSnap))

    d3.select("#costRect")
      .transition()
      .attr("width", barX(US_MEAL))

    d3.select(".barVal.snap")
      .transition()
      .attr("x",barX(natlSnap) + 7 + marginLeft)
      .text(DOLLARS(natlSnap))
    d3.select("#ruccLabel").style("visibility","hidden")
    d3.select("#countyLabel").style("top", "22px")
  }else{
    var r = (typeof(ruccOverride) == "undefined") ? d3.select(".ruccInner.ruccClicked").datum() : ruccOverride
    var ruccAvgs = {
      "1": 3.239099,
      "2": 3.053862,
      "3": 2.983320,
      "4": 2.938644,
      "5": 2.919323,
      "6": 2.872674,
      "7": 2.915412,
      "8": 2.926389,
      "9": 2.956258
    }
    var d = {"properties": {
        "rucc": r,
        "snap": US_SNAP_COST,
        "snap15": US_SNAP_COST15,
        "snap21": US_SNAP_COST21,
        "cost": ruccAvgs[String(r)],
        "label": "RUCC " + String(r) + " average"
      }
    }
    mouseover(d)
  }
}


  if (error) throw error;

  var g = mapSvg.append("g")

    g.attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", function(d){
        var cost = +d.properties.cost,
            snap21 = +d.properties.snap21
        var color = colorScale((cost - snap21)/snap21)
        var st = d.id.substring(0,2)
        var rucc = d.properties.rucc
        var disabled = (st == "02" || st == "15") ? " disabled" : ""

        return "countyPath q-" + colors.indexOf(color) + " st-" + st + " rucc-" + rucc + disabled
      })
      .attr("display", function(d){
        return d.properties.hasOwnProperty("cost") ? "block" : "none"
      })
      .attr("fill", function(d){
        // console.log(d)
        var cost = +d.properties.cost,
        snap21 = +d.properties.snap21
        return colorScale((cost - snap21)/snap21)
      })
      // .attr("stroke", function(d){
      //   var cost = +d.properties.cost,
      //       snap21 = +d.properties.snap21
      //   return colorScale(1 - snap21/cost)
      // })
      .on("mouseover", function(d){
        // console.log(d)
        d3.select(this)
          .classed("mouseover", true)
          d3.select(".states").node().parentNode.appendChild(d3.select(".states").node())
        this.parentNode.appendChild(this)
      if(d3.selectAll(".clicked").nodes().length != 0){
        var c = d3.select(".clicked").datum()
        // d3.select(".states").node().parentNode.appendChild(d3.select(".states").node())
        d3.selectAll(".clicked").nodes()[0].parentNode.appendChild(d3.selectAll(".clicked").nodes()[0])

        mouseover(d)
      }
          mouseover(d)

      })
      .on("mouseout", function(c){
        d3.select(".states").node().parentNode.appendChild(d3.select(".states").node())
          if(d3.selectAll(".clicked").nodes().length != 0){
            var d = d3.select(".clicked").datum()
            d3.select(this)
              .classed("mouseover", false)
            mouseover(d)
            d3.selectAll(".clicked").nodes()[0].parentNode.appendChild(d3.selectAll(".clicked").nodes()[0])
          }else{
            restoreNational();
            d3.select(this)
              .classed("mouseover", false)
              .style("stroke","white")
          }
      })
      .on("click", clicked)


var zoom = d3.zoom()
  .on('zoom', function() {
    g.attr('transform', d3.event.transform);
  })

// var zoom = d3.zoom()
//       .scaleExtent([1, 8])
//       .on('zoom', function() {
//           d3.selectAll('path')
//            .attr('transform', d3.event.transform)
//           })

g.call(zoom);



d3.select('#zoom-in').on('click', function() {
  zoom.scaleBy(g.transition().duration(750), 1.3);
});

d3.select('#zoom-out').on('click', function() {
  zoom.scaleBy(g.transition().duration(750), 1 / 1.3);
});



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
  // console.log(this, d)
    var ratio = (+d["properties"]["cost"] - +d["properties"][getSnapType()])/+d["properties"][getSnapType()]
// console.log(ratio)
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

    d3.select("#snapRect")
      .transition()
      .attr("width", barX(+d["properties"][getSnapType()]))

    d3.select(".barVal.meal")
      .transition()
      .attr("x",barX(+d.properties.cost) + 7 + marginLeft)
      .text(DOLLARS(+d.properties.cost))
    d3.select(".barVal.snap")
      .transition()
      .attr("x",barX(+d["properties"][getSnapType()]) + 7 + marginLeft)
      .text(DOLLARS(+d["properties"][getSnapType()]))

    d3.select("#ruccLabel").style("visibility","visible")
    d3.select("#countyLabel").style("top", "0px")
    d3.select(".ruccLabelText span").text(d.properties.rucc)
    d3.select("#ruccPopup").html(RUCC_TEXT[+d.properties.rucc])
}




function clicked(c) {
  // console.log(this)
  var clicked = d3.select(this).classed("clicked")
  d3.select(".states").node().parentNode.appendChild(d3.select(".states").node())

  this.parentNode.appendChild(this)
  
  d3.selectAll(".clicked").classed("clicked", false)


  d3.select(this).classed("clicked", !clicked)
  var st = c.id.substring(0,2)

  var d = topojson.feature(us, us.objects.states).features.filter(function(s){ return s.id == st})[0]

  // d3.selectAll(".countyPath:not(.st-" + st + ")")
  //   .classed("zoomed", false)
  //   .transition()
  //   .style("opacity",.4)
  //   .style("stroke-opacity",0)
  // d3.selectAll(".countyPath.st-" + st)
  //   .classed("zoomed", true)
  //   .style("opacity",1)
  //   .style("stroke-opacity",1)

  // active = st;

  // zoomOut
  //   .transition()
  //   .attr("transform", "translate(" + (map_width - noteWidth) + "," + (map_height - 70) + ")")

  // var bounds = path.bounds(d),
  //     dx = bounds[1][0] - bounds[0][0],
  //     dy = bounds[1][1] - bounds[0][1],
  //     x = (bounds[0][0] + bounds[1][0]) / 2,
  //     y = (bounds[0][1] + bounds[1][1]) / 2,
  //     scale = .9 / Math.max(dx / map_width, dy / map_height),
  //     translate = [map_width / 2 - scale * x, map_height / 2 - scale * y];

  // g
  // .attr("transform", "")
  // .transition()
  //     .duration(750)
  //     .style("stroke-width", 1.5 / scale + "px")
  //     .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
      // .attr("transform", "");
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
      // .style("stroke-width", "1.5px")
      .attr("transform", "");

  // zoom.transform(g, d3.zoomIdentity.translate(0,0).scale(map_width/960));



}

function updateGraphic(snapType){
  console.log(snapType)

      d3.selectAll(".countyPath")
      .attr("class", function(d){
        var zoomed = (d3.select(this).classed("zoomed")) ? " zoomed" : "" 
        var clicked = (d3.select(this).classed("clicked")) ? " clicked" : "" 
        var color = colorScale( (+d["properties"]["cost"] - +d["properties"][snapType])/+d["properties"][snapType])
        var st = d.id.substring(0,2)
        var rucc = d.properties.rucc
        var disabled = ( snapType == "snap21" && (st == "02" || st == "15")) ? " disabled" : ""
        var hide = (d3.select(".ruccClicked.ruccInner").node() != null) ?
          ( (d3.select(".ruccClicked.ruccInner").datum() == rucc) ? "" : " hide") : ""

        return "toRemove countyPath q-" + colors.indexOf(color) + " st-" + st + " rucc-" + rucc + zoomed + clicked + disabled + hide
      })
      .transition()
      .attr("fill", function(d){
        // console.log(d)

        return colorScale((+d["properties"]["cost"] - +d["properties"][snapType])/+d["properties"][snapType])
      })
      // .attr("stroke", function(d){
      //   // console.log(d3.select(".zoomed").node())
      //   // return colorScale(1 - +d["properties"][snapType]/+d.properties.cost)
      // })

      if(d3.selectAll(".clicked").nodes().length != 0){
        var d = d3.select(".clicked").datum()
        d3.select(".states").node().parentNode.appendChild(d3.select(".states").node())
        d3.selectAll(".clicked").nodes()[0].parentNode.appendChild(d3.selectAll(".clicked").nodes()[0])
        mouseover(d)
      }else{
        restoreNational();
      }

}

  $.widget( "custom.styledMenu", $.ui.selectmenu, {
  _renderItem: function(ul, item){

        var li = $( "<li>" ),
          wrapper = $( "<div>", { html: "<strong>" + item.label.split("(")[0] + "</strong>" + " (" +  item.label.split("(")[1]} );
          console.log(wrapper)
 
 
        return li.append( wrapper ).appendTo( ul );

    }
  })


    $( "#scenarioMenu")
    .styledMenu({
      change: function(event, d){
        updateGraphic(d.item.value)
      }
    })
    .styledMenu("menuWidget")



});
}
var pymChild = new pym.Child({ renderCallback: drawGraphic });


