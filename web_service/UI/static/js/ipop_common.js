var overlayNodeInfo = "<section class='InfoPanel'><section class='leftColumn'><div>ID&nbsp;</div><div>Nodes</div><div>Links</div></section><section id='rightColumn'><div>&nbsp;$overlayid</div><div>&nbsp;$numnodes</div><div>&nbsp;$numlinks</div></section></section>"

var ipopNodeInfo = "<section class='InfoPanel sr-only'><section class='leftColumn'><div>MAC&nbsp;</div><div>Tap&nbsp;</div><div>Peer ID</div><div>IceRole</div><div>Remote Address</div><div>Bytes Sent (Bs)</div><div>Total Bytes Sent (MB)</div><div>Writable</div><div>Local Address</div><div>Bytes Received (Bs)</div><div>Total Bytes Received (MB)</div><div>Best Connection</div><div>New Connection</div><div>Timeout</div><div>rtt</div></section><section id='rightColumn'><div>&nbsp;$mac</div><div>&nbsp;$interfacename</div><div>&nbsp;$target</div><div>&nbsp;$icerole</div><div>&nbsp;$remaddr</div><div>&nbsp;$sent_bytes_second</div><div>&nbsp;$sent_total_bytes</div><div>&nbsp;$writable</div><div>&nbsp;$localaddr</div><div>&nbsp;$recv_bytes_second</div><div>&nbsp;$recv_total_bytes</div><div>&nbsp;$bestconn</div><div>&nbsp;$newconn</div><div>&nbsp;$timeout</div><div>&nbsp;$rtt</div></section></section>"
var mouseOverNodeInfo = "<section class='InfoPanel'><section class='leftColumn'><div>Node ID&nbsp;</div></section><section id='rightColumn'><div>&nbsp;$nodeid</div></section>"

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
                    // "line-color": "data(edgeColor)",
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
      console.log('This is nodeData :', nodeData);
      console.log('This is linkData :', linkData);
    for (nodeid in nodeData["0"][overlayid]["current_state"]) {
        if(nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"] == "")
            nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"] = nodeid;
        cy.add({
          data: {
            id: nodeid,
            Name: nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"],
            intervalNo: nodeData["0"]["intervalNo"],
            label: nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"],
            nodeColor: "red",
            type: 'IPOP'
          }
        });
      }

      // console.log(cy);
      cy.makeLayout({name:'circle'}).run();
      for (nodeid in linkData["0"][overlayid]["current_state"]) {
        console.log('For node ', nodeid);
        console.log('links = ', linkData["0"][overlayid]["current_state"][nodeid]);
        for (linkid in linkData["0"][overlayid]["current_state"][nodeid]){
          console.log('linkid = ', linkid);
          var cyData = {
            id: linkid + "_" + linkData["0"][overlayid]["current_state"][nodeid][linkid]["SrcNodeId"],
            InterfaceName: linkData["0"][overlayid]["current_state"][nodeid][linkid]["InterfaceName"],
            IP4PrefixLen: linkData["0"][overlayid]["current_state"][nodeid][linkid]["IP4PrefixLen"],
            MAC: linkData["0"][overlayid]["current_state"][nodeid][linkid]["MAC"],
            source: linkData["0"][overlayid]["current_state"][nodeid][linkid]["SrcNodeId"],
            target: linkData["0"][overlayid]["current_state"][nodeid][linkid]["TgtNodeId"],
            IceRole: linkData["0"][overlayid]["current_state"][nodeid][linkid]["IceRole"],
            Type: linkData["0"][overlayid]["current_state"][nodeid][linkid]["Type"]
            // edgeColor: findEdgeColor(linkData["0"][overlayid]["current_state"][nodeid][linkid]["rem_type"] , linkData["0"][overlayid]["current_state"][nodeid][linkid]["local_type"])
          };
          for (let stat in linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"]){
            if(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["best_conn"]){
            cyData.sent_bytes_second= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["sent_bytes_second"];
            cyData.sent_total_bytes= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["sent_total_bytes"];
            cyData.rem_candidate= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Type"];
            cyData.writable= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["writable"];
            cyData.local_candidate= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["local_addr"];
            cyData.recv_bytes_second= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["recv_bytes_second"];
            cyData.best_conn= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["best_conn"];
            cyData.recv_total_bytes= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["recv_total_bytes"];
            cyData.new_conn= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["new_conn"];
            cyData.timeout= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["timeout"];
            cyData.rtt= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["rtt"];
            }
          }
          console.log(cyData);
          cy.add({
            data: cyData
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
      console.log('In update graph data = ', data);
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

      //For "added" 
      for (nodeid in nodeData["0"][overlayid]["added"]) {
        if(cy.getElementById(nodeid).length == 0){
          if(nodeData["0"][overlayid]["added"][nodeid]["NodeName"] == "")
            nodeData["0"][overlayid]["added"][nodeid]["NodeName"] = nodeid;
          cy.add({
            data: {
              id: nodeid,
              Name: nodeData["0"][overlayid]["added"][nodeid]["NodeName"],
              intervalNo: nodeData["0"]["intervalNo"],
              label: nodeData["0"][overlayid]["added"][nodeid]["NodeName"],
              nodeColor: "red",
              type: 'IPOP'
            }
          });
        }
      }

      //for "modified"
      for (nodeid in nodeData["0"][overlayid]["modified"]){
        if(nodeData["0"][overlayid]["modified"][nodeid]["NodeName"] == "")
            nodeData["0"][overlayid]["modified"][nodeid]["NodeName"] = nodeid;
        cy.getElementById(nodeid).data({
          id: nodeid,
          intervalNo: nodeData["0"]["intervalNo"],
          label: nodeData["0"][overlayid]["modified"][nodeid]["NodeName"],
          nodeColor: "red",
          type: 'IPOP'
        });
      }

      //for "removed"
      for (nodeid in nodeData["0"][overlayid]["removed"]) {
        if(cy.getElementById(nodeid).length == 1){
          cy.remove(cy.getElementById(nodeid));
        }
      }

      for(nodeid in linkData["0"][overlayid]["added"]){
        for (linkid in linkData["0"][overlayid]["added"][nodeid]){
          if(cy.getElementById(linkid).length == 0){
            var cyData = {
              InterfaceName: linkData["0"][overlayid]["added"][nodeid][linkid]["InterfaceName"],
              IP4PrefixLen: linkData["0"][overlayid]["added"][nodeid][linkid]["IP4PrefixLen"],
              MAC: linkData["0"][overlayid]["added"][nodeid][linkid]["MAC"],
              id: linkid + "_" + linkData["0"][overlayid]["added"][nodeid][linkid]["SrcNodeId"],
              source: linkData["0"][overlayid]["added"][nodeid][linkid]["SrcNodeId"],
              target: linkData["0"][overlayid]["added"][nodeid][linkid]["TgtNodeId"],
              IceRole: linkData["0"][overlayid]["added"][nodeid][linkid]["IceRole"],
              Type: linkData["0"][overlayid]["added"][nodeid][linkid]["Type"]
            };

            for (let stat in linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"]){
              if(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["best_conn"]){
                cyData.sent_bytes_second = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["sent_bytes_second"],
                cyData.sent_total_bytes = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["sent_total_bytes"],
                cyData.rem_candidate = linkData["0"][overlayid]["added"][nodeid][linkid]["Type"],
                cyData.writable = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["writable"],
                cyData.local_candidate = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["local_addr"],
                cyData.recv_bytes_second = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["recv_bytes_second"],
                cyData.best_conn = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["best_conn"],
                cyData.recv_total_bytes = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["recv_total_bytes"],
                cyData.new_conn = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["new_conn"],
                cyData.timeout = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["timeout"],
                cyData.rtt = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["rtt"]
                // cyData.edgeColor = findEdgeColor(linkData["0"][overlayid]["added"][nodeid][linkid]["rem_type"] , linkData["0"][overlayid]["added"][nodeid][linkid]["local_type"])
              }
            }
            cy.add({
              data: cyData
            });
            cy.getElementById(linkData["0"][overlayid]["added"][nodeid][linkid]["SrcNodeId"]).data({ nodeColor :"#02ed68" });
            cy.getElementById(linkData["0"][overlayid]["added"][nodeid][linkid]["TgtNodeId"]).data({ nodeColor :"#02ed68" });
          }
        }
      }
      //"added" ends

      for (nodeid in linkData["0"][overlayid]["modified"]){
        for (linkid in linkData["0"][overlayid]["modified"][nodeid]){
          console.log('I am here first : ', cy.getElementById(linkid))
          var cyData = {
            InterfaceName: linkData["0"][overlayid]["modified"][nodeid][linkid]["InterfaceName"],
            IP4PrefixLen: linkData["0"][overlayid]["modified"][nodeid][linkid]["IP4PrefixLen"],
            MAC: linkData["0"][overlayid]["modified"][nodeid][linkid]["MAC"],
            id: linkid + "_" + linkData["0"][overlayid]["modified"][nodeid][linkid]["SrcNodeId"],
            source: linkData["0"][overlayid]["modified"][nodeid][linkid]["SrcNodeId"],
            target: linkData["0"][overlayid]["modified"][nodeid][linkid]["TgtNodeId"],
            IceRole: linkData["0"][overlayid]["modified"][nodeid][linkid]["IceRole"],
            Type: linkData["0"][overlayid]["modified"][nodeid][linkid]["Type"]
          };

          for (let stat in linkData["0"][overlayid]["modified"][nodeid][linkid]["Stats"]){
            if(linkData["0"][overlayid]["modified"][nodeid][linkid]["Stats"][stat]["best_conn"]){
              cyData.sent_bytes_second = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["sent_bytes_second"],
              cyData.sent_total_bytes = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["sent_total_bytes"],
              cyData.rem_candidate = linkData["0"][overlayid]["modified"][nodeid][linkid]["Type"],
              cyData.writable = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["writable"],
              cyData.local_candidate = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["local_addr"],
              cyData.recv_bytes_second = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["recv_bytes_second"],
              cyData.best_conn = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["best_conn"],
              cyData.recv_total_bytes = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["recv_total_bytes"],
              cyData.new_conn = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["new_conn"],
              cyData.timeout = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["timeout"],
              cyData.rtt = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["rtt"]
              // cyData.edgeColor = findEdgeColor(linkData["0"][overlayid]["modified"][nodeid][linkid]["rem_type"] , linkData["0"][overlayid]["modified"][nodeid][linkid]["local_type"])
            }
          }
          cy.getElementById(linkid).data({
            cyData
          });
          console.log('I am here last : ', cy.getElementById(linkid))
       }
      }

     //"" ends

      

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

      //"removed" ends
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
      console.log('event.target.id() = ', event.target.id())
      $('#config').append("<section class='NodeInfoPanel' id='infoPanel_"+event.target.id()+"'><section class='NodeInfoPanelHeading' onclick='$(this).parent().find(\".collapse\").toggleClass(\"show\")' ><article>"+event.target._private.data.Name+"<button type='button' class='close' data-target='#infoPanel_"+event.target.id()+"' data-dismiss='alert'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button></section><section id='#info_"+event.target.id()+"'  class='NodeInfoPanelBody collapse' >"+mouseClickNode(event.target.id())+"</div></section>");
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

// function findEdgeColor(remtype,localtype) {
//   if (remtype == "turn" || localtype == "turn")
//     return "orange";
//   if (remtype == "stun" || localtype == "stun")
//     return "yellow";
//   if (remtype == "local" || localtype == "local")
//     return "blue";
//   return "white";
// }

function mouseOverNode(nodeid) {
  nodeData = cy.getElementById(nodeid).data()

  console.log('MouseOverNode nodeid: ', nodeid);
  if(nodeData.type == "Overlay"){
    var overlayNodeQTip = overlayNodeInfo;
      overlayNodeQTip = overlayNodeQTip.replace("$overlayid",nodeData.id);
      overlayNodeQTip = overlayNodeQTip.replace("$numnodes",nodeData.NumNodes);
      overlayNodeQTip = overlayNodeQTip.replace("$numlinks",nodeData.NumLinks);
    return overlayNodeQTip;
  }
  else{
    var mouseOverNodeQTip = mouseOverNodeInfo;
      mouseOverNodeQTip = mouseOverNodeQTip.replace("$nodeid",(nodeData.id).substring(0,10));
      // mouseOverNodeQTip = mouseOverNodeQTip.replace("$mac",linkData.MAC);
      //mouseOverNodeQTip = mouseOverNodeQTip.replace("$interfacename",nodeData.InterfaceName);
    return mouseOverNodeQTip;

  }
}

function mouseClickNode(nodeid)
{
  nodeData = cy.getElementById(nodeid).data()
  console.log('For nodeid = ', nodeid);
  connectedLinks = cy.nodes('#'+nodeid).connectedEdges().map(function( ele ){
                                                                if(ele.data('source') == nodeid)
                                                                    return ele.data('id');
                                                            });

  var allLinkMetrics = "";

  console.log('connected links is =', connectedLinks);
  for (var index in connectedLinks){
    if(connectedLinks[index] == undefined){
    continue;
    }
    linkData = cy.getElementById(connectedLinks[index]).data();

  var ipopNodePanel = ipopNodeInfo;
      ipopNodePanel = ipopNodePanel.replace("$nodeid",nodeData.id.substring(0,7));
      
      // if(nodeData.VIP4 != undefined)
      //ipopNodePanel = ipopNodePanel.replace("$vip4",nodeData.VIP4);
      // else
      //   ipopNodePanel = ipopNodePanel.replace("$vip4","-");

      if(nodeData.IP4PrefixLen != undefined)
        ipopNodePanel = ipopNodePanel.replace("$prefixlen",linkData.IP4PrefixLen);
      else
        ipopNodePanel = ipopNodePanel.replace("$prefixlen","-");

      ipopNodePanel = ipopNodePanel.replace("$mac",linkData.MAC);
      ipopNodePanel = ipopNodePanel.replace("$interfacename",linkData.InterfaceName);
      ipopNodePanel = ipopNodePanel.replace("$target",linkData.target);
      ipopNodePanel = ipopNodePanel.replace("$icerole",linkData.IceRole);
      ipopNodePanel = ipopNodePanel.replace("$remaddr",linkData.remote_candidate);
      ipopNodePanel = ipopNodePanel.replace("$sent_bytes_second",linkData.sent_bytes_second);
      ipopNodePanel = ipopNodePanel.replace("$sent_total_bytes",linkData.sent_total_bytes);
      // ipopNodePanel = ipopNodePanel.replace("$localtype",linkData.local_type);
      // ipopNodePanel = ipopNodePanel.replace("$remtype",linkData.rem_type);
      ipopNodePanel = ipopNodePanel.replace("$writable",linkData.writable);
      ipopNodePanel = ipopNodePanel.replace("$localaddr",linkData.local_candidate);
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
