var paneltemplate = "<table><col style='width:35%'><col style='width:65%'><tr><td class='keyclass'>NetworkID</td><td class='valueclass'>$networkname</td></tr><tr><td class='keyclass'>UID</td><td class='valueclass'>$uid</td></tr><tr><td class='keyclass'>MAC</td><td class='valueclass'>$macaddress</td></tr><tr><td class='keyclass'>IPOP-IP</td><td class='valueclass'>$ipopip</td></tr><tr><td class='keyclass'>State</td><td class='valueclass'>$state</td></tr></table>";

var modaltemplate = "<table><col style='width:35%'><col style='width:65%'><tr><td class='keyclass'>Name</td><td class='valueclass'>$nodename</td></tr><tr><td class='keyclass'>UID</td><td class='valueclass'>$uid</td></tr><tr><td class='keyclass'>MAC</td><td class='valueclass'>$macaddress</td></tr><tr><td class='keyclass'>IPOP-IP</td><td class='valueclass'>$ipopip</td></tr><tr><td class='keyclass'>Geo-IP</td><td class='valueclass'>$phyip</td></tr><tr><td class='keyclass'>State</td><td class='valueclass'>$state</td></tr><tr><td class='keyclass'>Start-Time</td><td class='valueclass'>$startdate</td></tr><tr><td class='keyclass'></td><td class='valueclass'>$starttime</td></tr><tr><td class='keyclass'>Location</td><td class='valueclass'>$location</td></tr><tr><td class='keyclass'></td><td class='valueclass'>$country</td></tr><tr><td class='keyclass'>Links</td><td class='valueclass' id='myModal_chord'>Chords (O)&emsp;&emsp; $chord</td></tr><tr><td class='keyclass'></td><td class='valueclass' id='myModal_successor'>Successor (Y)&emsp;$successor</td></tr><tr><td class='keyclass'></td><td class='valueclass'>On-Demand (B) $ondemand</td></tr></table>";

var serverip = location.host;

var cy = cytoscape({
                    container: document.getElementById('topology'),
                    layout: {
                            name: 'circle'
                            },
                    style: [
                            {
                              selector: 'node',
                              style: {
                  		              "width":"3.75em",
                  		              "height":"3.75em",
                                      "label": "data(label)",
                                      "text-valign": "center",
                                      "text-outline-width": "2",
        							  "text-outline-color": 'data(nodeColor)',
                                	  "min-zoomed-font-size": "1.5em",	
                                	  "background-color": "data(nodeColor)",	
                                	  "color": "#292b2d",
                                  }
              	            },	
              	            {
                              selector: 'edge',
                              style: {
                                    "line-color": "data(edgeColor)",
              	                 }
                            }
                           ],
                    zoom: 1,
              	    minZoom: 0.1,
                	maxZoom: 2,	
              	    wheelSensitivity: 0.2
                  });      

var OverlayDetails ={}
var nodeDetails = {};
var linkDetailes = {};

function buildOverlays()
{
  OverlayDetails = arguments[0];
  for (overlays in OverlayDetails) {
    cy.add({
             data: { 
                    id: overlays,
                    label: overlays,
                    nodeColor: '#74CBE8' 
                  } 
          });
  }
  cy.makeLayout({name: 'circle'}).run();
}


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
    nodeDetails[nodelist[node]["uid"]] = nodelist[node];
    nodeDetails[nodelist[node]["uid"]]["linkIDs"] = []; 
  }
  cy.makeLayout({name: 'circle'}).run(); 

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
		.style({"border-width":"5%",
                "border-color":"#004bc4",
            	"width":"5em",
                "height":"5em",})
		.update();
    try{
	mouseOverNode(nodeDetails[event.target.id()]["linkIDs"],event.target.id());	
      }
    catch(err){}
});

cy.on('mouseout','node',function(event){		
	cy.style()
		.selector('#'+event.target.id())
		.style({"border-width":"0%",
				"width":"3.75em",
                "height":"3.75em",})
		.update();
    try{
	mouseOutNode(nodeDetails[event.target.id()]["linkIDs"],event.target.id());
        }
    catch(err){}
});

cy.on('click','node',function(event){
  try{
	    var t = mouseClickNode(nodeDetails[event.target.id()]);
	    cy.$('#'+event.target.id()).qtip({
			content: t,
			style: {classes: 'qtip-bootstrap'}
		});

	     $('#config').append("<div class='panel panel-default NodeDetails' id='infoPanel'><div class='panel-heading'><button type='button' class='close' data-target='#infoPanel' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button><h4 class = 'section-heading'>"+nodeDetails[event.target.id()]['node_name']+"</h4></div><div class='panel-body'>"+t+"</div><button id='infobtn' class='btn btn-info'>MORE INFO</button></div>");
	     $('#infobtn').click( function() {
	     	$('#config').append("<a href='#' data-toggle='popover' title='Popover Header' data-content='Some content inside the popover'>Toggle popover</a>");
	     	$('#config').ready(function(){
			    $('[data-toggle="popover"]').popover(); 
			});
	     });
	}

  catch(err){
      cy.remove(cy.nodes());
      buildnetworktopology(OverlayDetails[event.target.id()]);
  }
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
		return "#02ed68";
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

function mouseOverNode(linkIDs,uid) {
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

function mouseOutNode(linkIDs,uid) {
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
  var panelele = paneltemplate;
      panelele = panelele.replace("$networkname",node["networkid"]);
      panelele = panelele.replace("$ui",node["uid"].substring(0,7));
      panelele = panelele.replace("$ipopip",node["ip4"]);
      panelele = panelele.replace("$macaddress",node["mac"]);
      panelele = panelele.replace("$state",node["state"][0].toUpperCase()+node["state"].substring(1));
    return panelele;
}

function setModalText(node)
{
  var temptime = "";
  var uptime = node["starttime"];
  uptime = new Date(uptime*1000);
  temptime = temptime + uptime.toString();
  uptime = uptime.toLocaleString().split(" ");
  date = uptime[0].substring(0,uptime[0].length-1);
  time = uptime[1] + " " + uptime[2] + " " + temptime.split(" ")[6][1]+temptime.split(" ")[7][0]+temptime.split(" ")[8][0];           
          
  var location="";
  if (node["GeoIP"] != " " && Object.keys(node).indexOf("location")!=-1){
      location = node["location"]["city"]+", "+node["location"]["region"];
      country = node["location"]["country"];
  }
  location += "Gainesville";
  var country = "United States";

  var modalele = modaltemplate;
      modalele = modalele.replace("$networkname",node["networkid"]);
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