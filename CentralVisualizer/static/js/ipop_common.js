var modaltemplate = "<H4>Node Info</H4><table id='NodeDetails'><col style='width:35%'><col style='width:65%'><tr><td class='keyclass'>Name</td><td class='valueclass'>$nodename</td></tr><tr><td class='keyclass'>UID</td><td class='valueclass'>$uid</td></tr><tr><td class='keyclass'>MAC</td><td class='valueclass'>$macaddress</td></tr><tr><td class='keyclass'>IPOP-IP</td><td class='valueclass'>$ipopip</td></tr><tr><td class='keyclass'>Geo-IP</td><td class='valueclass'>$phyip</td></tr><tr><td class='keyclass'>State</td><td class='valueclass'>$state</td></tr><tr><td class='keyclass'>Start-Time</td><td class='valueclass'>$startdate</td></tr><tr><td class='keyclass'></td><td class='valueclass'>$starttime</td></tr><tr><td class='keyclass'>Location</td><td class='valueclass'>$location</td></tr><tr><td class='keyclass'></td><td class='valueclass'>$country</td></tr><tr><td class='keyclass'>Links</td><td class='valueclass' id='myModal_chord'>Chords (O)&emsp;&emsp; $chord</td></tr><tr><td class='keyclass'></td><td class='valueclass' id='myModal_successor'>Successor (Y)&emsp;$successor</td></tr><tr><td class='keyclass'></td><td class='valueclass'>On-Demand (B) $ondemand</td></tr></table>";

var serverip = location.host;

// Flag to enable/disable subgraph node selection
var disableoldclick = false;
var lenofdata = 0;

var cy = cytoscape({
                    container: document.getElementById('topology'),
                    layout: {
                            name: 'circle'
                            },
                    style: [
                            {
                              selector: 'node',
                              style: {
                  		              "width":"7.5em",
                  		              "height":"7.5em",
                                    "label": "data(label)",
                                		"min-zoomed-font-size": "1.5em",	
                                		"background-color": "data(nodeColor)",	
                                		"color": "#fff",	
                                  }
              	            },	
              	            {
                              selector: 'edge',
                              style: {
                                    "line-color": "data(edgeColor)",
              	                 }
                            }
                           ],
              	    minZoom: 1e-1,
                	  maxZoom: 3.1,	
              	    wheelSensitivity: 0.2
                  });      

var nodeDetails = {};
var linkDetailes = {};

function buildnetworktopology()
{
  var nodelist = arguments[0];
    
  for (node in nodelist) {
    cy.add({
            data: { 
                    id: nodelist[node]["uid"],
                    label: nodelist[node]["node_name"],  
                    nodeColor: findNodeColor(nodelist[node]["state"]) 
                  }
          });
    cy.makeLayout({name: 'circle'}).run();
    nodeDetails[nodelist[node]["uid"]] = nodelist[node];
    nodeDetails[nodelist[node]["uid"]]["linkIDs"] = [];  
  }

  for (node in nodelist) {
    for (linktype in nodelist[node]["links"]){
      for (target in nodelist[node]["links"][linktype]){
        cy.add({
                data:{ 
                      id: linktype + "_" + nodelist[node]["uid"] + "_" + nodelist[node]["links"][linktype][target], 
                      source: nodelist[node]["uid"], 
                      target: nodelist[node]["links"][linktype][target], 
                      edgeColor: findEdgeColor(linktype) 
                     }
              });
        nodeDetails[nodelist[node]["uid"]]["linkIDs"].push(linktype + "_" + nodelist[node]["uid"] + "_" + nodelist[node]["links"][linktype][target]);
      }
    }
  }

}

cy.on('mouseover','node',function(event){			
	cy.style()
		.selector('#'+event.target.id())
		.style({'opacity':'0.5'})
		.update();
	mouseOverNode(nodeDetails[event.target.id()]["linkIDs"]);	
});

cy.on('mouseout','node',function(event){		
	cy.style()
		.selector('#'+event.target.id())
		.style({'opacity':'1'})
		.update();
	mouseOutNode(nodeDetails[event.target.id()]["linkIDs"]);
});

cy.on('click','node',function(event){
	var t = mouseClickNode(nodeDetails[event.target.id()]);	
	cy.$('#'+event.target.id()).qtip({
		content: t,
		style: {classes: 'qtip-bootstrap'}
	});
});

cy.on('mouseover','edge',function(event){
  var linktype = event.target.id().split("_")[0]; 
  cy.style()
        .selector('#'+event.target.id())
        .style({'line-color':findLinkColor(linktype)})
        .update();
});
		
cy.on('mouseout','edge',function(event){
  cy.style()
        .selector('#'+event.target.id())
        .style({'line-color':'data(edgeColor)'})
        .update();
});

	
function findNodeColor(state) {
	if (state == "connected")
     		return "green";
	if (state == "searching")
      	return "yellow";
  if (state == "connecting")
      	return "orange";
  if (state == "started")
      	return "steelblue";
   	return "red";
}

function findEdgeColor(linktype) {
	if (linktype == "successor")
       			return "#9E9E9E";
	if (linktype == "chord")
       			return "#C0C0C0";
	if (linktype == "on_demand")
       			return "#E2E2E2";
}

function findLinkColor(linktype){
	if(linktype == "successor")
		return "yellow";
	if(linktype == "chord")
		return "orange";
	if(linktype == "on_demand")
		return "blue";	
}

function mouseOverNode(linkIDs) {
  for (edge in linkIDs){
    var splitEdge = linkIDs[edge].split("_");
    cy.style()
        .selector('#'+ splitEdge[0]+"_"+splitEdge[1]+"_"+splitEdge[2])
        .style({'line-color':findLinkColor(splitEdge[0])})
        .update();
    cy.style()
        .selector('#'+ splitEdge[0]+"_"+splitEdge[2]+"_"+splitEdge[1])
        .style({'line-color':findLinkColor(splitEdge[0])})
        .update();
  }
}

function mouseOutNode(linkIDs) {
  for (edge in linkIDs){
    var splitEdge = linkIDs[edge].split("_");
    cy.style()
        .selector('#'+ splitEdge[0]+"_"+splitEdge[1]+"_"+splitEdge[2])
        .style({'line-color':'data(edgeColor)'})
        .update();
    cy.style()
        .selector('#'+ splitEdge[0]+"_"+splitEdge[2]+"_"+splitEdge[1])
        .style({'line-color':'data(edgeColor)'})
        .update();
  }  
}

function mouseClickNode(node)
{
  var temptime = "";
  var uptime = node["starttime"];
  uptime = new Date(uptime*1000);
  temptime = temptime + uptime.toString();
  uptime = uptime.toLocaleString().split(" ");
  date = uptime[0].substring(0,uptime[0].length-1);
  time = uptime[1] + " " + uptime[2] + " " + temptime.split(" ")[6];            
          
  var location="";
  if (node["GeoIP"] != " " && Object.keys(node).indexOf("location")!=-1){
      location = node["location"]["city"]+", "+node["location"]["region"];
      country = node["location"]["country"];
  }

  var modalele = modaltemplate;
      modalele = modalele.replace("$nodename",node["node_name"]);
      modalele = modalele.replace("$ui",node["uid"].substring(0,7));
      modalele = modalele.replace("$ipopip",node["ip4"]);
      modalele = modalele.replace("$phyip",node["GeoIP"]);
      modalele = modalele.replace("$startdate",date);
      modalele = modalele.replace("$starttime",time);
      modalele = modalele.replace("$location",location);
      modalele = modalele.replace("$country",country);
      modalele = modalele.replace("$macaddress",node["mac"]);
      modalele = modalele.replace("$successor",node["links"]["successor"].length);
      modalele = modalele.replace("$ondemand",node["links"]["chord"].length);
      modalele = modalele.replace("$chord",node["links"]["on_demand"].length); 
      modalele = modalele.replace("$state",node["state"][0].toUpperCase()+node["state"].substring(1));
    return modalele;
}

function buildmanagednodetopology()
{
    var nodedatas = arguments[0], eleuid = arguments[1];
    var innerRadiusManagedTopology, h_interval = arguments[2];

    if (h_interval=="")
        innerRadiusManagedTopology = innerRadius -100;
    else
        innerRadiusManagedTopology = innerRadius;

    var managednodecluster = d3.layout.cluster()
    .size([360, innerRadiusManagedTopology])
    .sort(null)
    .value(function(d) { return d.size; });

    if (nodedatas["response"].length == 0)
        return;

    var managednodes = managednodecluster.nodes(packageHierarchy(nodedatas["response"]));
    var managedlinks = connections(managednodes);

    var managednode_svg = d3.select("#managednode_topology_"+eleuid+"_modal").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    var managedlink  = managednode_svg.selectAll(".link").data(bundle(managedlinks));
    managedlink.enter().append("path")
        .each(function(d) {
        d.source = d[0], d.target = d[d.length - 1]})
        .attr("class", "link")
        .attr("style", "display=block;")
        .attr("d", line)
        .attr("stroke","grey");

    var managednode = managednode_svg.selectAll(".node").data(managednodes.filter(function(n) { return !n.children; }));
    var managednodetext = managednode_svg.selectAll(".node").data(managednodes.filter(function(n) { return !n.children; }));

    managednode.enter().append("circle")
          .attr("class", "node")
          .attr("fill", "green")
          .attr("dy", ".31em")
            .attr("r", "10")
          .attr("transform", function(d) {
            return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
          .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; });

    managednodetext.enter().append("text")
      .attr("fill", "black")
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 28) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.name; });

    managednodetext.exit().remove();
    managedlink.exit().remove();
    managednode.exit().remove();

    document.getElementById(eleuid+"_modal_table_content").style.display = "none";
    document.getElementById(eleuid+"_modal_back").style.display = "block";
    document.getElementById(eleuid+"_modal_getunmanagednodes").style.display = "none";
}


function getunmanagednodes(event)
{
    var node_id = event.target.parentNode.id;
    var nodedetails = node_id.substring(0,node_id.indexOf("_modal_content"));
    var nodeuid = nodedetails.split("_")[0],
        history_interval = nodedetails.split("_")[1];
    var node_topology = document.getElementById("managednode_topology_"+nodedetails+"_modal");

    if (node_topology.style.display == "")
    {
        // nodedetaillist contains current state. transform to switch topology
        if (history_interval=="")
            nodedetaillist = $("#topology").find("circle");
        else
            nodedetaillist = $("#topology_"+history_interval).find("circle");
        var noOfElements = nodedetaillist["length"],i=0;
        nodedetaillist = Object.values(nodedetaillist);
        var switchnode = {"links":{}}
        for (;i<noOfElements;i++) {
            if(nodedetaillist[i]["__data__"]["uid"] == nodeuid) {
                switchnode["name"] = nodedetaillist[i]["__data__"]["ip4"];
                switchnode["links"]["successor"] = nodedetaillist[i]["__data__"]["unmanagednodelist"];
                break;
            }
        }
        if(switchnode["links"]["successor"].length > 0) {
            linknodes = [];
            switchnode["links"]["successor"].forEach(function(unmanlinknode) {
                linknodes.push({"name":unmanlinknode, "links":{"successor":[switchnode["name"]]}});
            });
            linknodes.push(switchnode);
            buildmanagednodetopology({"response":linknodes}, nodedetails,history_interval);
        }
    }
    else
    {
        node_topology.style.display ="block";
        document.getElementById(nodedetails+"_modal_table_content").style.display = "none";
        document.getElementById(nodedetails+"_modal_back").style.display = "block";
        document.getElementById(nodedetails+"_modal_getunmanagednodes").style.display = "none";
    }
}