var divhistorytemplate = "<div id='topology_$interval' class='topology'></div>";
var spanhistorytemplate ="<span class='dot' id='span_time_interval' onclick='loadinterval(event,time_interval)' onmouseover='displayinterval(event,time_interval)' onmouseout='displayinterval(event,time_interval)'><div class='intervaldesc' style='display:none;'>$formatinterval</span>";
var svg_width = 700,svg_height = 550;
var enableinterval;
var nodedetaillist = [];
window.onload = function() {
        callWebservice();
    }

var serverip = location.host;
function callWebservice()
{
  $.ajax({
            type: "GET",
            method: "GET",
            url: "http://"+serverip+"/History/getTopologySnapshotData",
            contentType: "application/text",
            datatype:"text",
            data: {
                   "endtime":localStorage.getItem("endtime")
                  },
            crossDomain:true,
            timeout : 5000,
            success : function(data)
            {
              buildpage(data);
            },
            error: function(data)
            {
              alert("IPOP Webservice is down!! Please check after sometime..");
              console.log(data);
            }
        });
}
function buildpage(data)
{
    var topologyhistory = data["response"]
    var error = data["error"]
    if ("error_msg" in error)
    {
        errmsg = error["error_msg"];
        if ("error_time" in error) {
            temptime = new Date(error["error_time"]*1000);
            errmsg += ' ' + temptime.toString();
        }
        alert(errmsg);
        return;
    }
    if (Object.keys(topologyhistory).length == 0)
        return;
    for (var ival in topologyhistory)
    {

        if (document.getElementById("topology_"+ival) == null){
            var divid = divhistorytemplate.replace("$interval",ival);
            $("#topology").append(divid);
            buildnetworktopology(topologyhistory[ival],ival);
            document.getElementById("topology_"+ival).style.display = "none";
            var spanid = spanhistorytemplate.replace(/time_interval/g,ival);
            spanid = spanid.replace("$formatinterval",(new Date(parseInt(ival))).toLocaleTimeString());
            $("#interval").append(spanid);
            $("#svg").remove();
        }
    }
    var recent_history_interval = Object.keys(topologyhistory).reverse()[0];
    enableinterval = recent_history_interval;
    document.getElementById("topology_"+recent_history_interval).style.display = "block";
}

function loadinterval(event,history_interval)
{
    if (enableinterval != history_interval)
    {
        document.getElementById("topology_"+history_interval).style.display = "block";
        document.getElementById("topology_"+enableinterval).style.display = "none";
        enableinterval = history_interval;
    }
}

function displayinterval(event, intrval)
{
    if (event.type == "mouseover")
        $("#span_"+intrval).children(".intervaldesc").show();
    else
        $("#span_"+intrval).children(".intervaldesc").hide();
}
