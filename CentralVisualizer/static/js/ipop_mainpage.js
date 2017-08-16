// Calling nodedata webservice on HTML window load
window.onload = function() {
        callWebservice();
    }
var svg_width = 960,svg_height = 960;
// Variables to store subgraph node UID and name
var subgraphNodeDetails = [], subgraphNodeNameDetails = [];

var subgraphcount = 0,windowcount =0;

// Variable to store retrieved state of nodes (either current or history)
var nodedetaillist = [];

// Invokes nodedata webservice and builds the network topology
function callWebservice(){

d3.json("http://"+serverip+"/nodedata", function(error, data) {
  if (error) throw error;

  nodedetaillist = data["response"]["runningnodes"];

  // Get initial length of nodedetails (required for reload of page)
  if (lenofdata==0) lenofdata = nodedetaillist.length;

  // Check if a single node is in running state else return
  if (data["response"]["runningnodes"].length ==0)
  {
    setStoppedNodes(data["response"]["stoppednodes"]);
    return;
  }

  // Invokes function in common javascript module to build complete network topology
  buildnetworktopology(nodedetaillist);

  // Reload the page in the event of new node entering/leaving the network
  if (lenofdata !=node[0].length)
      location.reload();

  // Invokes function that populates all stop nodes in the dropdownlist
  setStoppedNodes(data["response"]["stoppednodes"]);
});
}

// Function to enable the type of link
function enableLink(event) {
  var link_type = event.target.innerHTML;
  if (link_type=="ondemand")
    link_type="on_demand";

  var pathele = svg.selectAll(".link");

  pathele[0].forEach(function(element,i)
  {
    var element_id = element["id"];
    if(link_type=="All")
      element["style"]["display"]="block";
    else if(element_id.includes(link_type)==false)
      element["style"]["display"]="none";
    else
      element["style"]["display"]="block";
  });
}


function getsubgraph(event)
{
  disableoldclick = true;
  document.getElementById("resetgraphstate").style.display = "block";
  document.getElementById("getgraphstate").style.display = "none";
  document.getElementById("nodedisplaytext").style.display = "block";
}

function resetgraph(event)
{
  disableoldclick = false;
  localStorage.setItem("subgraphelements", subgraphNodeDetails.toString());
  document.getElementById("nodedisplaytext").setAttribute("value","");
  document.getElementById("resetgraphstate").style.display = "none";
  document.getElementById("nodedisplaytext").style.display = "none";
  document.getElementById("getgraphstate").style.display = "block";
  window.open("http://"+serverip+"/subgraphtemplate", "SubGraph"+subgraphcount, "width=500,height=500");
  //window.open("http://"+serverip+":8080/subgraphdetails?"+subgraphNodeDetails.toString(), "SubGraph"+subgraphcount, "width=500,height=500");
  subgraphcount+=1;
  subgraphNodeDetails.length=0;
  subgraphNodeNameDetails.length=0;
}


function setStoppedNodes(nodeList)
{
    for (ele in nodeList){
      if (document.getElementById(nodeList[ele]) == null)
          $("#stoppednodes").append("<li id = '"+nodeList[ele]+"'><a href='#'>"+nodeList[ele]+"</a></li>");
    }
    var childNodeList  = document.getElementById("stoppednodes").childNodes;
    var i;
    for (i=0;i<childNodeList.length;i++)
    {
        var elementId = childNodeList[i].id;
        if (nodeList.indexOf(elementId)==-1)
        {
           var el = document.getElementById(elementId);
           el.parentNode.removeChild(el);
        }
    }
}

function getHistory(event,type)
{
   var histtime = document.getElementById("hist-time").value;
   var end_time = new Date(histtime.replace(/-/g,'/').replace('T',' '));

   localStorage.setItem("endtime", end_time.getTime());
   window.open("http://"+serverip+"/History/getTopologySnapshot", "Snapshot"+windowcount, "width=1000,height=600");
   windowcount+=1;

}

function show(event,type)
{
    if (document.getElementById(type).style.display == "none")
    {
        document.getElementById(type).style.display = "block";
        event.target.innerHTML = '- ';
        if (document.getElementById("hour") == null)
        {
            $("#history").append("<datalist id='$id'></datalist>".replace("$id","hour"))
            loadoptions("hour",1,12)
        }
        if (document.getElementById("minutes") == null)
        {
            $("#history").append("<datalist id='$id'></datalist>".replace("$id","minutes"))
            loadoptions("minutes",0,59)
        }
    }
    else
    {
        document.getElementById(type).style.display = "none";
        event.target.innerHTML = '+ ';
    }
}
var optionstemplate = "<option>$item</option>"
function loadoptions(id,minvalue,maxvalue)
{
     var i=minvalue;
     for (;i<=maxvalue;i++)
     {
        $("#"+id).append(optionstemplate.replace("$item",i))
     }
}

setInterval(callWebservice,7500);
