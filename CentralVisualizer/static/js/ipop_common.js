var modaltemplate = "<H4>Node Info</H4><table id='NodeDetails'><col style='width:30%'><col style='width:70%'><tr><td class='keyclass'>Name</td><td class='valueclass'>$nodename</td></tr><tr><td class='keyclass'>UID</td><td class='valueclass'>$uid</td></tr><tr><td class='keyclass'>MAC</td><td class='valueclass'>$macaddress</td></tr><tr><td class='keyclass'>IPOP-IP</td><td class='valueclass'>$ipopip</td></tr><tr><td class='keyclass'>Geo-IP</td><td class='valueclass'>$phyip</td></tr><tr><td class='keyclass'>State</td><td class='valueclass' id='myModal_state'>$state</td></tr><tr><td class='keyclass'>StartTime</td><td class='valueclass' id='text_element_starttime'>$starttime</td></tr><tr><td class='keyclass'>Location</td><td class='valueclass' id='text_element_location'>$location</td></tr><tr><td class='keyclass'>Links</td><td class='valueclass' id='myModal_chord'>Chords  (Orange)  &ensp; $chord</td></tr><tr><td class='keyclass'></td><td class='valueclass' id='myModal_successor'>Successor (Yellow) $successor</td></tr><tr><td class='keyclass'></td><td class='valueclass' id='myModal_ondemand'>On-Demand (Blue) $ondemand</td></tr></table>";

var serverip = location.host;

// Flag to enable/disable subgraph node selection
var disableoldclick = false;

var diameter = Math.min(svg_width , svg_height),
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });

var lenofdata = 0;

var force = d3.layout.force();
var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("#topology"); 
  
var cy = cytoscape({
      container: document.getElementById('topology'),
      layout: {
              name: 'circle'
              },
      style: [{
            selector: 'node',
            style: {
		              "width":"7.5em",
		              "height":"7.5em",
                  "label": "data(id)",
              		"min-zoomed-font-size": "1.5em",	
              		"background-color": "data(nodeColor)",	
              		"color": "#fff",	
                  }
	           },	
	             {
                  selector: 'edge',
                  style: {
                  'line-color': 'data(edgeColor)',
	             	}
              }],
	    minZoom: 1e-1,
  	  maxZoom: 3.1,	
	    wheelSensitivity: 0.2
            });      

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var nodes;

var nodeDetails={};
var linkDetails={};
 
function buildnetworktopology()
{
  var interval;
  var nodelist = arguments[0];
  if (arguments.length>1)
  {
      interval = arguments[1];
      svg = d3.select("#topology_"+interval);
  }

  nodes = cluster.nodes(packageHierarchy(nodelist)),
  links = connections(nodes);
  node = svg.selectAll(".node").data(nodes.filter(function(n) { return !n.children; }));

  node.enter().append('circle')
    	.each(function(d){   
                	cy.add({
                        	data: { id: d["node_name"], nodeColor: findNodeColor(d["state"]) }
                        }); 
                	nodeDetails[d["node_name"]] = d;
                	cy.makeLayout({name: 'circle'}).run();
       	})
    	.attr("class","node");
 
  link  = svg.selectAll(".link").data(bundle(links));

  link.enter().append("path")
      .each(function(d) {
                	d.source = d[0], d.target = d[d.length - 1];                      	
                	cy.add({
                		data:{ id: findEdgeId(d), source: d[0]["node_name"], target: d[2]["node_name"], edgeColor: findEdgeColor(d) }
	                       });
	                linkDetails[findEdgeId(d)]=d;
        })
      .attr("class","link")
      .attr("id",findEdgeId);
     
    
   link.exit().remove();
   node.exit().remove();
}

cy.on('mouseover','node',function(event){			
	cy.style()
		.selector('#'+event.target.id())
		.style({'opacity':'0.5'})
		.update();
	mouseovered(nodeDetails[event.target.id()]);	
});

cy.on('mouseout','node',function(event){		
	cy.style()
		.selector('#'+event.target.id())
		.style({'opacity':'1'})
		.update();
	mouseouted(nodeDetails[event.target.id()]);
});

cy.on('click','node',function(event){
	var t = mouseclick(nodeDetails[event.target.id()]);	
	cy.$('#'+event.target.id()).qtip({
		content: t,
		position: {
			my: 'top center',
			at: 'bottom center'
			},
		style: {
			classes: 'qtip-bootstrap',
			tip: {
				width: 16,
				height: 8
				}
			}
		});
	});

cy.on('mouseover','edge',function(event){
	linkmouseover(linkDetails[event.target.id()]);
});
		
cy.on('mouseout','edge',function(event){
	linkmouseout(linkDetails[event.target.id()]);
});

	
function findNodeColor(state){
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

function findEdgeId(d){
	dest_name  = d[2].key;
	if (Object.keys(d[0]).indexOf("links")!=-1)
	{
		var history_interval = "";
		if (Object.keys(d[0]).indexOf("interval")!=-1)
      			history_interval = d[0]["interval"];
		if (d[0].links.on_demand.indexOf(dest_name)!= -1)
      			return "on_demand_"+d[0].key+"_"+d[2].key+"_"+history_interval;
		if (d[0].links.successor.indexOf(dest_name)!= -1)
      			return "successor_"+d[0].key+"_"+d[2].key+"_"+history_interval;
		if (d[0].links.chord.indexOf(dest_name)!= -1)
       			return "chord_"+d[0].key+"_"+d[2].key+"_"+history_interval;
	}
}

function findEdgeColor(d){
	dest_name  = d[2].key;
       	if (Object.keys(d[0]).indexOf("links")!=-1)
       	{
       		if (d[0].links.on_demand.indexOf(dest_name)!= -1)
       			return "#9E9E9E";
       		if (d[0].links.successor.indexOf(dest_name)!= -1)
       			return "#C0C0C0";
      		if (d[0].links.chord.indexOf(dest_name)!= -1)
       			return "#E2E2E2";
 	}
}

function findLinkColor(torf,ltype){
	if(torf==true){
		if(ltype=="successor")
			return "yellow";
		if(ltype=="chord")
			return "orange";
		if(ltype=="on_demand")
			return "blue";
	}
	else
		return 'data(edgeColor)';	
}

function linktype(source_keys,dest_name,ltype,torf,d)
{
  var history_interval = "";
  if (Object.keys(d[0]).indexOf("interval")!=-1)
      history_interval = d[0]["interval"];
	
  if (source_keys.indexOf(ltype) != -1)
	{
		if (d[0].links[ltype].indexOf(dest_name)!= -1){
			cy.style()
				.selector('#'+ltype+'_'+d[0].key+'_'+d[2].key+'_'+history_interval)
				.style({'line-color':findLinkColor(torf,ltype)})
				.update();
		}
	}
}

function linkmouseover(d)
{
  dest_name  = d[2].key;
  if (Object.keys(d[0]).indexOf("links")!=-1)
  {
    source_keys = Object.keys(d[0].links);
  	linktype(source_keys,dest_name,"on_demand",true,d);
  	linktype(source_keys,dest_name,"successor",true,d);
  	linktype(source_keys,dest_name,"chord",true,d);
  }
}

function linkmouseout(d)
{
  dest_name  = d[2].key;
  if (Object.keys(d[0]).indexOf("links")!=-1)
  {
    source_keys = Object.keys(d[0].links);
    linktype(source_keys,dest_name,"on_demand",false,d);
    linktype(source_keys,dest_name,"successor",false,d);
    linktype(source_keys,dest_name,"chord",false,d);
  }
}

function mouseovered(d) {
  node
      .each(function(n) { n.target = n.source = false; });
  link[0]
      .forEach(function(l) {
            l = l["__data__"]
            if (l[0].key == d.name || l[2].key == d.name)
          	{
                dest_name  = l[2].key;
                if ( Object.keys(l[0]).indexOf("links")!=-1)
                {
                    source_keys = Object.keys(l[0].links);
                	  linktype(source_keys,dest_name,"on_demand",true,l);
                	  linktype(source_keys,dest_name,"successor",true,l);
                	  linktype(source_keys,dest_name,"chord",true,l);
                }
           }
      });
}

function mouseouted(d) {
  link[0]
      .forEach(function(l) {
            l = l["__data__"]
            if (l[0].key == d.name || l[2].key == d.name)
            {
                dest_name  = l[2].key;
                if ( Object.keys(l[0]).indexOf("links")!=-1)
                {
                    source_keys = Object.keys(l[0].links);
                    linktype(source_keys,dest_name,"on_demand",false,l);
                    linktype(source_keys,dest_name,"successor",false,l);
                    linktype(source_keys,dest_name,"chord",false,l);
                }
            }
        });
}

function mouseclick(d)
{
  var circle  = d;
  var state="";
  var uptime= "";
  var history_interval = "";
  if (Object.keys(d).indexOf("interval")!=-1)
      history_interval = d["interval"];

  var element  = circle["name"]+"_"+history_interval;
  state = state + circle["state"];
  var temptime = circle["starttime"];
  temptime = new Date(temptime*1000);
  uptime = temptime;
  temptime = temptime.toString();

    var modalele = modaltemplate;
        modalele = modalele.replace("$nodename",circle["node_name"]);
        modalele = modalele.replace("$ui",circle["uid"].substring(0,7));
        modalele = modalele.replace("$ipopip",circle["ip4"]);
        modalele = modalele.replace("$phyip",circle["GeoIP"]);
    //uptime = uptime + temptime;
    //uptime = uptime.toUTCString();
            uptime = uptime.toLocaleString().toString().split(" ");
            if(uptime[2]== 'PM' )
               uptime[1]=(parseInt(uptime[1].substr(0,2))+12).toString()+uptime[1].substr(2,3);    
            uptime = uptime[0].split("/")[0]+"/"+ uptime[0].split("/")[1]+"/"+(uptime[0].split("/")[2]).substr(2,2) + " " + uptime[1].substr(0,5) + " " + temptime.split(" ")[6][1];
            for(var i=7; i<temptime.split(" ").length;i++)
               uptime += temptime.split(" ")[i][0];
            
            var location="";
            if (circle["GeoIP"] != " " && Object.keys(circle).indexOf("location")!=-1)
                location = circle["location"]["city"]+", "+circle["location"]["region"]+", "+circle["location"]["country"];
        modalele = modalele.replace("$starttime",uptime);
        modalele = modalele.replace("$location",location);
        modalele = modalele.replace("$macaddress",circle["mac"]);
        modalele = modalele.replace("$successor",countById(element,"successor"));
        modalele = modalele.replace("$ondemand",countById(element,"on_demand"));
        modalele = modalele.replace("$chord",countById(element,"chord")); 
        modalele = modalele.replace("$state",state[0].toUpperCase()+state.substring(1));
    return modalele;
}

d3.select(self.frameElement).style("height", diameter + "px");

function packageHierarchy() {
  var map = {};
  var classes = arguments[0];
  function find(name, data) {

    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
}

// Return a list of imports for the given array of nodes.
function connections() {
  var map = {},
  conns = [];
  var elenodes = arguments[0];

  // Compute a map from name to node.
  elenodes.forEach(function(d) {
    map[d.name] = d;
  });

  elenodes.forEach(function(d) {
    if (Object.keys(d).indexOf("links")!=-1)
    {
        if (d.links.successor) d.links.successor.forEach(function(i) {
          conns.push({source: map[d.name], target: map[i],"type":"successor"});
        });
    	if (d.links.on_demand) d.links.on_demand.forEach(function(i) {
          conns.push({source: map[d.name], target: map[i],"type":"ondemand"});
        });
    	if (d.links.chord) d.links.chord.forEach(function(i) {
        if (d.links.successor.indexOf(map[i]["name"])==-1)
          conns.push({source: map[d.name], target: map[i],"type":"chord"});
        });
    }
  });
  return conns;
}

function countById(id,type)
{
  var nodeuid = id.split("_")[0],
      history_interval = id.split("_")[1];

  var pathele = "",i=0;
  if (history_interval=="")
      pathele = $("#topology").find("path");
  else
      pathele = $("#topology_"+history_interval).find("path");
  
  var noOfElements = pathele["length"];
  pathele = Object.values(pathele)
  
  var count=0;
  var elementconns = [];

  for(;i<noOfElements;i++){
        var element_id = pathele[i]["id"].split("_");
	
	if(id=="*"&&(element_id[0].includes(type)==true))
          count++;
        else
        {
              if (type == "successor")
              {	
                  if((element_id[1].includes(nodeuid)==true)&&(element_id[0].includes(type)==true))
                      count++;
              }
              else
              {
                  if((element_id[1].includes(nodeuid)==true)&&(element_id[0].includes(type)==true))
                      count++;
                  else if (element_id[1].includes(nodeuid)==true &&(element_id[0].includes(type)==true))
                    count++;
              }
        }
  }
  return count;
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