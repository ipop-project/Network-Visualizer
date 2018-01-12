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
  $.getJSON("http://"+serverip+"/IPOP/getOverlays?interval=2018-01-12T14:00:47&currentState=True", function(data,status) {
    if (status == "error") throw error;
    for (overlay in data["currentState"]) {
          cy.add({
             data: { 
                    id: overlay,
                    Name: data["currentState"][overlay]["Name"],
                    NumNodes: data["currentState"][overlay]["NumNodes"],
                    NumLinks: data["currentState"][overlay]["NumLinks"],
                    intervalNo: data["intervalNo"],
                    label: data["currentState"][overlay]["Name"],
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

function buildNetworkTopology(overlayid)
{
  $.getJSON("http://"+serverip+"/IPOP/overlays/"+overlayid+"/nodes?interval=2018-01-12T14:00:47&currentState=True", function(data,status) {
    if (status == "error") throw error;
    for (nodeid in data[overlayid]["currentState"]) {
      cy.add({
              data: { 
                      id: nodeid,
                      Name: nodeid, //data[overlayid]["currentState"][nodeid]["NodeName"]
                      InterfaceName: data[overlayid]["currentState"][nodeid]["InterfaceName"],
                      GeoIP: data[overlayid]["currentState"][nodeid]["GeoIP"],
                      VIP4: data[overlayid]["currentState"][nodeid]["VIP4"],
                      PrefixLen: data[overlayid]["currentState"][nodeid]["PrefixLen"],
                      MAC: data[overlayid]["currentState"][nodeid]["MAC"],
                      intervalNo: data["intervalNo"],
                      label: nodeid, //data[overlayid]["currentState"][nodeid]["NodeName"],  
                      nodeColor: '#02ed68', //findNodeColor(data[overlayid]["currentState"][nodeid]["state"])
                      type: 'IPOP' 
                    }
      });
    }
    cy.makeLayout({name: 'circle'}).run();
  });

  $.getJSON("http://"+serverip+"/IPOP/overlays/"+overlayid+"/links?interval=2018-01-12T14:00:47&currentState=True", function(data,status) {
    if (status == "error") throw error;
    for (nodeid in data[overlayid]["currentState"]) {
      for (linkid in data[overlayid]["currentState"][nodeid]){
        cy.add({
              data: { 
                      id: linkid,
                      source: data[overlayid]["currentState"][nodeid][linkid]["SrcNodeId"],
                      target: data[overlayid]["currentState"][nodeid][linkid]["TgtNodeId"],
                      // IceRole: data[overlayid]["currentState"][nodeid][linkid]["IceRole"],
                      Type: data[overlayid]["currentState"][nodeid][linkid]["Type"],
                      // rem_addr: data[overlayid]["currentState"][nodeid][linkid]["rem_addr"],
                      sent_bytes_second: data[overlayid]["currentState"][nodeid][linkid]["sent_bytes_second"],
                      sent_total_bytes: data[overlayid]["currentState"][nodeid][linkid]["sent_total_bytes"],
                      // local_type: data[overlayid]["currentState"][nodeid][linkid]["local_type"],
                      // rem_type: data[overlayid]["currentState"][nodeid][linkid]["rem_type"],
                      // writable: data[overlayid]["currentState"][nodeid][linkid]["writable"],
                      // local_addr: data[overlayid]["currentState"][nodeid][linkid]["local_addr"],
                      recv_bytes_second: data[overlayid]["currentState"][nodeid][linkid]["recv_bytes_second"],
                      // best_conn: data[overlayid]["currentState"][nodeid][linkid]["best_conn"],
                      recv_total_bytes: data[overlayid]["currentState"][nodeid][linkid]["recv_total_bytes"],
                      // new_conn: data[overlayid]["currentState"][nodeid][linkid]["new_conn"],
                      // timeout: data[overlayid]["currentState"][nodeid][linkid]["timeout"],
                      // rtt: data[overlayid]["currentState"][nodeid][linkid]["rtt"],
                      edgeColor: findEdgeColor(data[overlayid]["currentState"][nodeid][linkid]["Type"])     
                    }
        });
      }
    }    
  });
}

function updateGraph()
{
  if(cy.nodes().allAre('[type = "Overlay"]')){
    $.getJSON("http://"+serverip+"/IPOP/getOverlays?interval=2018-01-11T21:47:59", function(data,status) {
      if (status == "error") throw error;
      for (overlay in data["added"]) {
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
      }

      for (overlay in data["removed"]) {
        cy.remove(cy.$('#'+overlay));
      }

      for (overlay in data["modified"]){
        cy.$('#'+overlay).data({
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

      cy.makeLayout({name: 'circle'}).run();
    });
  }
  else{
    var overlayid = document.getElementById('overlay-form-control');
    $.getJSON("http://"+serverip+"/IPOP/overlays/"+overlayid+"/nodes?interval=2017-12-29T19:29:13", function(data,status) {
      if (status == "error") throw error;
      for (nodeid in data[overlayid]["added"]) {
        cy.add({
           data: { 
                  id: nodeid,
                  Name: data[overlayid]["added"][nodeid]["Name"],
                  NumNodes: data[overlayid]["added"][nodeid]["NumNodes"],
                  NumLinks: data[overlayid]["added"][nodeid]["NumLinks"],
                  intervalNo: data[overlayid]["intervalNo"],
                  label: data[overlayid]["added"][nodeid]["Name"],
                  nodeColor: '#74CBE8',
                  type: 'IPOP' 
                } 
        });
      }

      for (nodeid in data[overlayid]["removed"]) {
        cy.remove(cy.$('#'+nodeid));
      }

      for (nodeid in data[overlayid]["modified"]){
        cy.$('#'+nodeid).data({
          id: nodeid,
          Name: data[overlayid]["modified"][nodeid]["Name"],
          NumNodes: data[overlayid]["modified"][nodeid]["NumNodes"],
          NumLinks: data[overlayid]["modified"][nodeid]["NumLinks"],
          intervalNo: data[overlayid]["intervalNo"],
          label: data[overlayid]["modified"][nodeid]["Name"],
          nodeColor: '#74CBE8',
          type: 'IPOP'
        });
      }

      cy.makeLayout({name: 'circle'}).run();
    });

    $.getJSON("http://"+serverip+"/IPOP/overlays/"+overlayid+"/links?interval=2017-12-29T19:29:13", function(data,status) {
      if (status == "error") throw error;
      for (linkid in data[overlayid]["added"]){
        cy.add({
            data: { 
                    id: linkid,
                    source: data[overlayid]["added"][linkid]["SrcNodeId"],
                    target: data[overlayid]["added"][linkid]["TgtNodeId"],
                    // IceRole: data[overlayid]["added"][linkid]["IceRole"],
                    // Type: data[overlayid]["added"][linkid]["Type"],
                    // rem_addr: data[overlayid]["added"][linkid]["rem_addr"],
                    sent_bytes_second: data[overlayid]["added"][linkid]["sent_bytes_second"],
                    sent_total_bytes: data[overlayid]["added"][linkid]["sent_total_bytes"],
                    // local_type: data[overlayid]["added"][linkid]["local_type"],
                    // rem_type: data[overlayid]["added"][linkid]["rem_type"],
                    // writable: data[overlayid]["added"][linkid]["writable"],
                    // local_addr: data[overlayid]["added"][linkid]["local_addr"],
                    recv_bytes_second: data[overlayid]["added"][linkid]["recv_bytes_second"],
                    // best_conn: data[overlayid]["added"][linkid]["best_conn"],
                    recv_total_bytes: data[overlayid]["added"][linkid]["recv_total_bytes"],
                    // new_conn: data[overlayid]["added"][linkid]["new_conn"],
                    // timeout: data[overlayid]["added"][linkid]["timeout"],
                    // rtt: data[overlayid]["added"][linkid]["rtt"],
                    edgeColor: '#fff' //findEdgeColor(data[overlayid]["added"][linkid]["Type"])     
                  }
        });
      }

      for (linkid in data[overlayid]["removed"]){
        cy.remove(cy.$('#'+linkid));
      }

      for (linkid in data[overlayid]["modified"]){
        cy.$('#'+linkid).data({
          id: linkid,
          source: data[overlayid]["modified"][linkid]["SrcNodeId"],
          target: data[overlayid]["modified"][linkid]["TgtNodeId"],
          // IceRole: data[overlayid]["modified"][linkid]["IceRole"],
          // Type: data[overlayid]["modified"][linkid]["Type"],
          // rem_addr: data[overlayid]["modified"][linkid]["rem_addr"],
          sent_bytes_second: data[overlayid]["modified"][linkid]["sent_bytes_second"],
          sent_total_bytes: data[overlayid]["modified"][linkid]["sent_total_bytes"],
          // local_type: data[overlayid]["modified"][linkid]["local_type"],
          // rem_type: data[overlayid]["modified"][linkid]["rem_type"],
          // writable: data[overlayid]["modified"][linkid]["writable"],
          // local_addr: data[overlayid]["modified"][linkid]["local_addr"],
          recv_bytes_second: data[overlayid]["modified"][linkid]["recv_bytes_second"],
          // best_conn: data[overlayid]["modified"][linkid]["best_conn"],
          recv_total_bytes: data[overlayid]["modified"][linkid]["recv_total_bytes"],
          // new_conn: data[overlayid]["modified"][linkid]["new_conn"],
          // timeout: data[overlayid]["modified"][linkid]["timeout"],
          // rtt: data[overlayid]["modified"][linkid]["rtt"],
          edgeColor: '#fff' //findEdgeColor(data[overlayid]["modified"][linkid]["Type"])
        });
      }
    });
  }
}

function overlayListClick(overlayid) {
  cy.remove(cy.nodes());
  $('.NodeInfoPanel').remove();
  $('#linkMetricsDialog').remove();
  if(overlayid != 'Select Overlay')
    buildNetworkTopology(overlayid);
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
  
  cy.$('#'+event.target.id()).qtip({
    content: mouseOverNode(event.target.id()),
    style: {classes: 'qtip-bootstrap'},
    show: {
            event: event.type,
            ready: true
    }
  });
  
  if(cy.$('#'+event.target.id()).data("type") == "IPOP"){
    cy.$('#'+event.target.id()).connectedEdges().animate({
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
  if(cy.$('#'+event.target.id()).data("type") == "IPOP"){
    cy.$('#'+event.target.id()).connectedEdges().animate({
      style: { "width":"0.2em" }
    });
  }
});

cy.on('click','node',function(event){
  if(event.target._private.data.type == "Overlay"){
    overlayid = event.target.id();
    cy.remove(cy.nodes());
    document.getElementById("overlay-form-control").value = overlayid;
    buildNetworkTopology(overlayid);
  }
  else{
    if(document.getElementById('infoPanel_'+event.target.id()) == null){
      $('#config').append("<section class='NodeInfoPanel' id='infoPanel_"+event.target.id()+"'><section class='NodeInfoPanelHeading'><article><button type='button' class='close' data-target='#infoPanel_"+event.target.id()+"' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button>"+event.target._private.data.Name+"</article></section><section class='NodeInfoPanelBody'>"+mouseClickNode(event.target.id())+"</div><button id='infobtn_"+event.target.id()+"' class='btn btn-primary' onClick='linkMetrics(this.id)'>Link Metrics</button></div></section>");
    }
  }
});

cy.on('mouseover','edge',function(event){
  cy.$('#'+event.target.id()).animate({
      style: { "width":"0.4em" }
  });
});
		
cy.on('mouseout','edge',function(event){
  cy.$('#'+event.target.id()).animate({
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
  nodeData = cy.$('#'+nodeid).data()
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
  nodeData = cy.$('#'+nodeid).data()
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
    linkData = cy.$('#'+connectedLinks[index]).data()
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