var subgraphNodeDetails = "";
var svg_width = 960,svg_height = 800;
window.onload = function() {
        callWebservice();
    }

var serverip = location.host;
var nodedetaillist;
function callWebservice()
{
  subgraphNodeDetails = localStorage.getItem("subgraphelements");
  $.ajax({
            type: "GET",
            method: "GET",
            url: "http://"+serverip+"/subgraph",
            contentType: "application/text",
            datatype:"text",
            data: subgraphNodeDetails,
            crossDomain:true,
            timeout : 5000,
            success : function(data)
            {
              makePage(data);
            },
            error: function(data)
            {
              alert("IPOP Webservice is down!! Please check after sometime..");
              console.log(data);
            }
        });
}

function makePage(data,state) {
  nodedetaillist = data["response"];
  if (lenofdata==0)
    lenofdata = nodedetaillist.length;

  buildnetworktopology(nodedetaillist);

  if (lenofdata !=nodedetaillist.length)
      location.reload();
}

setInterval(callWebservice,7500);
