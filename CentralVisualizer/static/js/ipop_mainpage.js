// Calling nodedata webservice on HTML window load
window.onload = function() {
        callWebservice();
    }

// Variable to store retrieved state of nodes (either current or history)
var nodedetaillist = [];

// Invokes nodedata webservice and builds the network topology
function callWebservice(){
  $.getJSON("http://"+serverip+"/nodedata", function(data,status) {
  if (status == "error") throw error;

  nodedetaillist = data["response"]["runningnodes"];

  // Get initial length of nodedetails (required for reload of page)
  if (lenofdata==0) lenofdata = nodedetaillist.length;

  // Invokes function in common javascript module to build complete network topology
  buildnetworktopology(nodedetaillist);

  // Reload the page in the event of new node entering/leaving the network
  if (lenofdata != nodedetaillist.length)
      location.reload();
  });
}

$('#config-toggle').on('click', function(){ $('body').toggleClass('config-closed'); });

$refresh = '<i id="refreshbtn" class="fa fa-refresh btn btn-default"></i>';
$collapsible='<div class="panel-group" id="switchTopologyDpDwn"><div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" href="#collapse1">Switch Topology </a></h4></div><div id="collapse1" class="panel-collapse collapse"><div class="panel-body">GroupVPN</div><div class="panel-body">SocialVPN</div></div></div></div>';

$('#config').append($collapsible);
$('#config').append($refresh);

$('#refreshbtn').on('click', function() { 
  cy.makeLayout({name: 'circle'}).run()
});

$('#refreshbtn').qtip({
  content: 'Reset',
  position: {
      my: 'top center',
      at: 'bottom center'
      },
  style: {
      classes: 'qtip-bootstrap',  
      }}); 

$form='<form id="inputForm" action="/IPOP" method="POST"><input class="numberBox" type="number" min="1" name="NoOfNodes"><label for="POST-name">&emsp;No. of Nodes</label><br><input class="numberBox" type="number" min="0" name="successor"><label for="POST-name">&emsp;Successor</label><br><input class="numberBox" type="number" min="0" name="chord"><label for="POST-name">&emsp;Chord</label><br><input class="numberBox" type="number" min="0" name="on_demand"><label for="POST-name">&emsp;On-Demand</label><br><br><input type="submit" id="sendbtn" name="user-input" class="btn btn-default" value="Submit"></form>';
$('#config').append($form);

$fontSlider = '<br><label>&ensp;Node Label Sizing</label><br><input id="fontSlider" type="range" min="0.5" max="8.5" value="1.5" step:"0.5" onchange="changeNodeLabelSize(this.value)" />';
$('#config').append($fontSlider);

$zoomSlider = '<br><label>&ensp;Layout Zoom</label><br><input id="zoomSlider" type="range" min="1" max="31" value="11" step:"2" onchange="changeLayoutZoom(this.value)" />';
$('#config').append($zoomSlider);

function changeNodeLabelSize(newValue){
  cy.style()
    .selector('node')
    .style({'font-size':newValue+'em'})
    .update();
}  

function changeLayoutZoom(newValue) {
  cy.zoom(newValue/10);
}

setInterval(callWebservice,7500);
