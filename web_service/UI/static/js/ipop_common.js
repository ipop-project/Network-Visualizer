var overlayNodeInfo = "<section class='InfoPanel'><section class='leftColumn'><div>ID&nbsp;</div><div>Nodes</div><div>Links</div></section><section id='rightColumn'><div>&nbsp;$overlayid</div><div>&nbsp;$numnodes</div><div>&nbsp;$numlinks</div></section></section>"

var ipopNodeInfo = "<section class='InfoPanel sr-only'><section class='leftColumn'><div>MAC&nbsp;</div><div>Tap&nbsp;</div><div>Peer ID</div><div>IceRole</div><div>Remote Address</div><div>Bytes Sent (Bs)</div><div>Total Bytes Sent (MB)</div><div>Local Type</div><div>Remote Type</div><div>Writable</div><div>Local Address</div><div>Bytes Received (Bs)</div><div>Total Bytes Received (MB)</div><div>Best Connection</div><div>New Connection</div><div>Timeout</div><div>rtt</div></section><section id='rightColumn'><div>&nbsp;$mac</div><div>&nbsp;$interfacename</div><div>&nbsp;$target</div><div>&nbsp;$icerole</div><div>&nbsp;$remaddr</div><div>&nbsp;$sent_bytes_second</div><div>&nbsp;$sent_total_bytes</div><div>&nbsp;$localtype</div><div>&nbsp;$remtype</div><div>&nbsp;$writable</div><div>&nbsp;$localaddr</div><div>&nbsp;$recv_bytes_second</div><div>&nbsp;$recv_total_bytes</div><div>&nbsp;$bestconn</div><div>&nbsp;$newconn</div><div>&nbsp;$timeout</div><div>&nbsp;$rtt</div></section></section>"
var mouseOverNodeInfo = "<section class='InfoPanel'><section class='leftColumn'><div>Peer ID&nbsp;</div><div>MAC&nbsp;</div></section><section id='rightColumn'><div>&nbsp;$nodeid</div><div>&nbsp;$mac</div></section>"

//var linkMetricsInfo = "<section class='InfoPanel'><section class='leftColumnLinkMetric'><div>Source</div><div>Target</div><div>IceRole</div><div>Remote Address</div><div>Bytes Sent (Bs)</div><div>Total Bytes Sent (MB)</div><div>Local Type</div><div>Remote Type</div><div>Writable</div><div>Local Address</div><div>Bytes Received (Bs)</div><div>Total Bytes Received (MB)</div><div>Best Connection</div><div>New Connection</div><div>Timeout</div><div>rtt</div></section><section id='rightColumnLinkMetric'><div>&nbsp;$source</div><div>&nbsp;$target</div><div>&nbsp;$icerole</div><div>&nbsp;$remaddr</div><div>&nbsp;$sent_bytes_second</div><div>&nbsp;$sent_total_bytes</div><div>&nbsp;$localtype</div><div>&nbsp;$remtype</div><div>&nbsp;$writable</div><div>&nbsp;$localaddr</div><div>&nbsp;$recv_bytes_second</div><div>&nbsp;$recv_total_bytes</div><div>&nbsp;$bestconn</div><div>&nbsp;$newconn</div><div>&nbsp;$timeout</div><div>&nbsp;$rtt</div></section></section>"

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
                                    "width":"0.2em"
              	                 }
                            }
                           ],
                    zoom: 1.1,
              	    minZoom: 0.1,
                    maxZoom: 2,	
              	    wheelSensitivity: 0.2
                  });      

function buildOverlaysGraph()
{
  var intervalNo = new Date().toISOString().split(".")[0];
  $.getJSON("http://"+serverip+"/IPOP/overlays?interval="+intervalNo+"&current_state=True", function(data,status) {
    if (status == "error") throw error;
    for (overlay in data["current_state"]) {
          if(data["current_state"][overlay]["Name"] == "")
             data["current_state"][overlay]["Name"] = overlay;
          cy.add({
             data: { 
                    id: overlay,
                    Name: data["current_state"][overlay]["Name"],
                    NumNodes: data["current_state"][overlay]["NumNodes"],
                    NumLinks: data["current_state"][overlay]["NumLinks"],
                    intervalNo: data["intervalNo"],
                    label: data["current_state"][overlay]["Name"],
                    nodeColor: '#74CBE8',
                    type: 'Overlay' 
                  } 
          });
    }
    cy.makeLayout({name: 'circle'}).run();

    var overlayList = cy.nodes().map(function( ele ){
                                      return ele.data('id');
                                  });

    if(document.getElementById('overlay-form-control')==null){
      var overlayDropdown = "<br><section class='OverlayListPanel'><h4 class = 'section-heading'>Overlay Network</h4><select class='form-control' id='overlay-form-control' defaultValue='Select Overlay' onChange=overlayListClick(value)><option>Select Overlay</option>";
      for (var index in overlayList)
        overlayDropdown += "<option>"+overlayList[index]+"</option>";
      overlayDropdown += "</select>";
      $('#config').append(overlayDropdown);
    }
  });
}

function buildNetworkTopology(overlayid,intervalNo)
{
  $.when(
    $.getJSON("http://"+serverip+"/IPOP/overlays/"+overlayid+"/nodes?interval="+intervalNo+"&current_state=True"),
    $.getJSON("http://"+serverip+"/IPOP/overlays/"+overlayid+"/links?interval="+intervalNo+"&current_state=True")
  ).then(function(nodeData, linkData) {
    for (nodeid in nodeData["0"][overlayid]["current_state"]) {
        if(nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"] == "")
            nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"] = nodeid;  
        cy.add({
          data: {
            id: nodeid,
            Name: nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"],
            InterfaceName: nodeData["0"][overlayid]["current_state"][nodeid]["InterfaceName"],
            //GeoIP: nodeData["0"][overlayid]["current_state"][nodeid]["GeoIP"],
            //VIP4: nodeData["0"][overlayid]["current_state"][nodeid]["VIP4"],
            IP4PrefixLen: nodeData["0"][overlayid]["current_state"][nodeid]["IP4PrefixLen"],
            MAC: nodeData["0"][overlayid]["current_state"][nodeid]["MAC"],
            intervalNo: nodeData["0"]["intervalNo"],
            label: nodeid, //nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"],  
            nodeColor: "red",
            type: 'IPOP'
          }
        });
      }

      cy.makeLayout({name:'circle'}).run();
      for (nodeid in linkData["0"][overlayid]["current_state"]) {

        for (linkid in linkData["0"][overlayid]["current_state"][nodeid]){
          cy.add({
            data: { 
              id: linkid + "_" + linkData["0"][overlayid]["current_state"][nodeid][linkid]["SrcNodeId"],
              source: linkData["0"][overlayid]["current_state"][nodeid][linkid]["SrcNodeId"],
              target: linkData["0"][overlayid]["current_state"][nodeid][linkid]["TgtNodeId"],
              IceRole: linkData["0"][overlayid]["current_state"][nodeid][linkid]["IceRole"],
              Type: linkData["0"][overlayid]["current_state"][nodeid][linkid]["Type"],
              rem_addr: linkData["0"][overlayid]["current_state"][nodeid][linkid]["rem_addr"],
              sent_bytes_second: linkData["0"][overlayid]["current_state"][nodeid][linkid]["sent_bytes_second"],
              sent_total_bytes: linkData["0"][overlayid]["current_state"][nodeid][linkid]["sent_total_bytes"],
              local_type: linkData["0"][overlayid]["current_state"][nodeid][linkid]["local_type"],
              rem_type: linkData["0"][overlayid]["current_state"][nodeid][linkid]["rem_type"],
              writable: linkData["0"][overlayid]["current_state"][nodeid][linkid]["writable"],
              local_addr: linkData["0"][overlayid]["current_state"][nodeid][linkid]["local_addr"],
              recv_bytes_second: linkData["0"][overlayid]["current_state"][nodeid][linkid]["recv_bytes_second"],
              best_conn: linkData["0"][overlayid]["current_state"][nodeid][linkid]["best_conn"],
              recv_total_bytes: linkData["0"][overlayid]["current_state"][nodeid][linkid]["recv_total_bytes"],
              new_conn: linkData["0"][overlayid]["current_state"][nodeid][linkid]["new_conn"],
              timeout: linkData["0"][overlayid]["current_state"][nodeid][linkid]["timeout"],
              rtt: linkData["0"][overlayid]["current_state"][nodeid][linkid]["rtt"],
              edgeColor: findEdgeColor(linkData["0"][overlayid]["current_state"][nodeid][linkid]["rem_type"] , linkData["0"][overlayid]["current_state"][nodeid][linkid]["local_type"])
            }
          });

          cy.getElementById(linkData["0"][overlayid]["current_state"][nodeid][linkid]["SrcNodeId"]).data({ nodeColor :"#02ed68" }); 
          cy.getElementById(linkData["0"][overlayid]["current_state"][nodeid][linkid]["TgtNodeId"]).data({ nodeColor :"#02ed68" });
        }
      }
  });
  cy.style().selector("node").style("font-size","2em").update();
}

function updateGraph()
{
  var intervalNo = new Date().toISOString().split(".")[0];
  if(cy.nodes().allAre('[type = "Overlay"]')){
    $.getJSON("http://"+serverip+"/IPOP/overlays?interval="+intervalNo, function(data,status) {
      if (status == "error") throw error;
      var overlayDropdown = ""; 
      for (overlay in data["added"]) { 
        if(cy.getElementById(overlay).length == 0){
         if(data["added"][overlay]["Name"] == "")
              data["added"][overlay]["Name"] == overlay; 
          cy.add({
            data: { 
              id: overlay,
              Name: data["added"][overlay]["Name"],
              NumNodes: data["added"][overlay]["NumNodes"],
              NumLinks: data["added"][overlay]["NumLinks"],
              intervalNo: data["intervalNo"],
              label: data["added"][overlay]["Name"],
              nodeColor: '#74CBE8',
              type: 'Overlay' 
            } 
          });
          var x = document.createElement("OPTION")
          var t = document.createTextNode(overlay);
          x.appendChild(t);
          document.getElementById("overlay-form-control").appendChild(x);
        }
      }

      for (overlay in data["removed"]) {
        if(cy.getElementById(overlay).length == 1){
          cy.remove(cy.getElementById(overlay));
          document.getElementById("overlay-form-control").remove(overlay);
        }
      }

      for (overlay in data["modified"]){
        if(data["modified"][overlay]["Name"] == "")
              data["modified"][overlay]["Name"] == overlay;
        cy.getElementById(overlay).data({
          id: overlay,
          Name: data["modified"][overlay]["Name"],
          NumNodes: data["modified"][overlay]["NumNodes"],
          NumLinks: data["modified"][overlay]["NumLinks"],
          intervalNo: data["intervalNo"],
          label: data["modified"][overlay]["Name"],
          nodeColor: '#74CBE8',
          type: 'Overlay'
        });
      }

      cy.center(); //Remove this to disable center positioning the node on update.
    });
  }
  else{
    var overlayid = document.getElementById('overlay-form-control').value;
    $.when(
      $.getJSON("http://"+serverip+"/IPOP/overlays/"+overlayid+"/nodes?interval="+intervalNo),
      $.getJSON("http://"+serverip+"/IPOP/overlays/"+overlayid+"/links?interval="+intervalNo)
    ).then(function(nodeData, linkData) {
      for (nodeid in nodeData["0"][overlayid]["added"]) {
        if(cy.getElementById(nodeid).length == 0){
          if(nodeData["0"][overlayid]["added"][nodeid]["NodeName"] == "")
            nodeData["0"][overlayid]["added"][nodeid]["NodeName"] = nodeid;
          cy.add({
            data: { 
              id: nodeid,
              Name: nodeData["0"][overlayid]["added"][nodeid]["NodeName"],
              InterfaceName: nodeData["0"][overlayid]["added"][nodeid]["InterfaceName"],
              //GeoIP: nodeData["0"][overlayid]["added"][nodeid]["GeoIP"],
              //VIP4: nodeData["0"][overlayid]["added"][nodeid]["VIP4"],
              IP4PrefixLen: nodeData["0"][overlayid]["added"][nodeid]["IP4PrefixLen"],
              MAC: nodeData["0"][overlayid]["added"][nodeid]["MAC"],
              intervalNo: nodeData["0"]["intervalNo"],
              label: nodeid, //nodeData["0"][overlayid]["added"][nodeid]["NodeName"],  
              nodeColor: "red", 
              type: 'IPOP' 
            } 
          });
        }
      }

      for (nodeid in nodeData["0"][overlayid]["removed"]) {
        if(cy.getElementById(nodeid).length == 1){
          cy.remove(cy.getElementById(nodeid));
        }
      }

      for (nodeid in nodeData["0"][overlayid]["modified"]){
        if(nodeData["0"][overlayid]["modified"][nodeid]["NodeName"] == "")
            nodeData["0"][overlayid]["modified"][nodeid]["NodeName"] = nodeid;
        cy.getElementById(nodeid).data({
          id: nodeid,
          Name: nodeData["0"][overlayid]["modified"][nodeid]["NodeName"],
          InterfaceName: nodeData["0"][overlayid]["modified"][nodeid]["InterfaceName"],
          //GeoIP: nodeData["0"][overlayid]["modified"][nodeid]["GeoIP"],
          //VIP4: nodeData["0"][overlayid]["modified"][nodeid]["VIP4"],
          IP4PrefixLen: nodeData["0"][overlayid]["modified"][nodeid]["IP4PrefixLen"],
          MAC: nodeData["0"][overlayid]["modified"][nodeid]["MAC"],
          intervalNo: nodeData["0"]["intervalNo"],
          label: nodeid, //nodeData["0"][overlayid]["modified"][nodeid]["NodeName"],  
          nodeColor: "red",
          type: 'IPOP'
        });
      }

      //cy.center();
      for(nodeid in linkData["0"][overlayid]["added"]){
        for (linkid in linkData["0"][overlayid]["added"][nodeid]){
          if(cy.getElementById(linkid).length == 0){
            cy.add({
              data: { 
                id: linkid + "_" + linkData["0"][overlayid]["added"][nodeid][linkid]["SrcNodeId"],
                source: linkData["0"][overlayid]["added"][nodeid][linkid]["SrcNodeId"],
                target: linkData["0"][overlayid]["added"][nodeid][linkid]["TgtNodeId"],
                IceRole: linkData["0"][overlayid]["added"][nodeid][linkid]["IceRole"],
                Type: linkData["0"][overlayid]["added"][nodeid][linkid]["Type"],
                rem_addr: linkData["0"][overlayid]["added"][nodeid][linkid]["rem_addr"],
                sent_bytes_second: linkData["0"][overlayid]["added"][nodeid][linkid]["sent_bytes_second"],
                sent_total_bytes: linkData["0"][overlayid]["added"][nodeid][linkid]["sent_total_bytes"],
                local_type: linkData["0"][overlayid]["added"][nodeid][linkid]["local_type"],
                rem_type: linkData["0"][overlayid]["added"][nodeid][linkid]["rem_type"],
                writable: linkData["0"][overlayid]["added"][nodeid][linkid]["writable"],
                local_addr: linkData["0"][overlayid]["added"][nodeid][linkid]["local_addr"],
                recv_bytes_second: linkData["0"][overlayid]["added"][nodeid][linkid]["recv_bytes_second"],
                best_conn: linkData["0"][overlayid]["added"][nodeid][linkid]["best_conn"],
                recv_total_bytes: linkData["0"][overlayid]["added"][nodeid][linkid]["recv_total_bytes"],
                new_conn: linkData["0"][overlayid]["added"][nodeid][linkid]["new_conn"],
                timeout: linkData["0"][overlayid]["added"][nodeid][linkid]["timeout"],
                rtt: linkData["0"][overlayid]["added"][nodeid][linkid]["rtt"],
                edgeColor: findEdgeColor(linkData["0"][overlayid]["added"][nodeid][linkid]["rem_type"],linkData["0"][overlayid]["added"][nodeid][linkid]["local_type"])     
              }
            });
            cy.getElementById(linkData["0"][overlayid]["added"][nodeid][linkid]["SrcNodeId"]).data({ nodeColor :"#02ed68" }); 
            cy.getElementById(linkData["0"][overlayid]["added"][nodeid][linkid]["TgtNodeId"]).data({ nodeColor :"#02ed68" });
          }
        }
      }
     
      for (nodeid in linkData["0"][overlayid]["removed"]){    
        for (linkid in linkData["0"][overlayid]["removed"][nodeid]){
          if(cy.getElementById(linkid).length == 1){ 
            var srcNode = cy.getElementById(linkid + "_" + nodeid).source(); 
            var tgtNode = cy.getElementById(linkid + "_" + nodeid).target();
            cy.remove(cy.getElementById(linkid + "_" + nodeid));
            if(srcNode.connectedEdges().length == 0)
              srcNode.data({ nodeColor :"red" }); 
            if(tgtNode.connectedEdges().length == 0)
              tgtNode.data({ nodeColor :"red" });   
          }
        }
      } 

      for (nodeid in linkData["0"][overlayid]["modified"]){
        for (linkid in linkData["0"][overlayid]["modified"][nodeid]){
          cy.getElementById(linkid).data({
            id: linkid + "_" + linkData["0"][overlayid]["modified"][nodeid][linkid]["SrcNodeId"],
            source: linkData["0"][overlayid]["modified"][nodeid][linkid]["SrcNodeId"],
            target: linkData["0"][overlayid]["modified"][nodeid][linkid]["TgtNodeId"],
            IceRole: linkData["0"][overlayid]["modified"][nodeid][linkid]["IceRole"],
            Type: linkData["0"][overlayid]["modified"][nodeid][linkid]["Type"],
            rem_addr: linkData["0"][overlayid]["modified"][nodeid][linkid]["rem_addr"],
            sent_bytes_second: linkData["0"][overlayid]["modified"][nodeid][linkid]["sent_bytes_second"],
            sent_total_bytes: linkData["0"][overlayid]["modified"][nodeid][linkid]["sent_total_bytes"],
            local_type: linkData["0"][overlayid]["modified"][nodeid][linkid]["local_type"],
            rem_type: linkData["0"][overlayid]["modified"][nodeid][linkid]["rem_type"],
            writable: linkData["0"][overlayid]["modified"][nodeid][linkid]["writable"],
            local_addr: linkData["0"][overlayid]["modified"][nodeid][linkid]["local_addr"],
            recv_bytes_second: linkData["0"][overlayid]["modified"][nodeid][linkid]["recv_bytes_second"],
            best_conn: linkData["0"][overlayid]["modified"][nodeid][linkid]["best_conn"],
            recv_total_bytes: linkData["0"][overlayid]["modified"][nodeid][linkid]["recv_total_bytes"],
            new_conn: linkData["0"][overlayid]["modified"][nodeid][linkid]["new_conn"],
            timeout: linkData["0"][overlayid]["modified"][nodeid][linkid]["timeout"],
            rtt: linkData["0"][overlayid]["modified"][nodeid][linkid]["rtt"],
            edgeColor: findEdgeColor(linkData["0"][overlayid]["modified"][nodeid][linkid]["rem_type"],linkData["0"][overlayid]["modified"][nodeid][linkid]["local_type"])
          });
       }
     }

    });
  }
}

function overlayListClick(overlayid) {
  intervalNo = cy.nodes().data("intervalNo");
  intervalNo = intervalNo.substring(0,10)+'T'+intervalNo.substring(11);
  $('.NodeInfoPanel').remove();
  $('#linkMetricsDialog').remove();
  cy.remove(cy.edges());
  cy.remove(cy.nodes());
  if(overlayid != 'Select Overlay')
    buildNetworkTopology(overlayid,intervalNo);
  else
    buildOverlaysGraph();
  document.getElementById('zoomslide').value = document.getElementById('zoomslide').defaultValue
}

cy.on('mouseover','node',function(event){
  cy.style()
   .selector('#'+event.target.id())
   .style({
          "border-width":"5%",
          "border-color":"#004bc4",
          "width":"5em",
          "height":"5em"
    })
   .update(); 
  
  cy.getElementById(event.target.id()).qtip({
    content: mouseOverNode(event.target.id()),
    style: {classes: 'qtip-bootstrap'},
    show: {
            event: event.type,
            ready: true
    }
  });
  
  if(cy.getElementById(event.target.id()).data("type") == "IPOP"){
    cy.getElementById(event.target.id()).connectedEdges().animate({
      style: { 'width':'0.4em' }
    });
  }
});

cy.on('mouseout','node',function(event){
  cy.style()
   .selector('#'+event.target.id())
   .style({
          "border-width":"0%",
          "width":"3.75em",
          "height":"3.75em"
    })
   .update();
  
  $(".qtip").remove();
  if(cy.getElementById(event.target.id()).data("type") == "IPOP"){
    cy.getElementById(event.target.id()).connectedEdges().animate({
      style: { "width":"0.2em" }
    });
  }
});

cy.on('click','node',function(event){
  if(event.target._private.data.type == "Overlay"){
    overlayid = event.target.id();
    intervalNo = cy.getElementById(overlayid).data("intervalNo");
    intervalNo = intervalNo.substring(0,10)+'T'+intervalNo.substring(11);
    cy.remove(cy.nodes());
    document.getElementById("overlay-form-control").value = overlayid;
    buildNetworkTopology(overlayid,intervalNo);
  }
  else{
    if(document.getElementById('infoPanel_'+event.target.id()) == null){
      $('#config').append("<section class='NodeInfoPanel' id='infoPanel_"+event.target.id()+"'><section class='NodeInfoPanelHeading' onclick='$(this).parent().find(\".collapse\").toggleClass(\"show\")' ><article>"+event.target.id()+"<button type='button' class='close' data-target='#infoPanel_"+event.target.id()+"' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button></section><section id='#info_"+event.target.id()+"'  class='NodeInfoPanelBody collapse' >"+mouseClickNode(event.target.id())+"</div></section>");
    }
  }
});

cy.on('mouseover','edge',function(event){
  cy.getElementById(event.target.id()).animate({
      style: { "width":"0.4em" }
  });
});
		
cy.on('mouseout','edge',function(event){
  cy.getElementById(event.target.id()).animate({
      style: { "width":"0.2em" }
  });
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

function findEdgeColor(remtype,localtype) {
  if (remtype == "turn" || localtype == "turn")
    return "orange";
  if (remtype == "stun" || localtype == "stun")
    return "yellow";
  if (remtype == "local" || localtype == "local")
    return "blue";
  return "white";
}

function mouseOverNode(nodeid) {
  nodeData = cy.getElementById(nodeid).data()
  if(nodeData.type == "Overlay"){
    var overlayNodeQTip = overlayNodeInfo;
      overlayNodeQTip = overlayNodeQTip.replace("$overlayid",nodeData.id);
      overlayNodeQTip = overlayNodeQTip.replace("$numnodes",nodeData.NumNodes);
      overlayNodeQTip = overlayNodeQTip.replace("$numlinks",nodeData.NumLinks);
    return overlayNodeQTip;
  }
  else{
    var mouseOverNodeQTip = mouseOverNodeInfo;
      mouseOverNodeQTip = mouseOverNodeQTip.replace("$nodeid",(nodeData.id).substring(0,7));
      mouseOverNodeQTip = mouseOverNodeQTip.replace("$mac",nodeData.MAC);
      //mouseOverNodeQTip = mouseOverNodeQTip.replace("$interfacename",nodeData.InterfaceName);      
    return mouseOverNodeQTip;

  }
}

function mouseClickNode(nodeid)
{
  nodeData = cy.getElementById(nodeid).data()
  connectedLinks = cy.nodes('#'+nodeid).connectedEdges().map(function( ele ){
                                                                if(ele.data('source') == nodeid)
                                                                    return ele.data('id');
                                                            });

  var allLinkMetrics = "";

  console.log(connectedLinks);
  for (var index in connectedLinks){
    if(connectedLinks[index] == undefined){
    	continue;
    }
    linkData = cy.getElementById(connectedLinks[index]).data();

  	var ipopNodePanel = ipopNodeInfo;
      ipopNodePanel = ipopNodePanel.replace("$nodeid",nodeData.id.substring(0,7));
      ipopNodePanel = ipopNodePanel.replace("$mac",nodeData.MAC);
      ipopNodePanel = ipopNodePanel.replace("$interfacename",nodeData.InterfaceName);

      // if(nodeData.VIP4 != undefined)	 
      // 	ipopNodePanel = ipopNodePanel.replace("$vip4",nodeData.VIP4);
      // else
      //   ipopNodePanel = ipopNodePanel.replace("$vip4","-");
      
      if(nodeData.IP4PrefixLen != undefined) 
        ipopNodePanel = ipopNodePanel.replace("$prefixlen",nodeData.IP4PrefixLen);
      else
        ipopNodePanel = ipopNodePanel.replace("$prefixlen","-"); 
      
      // if(nodeData.GeoIP != undefined)	 
      // 	ipopNodePanel = ipopNodePanel.replace("$geoip",nodeData.VIP4);
      // else
      //   ipopNodePanel = ipopNodePanel.replace("$geoip","-");

      // ipopNodePanel = ipopNodePanel.replace("$source",linkData.source);
      ipopNodePanel = ipopNodePanel.replace("$target",linkData.target);
      ipopNodePanel = ipopNodePanel.replace("$icerole",linkData.IceRole);
      ipopNodePanel = ipopNodePanel.replace("$remaddr",linkData.rem_addr);
      ipopNodePanel = ipopNodePanel.replace("$sent_bytes_second",linkData.sent_bytes_second);
      ipopNodePanel = ipopNodePanel.replace("$sent_total_bytes",linkData.sent_total_bytes);
      ipopNodePanel = ipopNodePanel.replace("$localtype",linkData.local_type);
      ipopNodePanel = ipopNodePanel.replace("$remtype",linkData.rem_type);
      ipopNodePanel = ipopNodePanel.replace("$writable",linkData.writable);
      ipopNodePanel = ipopNodePanel.replace("$localaddr",linkData.local_addr);
      ipopNodePanel = ipopNodePanel.replace("$recv_bytes_second",linkData.recv_bytes_second);
      ipopNodePanel = ipopNodePanel.replace("$bestconn",linkData.best_conn);
      ipopNodePanel = ipopNodePanel.replace("$recv_total_bytes",linkData.recv_total_bytes);
      ipopNodePanel = ipopNodePanel.replace("$newconn",linkData.new_conn);
      ipopNodePanel = ipopNodePanel.replace("$timeout",linkData.timeout);
      ipopNodePanel = ipopNodePanel.replace("$rtt",linkData.rtt);

      allLinkMetrics += "<section class='ipopNodeInfo' ><section class='linkID'  onclick='$(this).parent().find(\".InfoPanel\").toggleClass(\"sr-only\")'>"+(linkData.id).split("_")[0]+"</section>"+ipopNodePanel+"</section>";
    }
    return allLinkMetrics;
}

