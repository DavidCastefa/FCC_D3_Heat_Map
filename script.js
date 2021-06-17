// Much of the JavaScript used in this project is based on Ganesh H's YouTube walkthrough
// at https://www.youtube.com/watch?v=6uM_wLOayYI

let dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
let req = new XMLHttpRequest

let rawData = []

let xScale
let yScale 

let height = window.innerHeight * 0.9;
let width = window.innerWidth * 0.92;
let padding = 70

let timeFormat = d3.timeFormat('%b'); // For the tooltip

let svg = d3.select("svg")

let drawCanvas = () => {
  svg.style("margin-top", 10)
  svg.attr("height", height)
  svg.attr("width", width)
}

let generateScales = () => {
  xScale = d3.scaleLinear()
              // extend an extra year to give space for cells
             .domain([d3.min(tempData, item => item.year), 
                d3.max(tempData, item => item.year) + 1])
             .range([padding, width - padding])

  yScale = d3.scaleTime()
             // new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)
             // extend to monthIndex = 12 to give space for cells
             .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
             .range([height - padding, padding])                                    
}

let drawAxes = () => {
  let xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format("d"))
  svg.append("g")
     .attr("id", "x-axis")
     .call(xAxis)
     .attr("transform", "translate(0, " + (height - padding) + ")");
  svg.append('text')
     .attr('x', width / 2)
     .attr('y', height - 25)
     .style('font-size', 15)
     .text('Year');

  let yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat("%B"))
  svg.append("g")
     .attr("id", "y-axis")
     .call(yAxis)
     .attr("transform", "translate(" + padding + ", 0)");
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -400)
    .attr('y', 20)
    .style('font-size', 15)
    .text('Month');
} 

let drawCells = () => {

  let tooltip = d3.select("body")
                  .append("div")
                  .attr("id", "tooltip")
                  .style("opacity", 0)

  svg.selectAll("rect")
    .data(tempData)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", item => xScale(item.year))
    .attr("y", item => yScale(new Date(0, item.month - 0, 0, 0, 0, 0, 0)))
    .attr("height", (height - 2 * padding) / 12)
    .attr("width", (width - 2 * padding ) / (tempData.length / 12))
    .attr("data-month", item => item.month -1)
    .attr("data-year", item => item.year)
    .attr("data-temp", item => baseTemp + item.variance)
    .attr("fill", item => {
      let netTemp = baseTemp + item.variance
      if (netTemp <= 5.5) return "indigo"
      if (netTemp > 5.5 && netTemp <= 7) return "blue"
      if (netTemp > 7 && netTemp <= 8.5) return "green"
      if (netTemp > 8.5 && netTemp <= 10) return "yellow"
      if (netTemp > 10 && netTemp <= 11.5) return "orange"
      if (netTemp > 11.5) return "red"
     })

    .on("mouseover", (event, item) => {
      tooltip.style("opacity", 1)
             .attr("data-year", item.year)
             .attr("data-month", timeFormat(new Date(0, item.month - 0, 0, 0, 0, 0, 0)) )
             .html(
                timeFormat(new Date(0, item.month - 0, 0, 0, 0, 0, 0)) + " " + 
                item.year + "<br/>" + 
                "LST = " + 
                Math.round((baseTemp + item.variance) * 100) /100 + // round to two decimal points
                " &#176C" 
              )
             .style("position", "absolute")
             .style("left", (event.pageX + 4) + "px")
             .style("top", (event.pageY - 40) + "px")
      })
    .on("mouseleave", (event, item) => {
      tooltip.style("opacity", 0)
             .html("")  // Avoid interference with other data points
      })
}

req.open("GET", dataUrl, true)
req.onload = () => {
  rawData = JSON.parse(req.responseText)
  baseTemp = rawData.baseTemperature
  tempData = rawData.monthlyVariance
  console.log("baseTemp", baseTemp)
  console.log(tempData)

  drawCanvas()
  generateScales()
  drawAxes()
  drawCells()
 }
req.send()