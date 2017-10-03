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

  // Invokes function in common javascript module to build complete network topology
  buildnetworktopology(nodedetaillist);

  });
}

$('#config-toggle').on('click', function(){ $('body').toggleClass('config-closed'); });

$refresh = '<i id="refreshbtn" class="fa fa-refresh btn btn-default"></i>';
$('#config').append($refresh);

$('#refreshbtn').on('click', function() { 
  cy.remove(cy.edges());
  cy.remove(cy.nodes());
  callWebservice();
});

$('#refreshbtn').qtip({
  content: 'Reset',
  style: {
      classes: 'qtip-bootstrap',  
      }
  }); 

$fontSlider = '<br><label>&ensp;Node Label Sizing</label><br><input id="fontSlider" type="range" min="0.5" max="8.5" value="1.5" step:"0.5" onchange="changeNodeLabelSize(this.value)" />';
$('#config').append($fontSlider);

$zoomLimits = '<br><label>Layout Zoom Limits</label><br><label>minZoom</label><select class="form-control" onchange="changeLayoutZoomLimits(this.value,this.id)"><option>0.1</option><option>0.2</option><option>0.3</option><option>0.4</option><option>0.5</option><option>0.6</option><option>0.7</option></select><br><label>maxZoom</label><select class="form-control" onchange="changeLayoutZoomLimits(this.value,this.id)"><option>2</option><option>2.5</option><option>3</option><option>3.5</option><option>4</option><option>4.5</option><option>5</option></select>';
$('#config').append($zoomLimits);

function changeNodeLabelSize(newValue){
  cy.style()
    .selector('node')
    .style({'font-size':newValue+'em'})
    .update();
}  

function changeLayoutZoomLimits(newValue,id) {
  if(id=="maxzoom"){
    cy.maxZoom(newValue/1);
  }
  else if(id=="minzoom"){
    cy.minZoom(newValue/1);
  }
}

//setInterval(callWebservice,7500);