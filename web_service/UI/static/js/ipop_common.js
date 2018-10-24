var overlayNodeInfo = "<section class='InfoPanel'><section class='leftColumn'><div>ID&nbsp;</div><div>Nodes</div><div>Links</div></section><section id='rightColumn'><div>&nbsp;$overlayid</div><div>&nbsp;$numnodes</div><div>&nbsp;$numlinks</div></section></section>"
var mouseOverNodeInfo = "<section class='InfoPanel'><section class='leftColumn'><div>Node ID&nbsp;</div></section><section id='rightColumn'><div>&nbsp;$nodeid</div></section>"
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
          intervalNo: nodeData["0"]["intervalNo"],
          label: nodeData["0"][overlayid]["current_state"][nodeid]["NodeName"],
          nodeColor: "red",
          type: 'IPOP'
        }
      });
    }

    cy.makeLayout({name:'circle'}).run();
    for (nodeid in linkData["0"][overlayid]["current_state"]) {
      for (linkid in linkData["0"][overlayid]["current_state"][nodeid]){
        var cyData = {
          id: linkid + "_" + linkData["0"][overlayid]["current_state"][nodeid][linkid]["SrcNodeId"],
          InterfaceName: linkData["0"][overlayid]["current_state"][nodeid][linkid]["InterfaceName"],
          MAC: linkData["0"][overlayid]["current_state"][nodeid][linkid]["MAC"],
          source: linkData["0"][overlayid]["current_state"][nodeid][linkid]["SrcNodeId"],
          target: linkData["0"][overlayid]["current_state"][nodeid][linkid]["TgtNodeId"],
          IceRole: linkData["0"][overlayid]["current_state"][nodeid][linkid]["IceRole"],
          Type: linkData["0"][overlayid]["current_state"][nodeid][linkid]["Type"]
        };
        for (let stat in linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"]){
          if(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["best_conn"]){
            const remote_candidate = parseCandAddress(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["remote_candidate"]);
            const local_candidate = parseCandAddress(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["local_candidate"]);
            
            cyData.sent_bytes_second= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["sent_bytes_second"];
            cyData.sent_total_bytes= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["sent_total_bytes"];
            cyData.remote_candidate= remote_candidate;
            cyData.writable= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["writable"];
            cyData.local_candidate= local_candidate;
            cyData.recv_bytes_second= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["recv_bytes_second"];
            cyData.best_conn= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["best_conn"];
            cyData.recv_total_bytes= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["recv_total_bytes"];
            cyData.new_conn= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["new_conn"];
            cyData.timeout= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["timeout"];
            cyData.rtt= linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["rtt"];
          }
        }

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
              MAC: linkData["0"][overlayid]["added"][nodeid][linkid]["MAC"],
              id: linkid + "_" + linkData["0"][overlayid]["added"][nodeid][linkid]["SrcNodeId"],
              source: linkData["0"][overlayid]["added"][nodeid][linkid]["SrcNodeId"],
              target: linkData["0"][overlayid]["added"][nodeid][linkid]["TgtNodeId"],
              IceRole: linkData["0"][overlayid]["added"][nodeid][linkid]["IceRole"],
              Type: linkData["0"][overlayid]["added"][nodeid][linkid]["Type"]
            };

            for (let stat in linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"]){
              if(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["best_conn"]){
                const remote_candidate = parseCandAddress(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["remote_candidate"]);
                const local_candidate = parseCandAddress(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["local_candidate"]);
                
                cyData.sent_bytes_second = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["sent_bytes_second"],
                cyData.sent_total_bytes = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["sent_total_bytes"],
                cyData.remote_candidate = remote_candidate,
                cyData.writable = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["writable"],
                cyData.local_candidate = local_candidate,
                cyData.recv_bytes_second = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["recv_bytes_second"],
                cyData.best_conn = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["best_conn"],
                cyData.recv_total_bytes = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["recv_total_bytes"],
                cyData.new_conn = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["new_conn"],
                cyData.timeout = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["timeout"],
                cyData.rtt = linkData["0"][overlayid]["added"][nodeid][linkid]["stats"][stat]["rtt"]
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
          var cyData = {
            InterfaceName: linkData["0"][overlayid]["modified"][nodeid][linkid]["InterfaceName"],
            MAC: linkData["0"][overlayid]["modified"][nodeid][linkid]["MAC"],
            id: linkid + "_" + linkData["0"][overlayid]["modified"][nodeid][linkid]["SrcNodeId"],
            source: linkData["0"][overlayid]["modified"][nodeid][linkid]["SrcNodeId"],
            target: linkData["0"][overlayid]["modified"][nodeid][linkid]["TgtNodeId"],
            IceRole: linkData["0"][overlayid]["modified"][nodeid][linkid]["IceRole"],
            Type: linkData["0"][overlayid]["modified"][nodeid][linkid]["Type"]
          };

          for (let stat in linkData["0"][overlayid]["modified"][nodeid][linkid]["Stats"]){
            if(linkData["0"][overlayid]["modified"][nodeid][linkid]["Stats"][stat]["best_conn"]){
              const remote_candidate = parseCandAddress(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["remote_candidate"]);
              const local_candidate = parseCandAddress(linkData["0"][overlayid]["current_state"][nodeid][linkid]["Stats"][stat]["local_candidate"]);

              cyData.sent_bytes_second = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["sent_bytes_second"],
              cyData.sent_total_bytes = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["sent_total_bytes"],
              cyData.remote_candidate = remote_candidate,
              cyData.writable = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["writable"],
              cyData.local_candidate = local_candidate,
              cyData.recv_bytes_second = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["recv_bytes_second"],
              cyData.best_conn = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["best_conn"],
              cyData.recv_total_bytes = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["recv_total_bytes"],
              cyData.new_conn = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["new_conn"],
              cyData.timeout = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["timeout"],
              cyData.rtt = linkData["0"][overlayid]["modified"][nodeid][linkid]["stats"][stat]["rtt"]
            }
          }
          cy.getElementById(linkid).data({
            cyData
          });
       }
      }

     //"modified" ends

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

function parseCandAddress(candAddress){
  const originalString = candAddress;
  const splitString = originalString.split(":");
  var address="";
  if(splitString[5]){
    address += splitString[5]+":";
  }
  if(splitString[6]){
    address += splitString[6]+":<br />";
  }
  if(splitString[7]){
    if(splitString[8]){
      address += splitString[7]+":";
    }
    else{
      address += splitString[7]
      return address;
    }
  }
  if(splitString[8]){
    address += splitString[8]+":";
  }
  if(splitString[9]){
    address += splitString[9];
  }
  
  return address;
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
      mouseOverNodeQTip = mouseOverNodeQTip.replace("$nodeid",(nodeData.id).substring(0,10));
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

  for (var index in connectedLinks){
    if(connectedLinks[index] == undefined){
    continue;
    }
    linkData = cy.getElementById(connectedLinks[index]).data();

    // to find peerName
    var peerName = cy.getElementById(linkData.target).data().Name;

    allLinkMetrics += "<section class='ipopNodeInfo' ><section class='linkID'  onclick='$(this).parent().find(\".InfoPanel\").toggleClass(\"sr-only\")'>"+(linkData.id).split("_")[0]+"</section>"+
    "<table class='table-ipnodeinfo InfoPanel sr-only'>"+
    "<tr><td>MAC</td><td>"+ linkData.MAC + "</td></tr>" +
    "<tr><td>Tap</td><td>"+ linkData.InterfaceName + "</td></tr>" +
    "<tr><td>Peer Name</td><td>"+ peerName + "</td></tr>" +
    "<tr><td>IceRole</td><td>"+ linkData.IceRole + "</td></tr>" +
    "<tr><td>Remote Address</td><td>"+ linkData.remote_candidate + "</td></tr>" +
    "<tr><td>Bytes Sent (Bs)</td><td>"+ linkData.sent_bytes_second + "</td></tr>" +
    "<tr><td>Total Bytes Sent (MB)</td><td>"+ linkData.sent_total_bytes + "</td></tr>" +
    "<tr><td>Writable</td><td>"+ linkData.writable + "</td></tr>" +
    "<tr><td>Local Address</td><td>"+ linkData.local_candidate + "</td></tr>" +
    "<tr><td>Bytes Received (Bs)</td><td>"+ linkData.recv_bytes_second + "</td></tr>" +
    "<tr><td>Total Bytes Received (MB)</td><td>"+ linkData.recv_total_bytes + "</td></tr>" +
    "<tr><td>Best Connection</td><td>"+ linkData.best_conn + "</td></tr>" +
    "<tr><td>New Connection</td><td>"+ linkData.new_conn + "</td></tr>" +
    "<tr><td>Timeout</td><td>"+ linkData.timeout + "</td></tr>" +
    "<tr><td>rtt</td><td>"+ linkData.rtt + "</td></tr>" +
    "</table>"+
    "</section>";
  }
  return allLinkMetrics;
}
