var overlayNodeInfo = "<section class='InfoPanel'><section class='leftColumn'><div>ID&nbsp;</div><div>Nodes</div><div>Links</div></section><section id='rightColumn'><div>&nbsp;$overlayid</div><div>&nbsp;$numnodes</div><div>&nbsp;$numlinks</div></section></section>"

var ipopNodeInfo = "<section class='InfoPanel'><section class='leftColumn'><div>ID&nbsp;</div><div>Tap&nbsp;</div><div>GeoIP&nbsp;</div><div>Virtual IP&nbsp;</div><div>Prefix&nbsp;</div><div>MAC&nbsp;</div></section><section id='rightColumn'><div>&nbsp;$nodeid</div><div>&nbsp;$interfacename</div><div>&nbsp;$geoip</div><div>&nbsp;$vip4</div><div>&nbsp;$prefixlen</div><div>&nbsp;$mac</div></section></section>"

var linkMetricsInfo = "<section class='InfoPanel'><section class='leftColumnLinkMetric'><div>Source</div><div>Target</div><div>Type</div><div>Bytes Sent (Bs)</div><div>Total Bytes Sent (MB)</div><div>Bytes Received (Bs)</div><div>Total Bytes Received (MB)</div></section><section id='rightColumnLinkMetric'><div>&nbsp;$source</div><div>&nbsp;$target</div><div>&nbsp;$type</div><div>&nbsp;$sent_bytes_second</div><div>&nbsp;$sent_total_bytes</div><div>&nbsp;$recv_bytes_second</div><div>&nbsp;$recv_total_bytes</div></section></section>"

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
                    zoom: 1.05,
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
        cy.add({
          data: {
            id: nodeid,
            Name: nodeid, //nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"]
            InterfaceName: nodeData["0"][overlayid]["current_state"][nodeid]["InterfaceName"],
            GeoIP: nodeData["0"][overlayid]["current_state"][nodeid]["GeoIP"],
            VIP4: nodeData["0"][overlayid]["current_state"][nodeid]["VIP4"],
            PrefixLen: nodeData["0"][overlayid]["current_state"][nodeid]["PrefixLen"],
            MAC: nodeData["0"][overlayid]["current_state"][nodeid]["MAC"],
            intervalNo: nodeData["0"]["intervalNo"],
            label: nodeid, //nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"],  
            nodeColor: '#02ed68', //findNodeColor(nodeData["0"][overlayid]["current_state"][nodeid]["state"])
            type: 'IPOP'
          }
        });
      }

      cy.makeLayout({name:'circle'}).run();

      for (nodeid in linkData["0"][overlayid]["current_state"]) {
        for (linkid in linkData["0"][overlayid]["current_state"][nodeid]){
          cy.add({
            data: { 
              id: linkid,
              source: linkData["0"][overlayid]["current_state"][nodeid][linkid]["SrcNodeId"],
              target: linkData["0"][overlayid]["current_state"][nodeid][linkid]["TgtNodeId"],
              // IceRole: linkData["0"][overlayid]["current_state"][nodeid][linkid]["IceRole"],
              // Type: "TURN", //linkData["0"][overlayid]["current_state"][nodeid][linkid]["Type"],
              rem_addr: linkData["0"][overlayid]["current_state"][nodeid][linkid]["rem_addr"],
              sent_bytes_second: linkData["0"][overlayid]["current_state"][nodeid][linkid]["sent_bytes_second"],
              // sent_total_bytes: linkData["0"][overlayid]["current_state"][nodeid][linkid]["sent_total_bytes"],
              // local_type: linkData["0"][overlayid]["current_state"][nodeid][linkid]["local_type"],
              // rem_type: linkData["0"][overlayid]["current_state"][nodeid][linkid]["rem_type"],
              // writable: linkData["0"][overlayid]["current_state"][nodeid][linkid]["writable"],
              // local_addr: linkData["0"][overlayid]["current_state"][nodeid][linkid]["local_addr"],
              // recv_bytes_second: linkData["0"][overlayid]["current_state"][nodeid][linkid]["recv_bytes_second"],
              // best_conn: linkData["0"][overlayid]["current_state"][nodeid][linkid]["best_conn"],
              // recv_total_bytes: linkData["0"][overlayid]["current_state"][nodeid][linkid]["recv_total_bytes"],
              // new_conn: linkData["0"][overlayid]["current_state"][nodeid][linkid]["new_conn"],
              // timeout: linkData["0"][overlayid]["current_state"][nodeid][linkid]["timeout"],
              // rtt: linkData["0"][overlayid]["current_state"][nodeid][linkid]["rtt"],
              edgeColor: '#fff'//findEdgeColor(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Type"])
            }
          });
        }
      }
  });
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
      cy.center();
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
          cy.add({
            data: { 
              id: nodeid,
              Name: nodeid, //nodeData["0"][overlayid]["added"][nodeid]["NodeName"]
              InterfaceName: nodeData["0"][overlayid]["added"][nodeid]["InterfaceName"],
              GeoIP: nodeData["0"][overlayid]["added"][nodeid]["GeoIP"],
              VIP4: nodeData["0"][overlayid]["added"][nodeid]["VIP4"],
              PrefixLen: nodeData["0"][overlayid]["added"][nodeid]["PrefixLen"],
              MAC: nodeData["0"][overlayid]["added"][nodeid]["MAC"],
              intervalNo: nodeData["0"]["intervalNo"],
              label: nodeid, //nodeData["0"][overlayid]["added"][nodeid]["NodeName"],  
              nodeColor: '#02ed68', //findNodeColor(nodeData["0"][overlayid]["added"][nodeid]["state"])
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
        cy.getElementById(nodeid).data({
          id: nodeid,
          Name: nodeid, //nodeData["0"][overlayid]["modified"][nodeid]["NodeName"]
          InterfaceName: nodeData["0"][overlayid]["modified"][nodeid]["InterfaceName"],
          GeoIP: nodeData["0"][overlayid]["modified"][nodeid]["GeoIP"],
          VIP4: nodeData["0"][overlayid]["modified"][nodeid]["VIP4"],
          PrefixLen: nodeData["0"][overlayid]["modified"][nodeid]["PrefixLen"],
          MAC: nodeData["0"][overlayid]["modified"][nodeid]["MAC"],
          intervalNo: nodeData["0"]["intervalNo"],
          label: nodeid, //nodeData["0"][overlayid]["modified"][nodeid]["NodeName"],  
          nodeColor: '#02ed68', //findNodeColor(nodeData["0"][overlayid]["modified"][nodeid]["state"])
          type: 'IPOP'
        });
      }

      cy.center();

      for (linkid in linkData["0"][overlayid]["added"]){
        if(cy.getElementById(linkid).length == 0){
          cy.add({
            data: { 
              id: linkid,
              source: linkData["0"][overlayid]["added"][linkid]["SrcNodeId"],
              target: linkData["0"][overlayid]["added"][linkid]["TgtNodeId"],
              // IceRole: linkData["0"][overlayid]["added"][linkid]["IceRole"],
              // Type: linkData["0"][overlayid]["added"][linkid]["Type"],
              rem_addr: linkData["0"][overlayid]["added"][linkid]["rem_addr"],
              sent_bytes_second: linkData["0"][overlayid]["added"][linkid]["sent_bytes_second"],
              // sent_total_bytes: linkData["0"][overlayid]["added"][linkid]["sent_total_bytes"],
              // local_type: linkData["0"][overlayid]["added"][linkid]["local_type"],
              // rem_type: linkData["0"][overlayid]["added"][linkid]["rem_type"],
              // writable: linkData["0"][overlayid]["added"][linkid]["writable"],
              // local_addr: linkData["0"][overlayid]["added"][linkid]["local_addr"],
              // recv_bytes_second: linkData["0"][overlayid]["added"][linkid]["recv_bytes_second"],
              // best_conn: linkData["0"][overlayid]["added"][linkid]["best_conn"],
              // recv_total_bytes: linkData["0"][overlayid]["added"][linkid]["recv_total_bytes"],
              // new_conn: linkData["0"][overlayid]["added"][linkid]["new_conn"],
              // timeout: linkData["0"][overlayid]["added"][linkid]["timeout"],
              // rtt: linkData["0"][overlayid]["added"][linkid]["rtt"],
              edgeColor: '#fff'//findEdgeColor(linkData["0"][overlayid]["added"][linkid]["Type"])     
            }
          });
        }
      }
      
      for (linkid in linkData["0"][overlayid]["removed"]){
        if(cy.getElementById(linkid).length == 1){
          cy.remove(cy.getElementById(linkid));
        }
      }

      for (linkid in linkData["0"][overlayid]["modified"]){
        cy.getElementById(linkid).data({
          id: linkid,
          source: linkData["0"][overlayid]["modified"][linkid]["SrcNodeId"],
          target: linkData["0"][overlayid]["modified"][linkid]["TgtNodeId"],
          // IceRole: linkData["0"][overlayid]["modified"][linkid]["IceRole"],
          // Type: linkData["0"][overlayid]["modified"][linkid]["Type"],
          rem_addr: linkData["0"][overlayid]["modified"][linkid]["rem_addr"],
          // sent_bytes_second: linkData["0"][overlayid]["modified"][linkid]["sent_bytes_second"],
          // sent_total_bytes: linkData["0"][overlayid]["modified"][linkid]["sent_total_bytes"],
          // local_type: linkData["0"][overlayid]["modified"][linkid]["local_type"],
          // rem_type: linkData["0"][overlayid]["modified"][linkid]["rem_type"],
          // writable: linkData["0"][overlayid]["modified"][linkid]["writable"],
          // local_addr: linkData["0"][overlayid]["modified"][linkid]["local_addr"],
          // recv_bytes_second: linkData["0"][overlayid]["modified"][linkid]["recv_bytes_second"],
          // best_conn: linkData["0"][overlayid]["modified"][linkid]["best_conn"],
          // recv_total_bytes: linkData["0"][overlayid]["modified"][linkid]["recv_total_bytes"],
          // new_conn: linkData["0"][overlayid]["modified"][linkid]["new_conn"],
          // timeout: linkData["0"][overlayid]["modified"][linkid]["timeout"],
          // rtt: linkData["0"][overlayid]["modified"][linkid]["rtt"],
          edgeColor: '#fff'//findEdgeColor(linkData["0"][overlayid]["modified"][linkid]["Type"])
        });
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
      $('#config').append("<section class='NodeInfoPanel' id='infoPanel_"+event.target.id()+"'><section class='NodeInfoPanelHeading'><article><button type='button' class='close' data-target='#infoPanel_"+event.target.id()+"' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>"+event.target._private.data.Name+"</article></section><section class='NodeInfoPanelBody'>"+mouseClickNode(event.target.id())+"</div><button id='infobtn_"+event.target.id()+"' class='btn btn-primary' onClick='linkMetrics(this.id)'>Link Metrics</button></div></section>");
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

function findEdgeColor(linktype) {
	if (linktype == "TURN")
    return "orange";
	if (linktype == "STUN")
    return "yellow";
	if (linktype == "LOCAL")
    return "blue";
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
    var ipopNodeQTip = ipopNodeInfo;
      ipopNodeQTip = ipopNodeQTip.replace("$nodeid",nodeData.id);
      ipopNodeQTip = ipopNodeQTip.replace("$interfacename",nodeData.InterfaceName);
      ipopNodeQTip = ipopNodeQTip.replace("$geoip",nodeData.GeoIP);
      ipopNodeQTip = ipopNodeQTip.replace("$vip4",nodeData.VIP4);
      ipopNodeQTip = ipopNodeQTip.replace("$prefixlen",nodeData.PrefixLen);
      ipopNodeQTip = ipopNodeQTip.replace("$mac",nodeData.MAC);
    return ipopNodeQTip;

  }
}

function mouseClickNode(nodeid)
{
  nodeData = cy.getElementById(nodeid).data()
  var ipopNodePanel = ipopNodeInfo;
      ipopNodePanel = ipopNodePanel.replace("$nodeid",nodeData.id);
      ipopNodePanel = ipopNodePanel.replace("$interfacename",nodeData.InterfaceName);
      ipopNodePanel = ipopNodePanel.replace("$geoip",nodeData.GeoIP);
      ipopNodePanel = ipopNodePanel.replace("$vip4",nodeData.VIP4);
      ipopNodePanel = ipopNodePanel.replace("$prefixlen",nodeData.PrefixLen);
      ipopNodePanel = ipopNodePanel.replace("$mac",nodeData.MAC);
    return ipopNodePanel;
}

function linkMetrics(buttonid)
{
  if(document.getElementById('linkMetricsDialog')!=null)
    $('#linkMetricsDialog').remove();

  nodeid = buttonid.substr(8);
  connectedLinks = cy.nodes('#'+nodeid).connectedEdges().map(function( ele ){
                                                                return ele.data('id');
                                                            });
  var linkMetricsDialog = "";
  var allLinkMetrics = "";
  for (var index in connectedLinks){
    linkData = cy.getElementById(connectedLinks[index]).data()
    var eachLinkMetrics = linkMetricsInfo;
        eachLinkMetrics = eachLinkMetrics.replace("$source",linkData.source);
        eachLinkMetrics = eachLinkMetrics.replace("$target",linkData.target);
        eachLinkMetrics = eachLinkMetrics.replace("$type",linkData.Type);
        eachLinkMetrics = eachLinkMetrics.replace("$sent_bytes_second",linkData.sent_bytes_second);
        eachLinkMetrics = eachLinkMetrics.replace("$sent_total_bytes",linkData.sent_total_bytes);
        eachLinkMetrics = eachLinkMetrics.replace("$recv_bytes_second",linkData.recv_bytes_second);
        eachLinkMetrics = eachLinkMetrics.replace("$recv_total_bytes",linkData.recv_total_bytes);
    allLinkMetrics += "<section class='eachLinkInfo'><section class='linkID'>"+linkData.id+"</section>"+eachLinkMetrics+"</section>";
  }
  linkMetricsDialog += "<section id='linkMetricsDialog'><section id='linkMetricsDialogHeading'><button type='button' class='close' data-target='#linkMetricsDialog' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>Link Metrics</section><section id='linkMetricsDialogBody'>"+allLinkMetrics+"</section>";

  $('#toolsTab').append(linkMetricsDialog);
}
