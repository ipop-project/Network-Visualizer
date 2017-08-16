var texttemplate = "<div id='text_element' class='textbox'><p><div class='heading'>Overview</div></p><table id='NodeDetails'><tr><td class='keyclass'>UID</td><td class='valueclass'>$ui</td></tr><tr><td class='keyclass'>Node Name</td><td class='valueclass'>$nodename</td></tr><tr><td class='keyclass'>IPOP IP</td><td class='valueclass'>$ipopip</td></tr><tr><td class='keyclass'>GEO IP</td><td class='valueclass'>$phyip</td></tr><tr><td class='keyclass'>State</td><td class='valueclass' id='text_element_state'>$state</td></tr><tr><td class='keyclass'>Location</td><td class='valueclass' id='text_element_location'>$location</td></tr></table><p><div class='heading'>Link Details</div></p><table id='Link_Details'><tr><td class='keyclass'>Chord</td><td class='valueclass' id='text_element_chord'>$chord</td></tr><tr><td class='keyclass'>Successor</td><td class='valueclass' id='text_element_successor'>$successor</td></tr><tr><td class='keyclass'>Ondemand</td><td class='valueclass' id='text_element_ondemand'>$ondemand</td></tr></table></div></div>";

var modaltemplate = "<div id='myModal' class='modal'><div id='myModal_content'class='modal-content'><span class='close' onclick='closemodal(event);'>x</span><p><H3>Node Details</H3></p><div id='myModal_table_content' style='display:block;'><table id='NodeDetails'><col style='width:30%'><col style='width:70%'><tr><td class='keyclass'>UID</td><td class='valueclass'>$ui</td></tr><tr><td class='keyclass'>Node Name</td><td class='valueclass'>$nodename</td></tr><tr><td class='keyclass'>IPOP IP</td><td class='valueclass'>$ipopip</td></tr><tr><td class='keyclass'>MAC Address</td><td class='valueclass'>$macaddress</td></tr><tr><td class='keyclass'>Geo IP</td><td class='valueclass'>$phyip</td></tr><tr><td class='keyclass'>State</td><td class='valueclass' id='myModal_state'>$state</td></tr><tr><td class='keyclass'>StartTime</td><td class='valueclass' id='text_element_starttime'>$starttime</td></tr><tr><td class='keyclass'>Location</td><td class='valueclass' id='text_element_location'>$location</td></tr></table><p><H3>Link Details</H3></p><table id='Link_Details'><tr><td class='keyclass'>Chord</td><td class='valueclass' id='myModal_chord'>$chord</td></tr><tr><td class='keyclass'>Successor</td><td class='valueclass' id='myModal_successor'>$successor</td></tr><tr><td class='keyclass'>Ondemand</td><td class='valueclass' id='myModal_ondemand'>$ondemand</td></tr></table></div><div id='managednode_topology_myModal' class='unmanagednodetopology'></div><input type='button' id='myModal_getunmanagednodes' onclick='getunmanagednodes(event);' value='Switch Topology' class='btn btn-default' style='background-color:grey;'><input type='button' id='myModal_back' onclick='back(event);' value='Back' class='btn btn-default' style='background-color:grey;display:none;' align='right'></div></div>";

var serverip = location.host;

// Flag to enable/disable subgraph node selection
var disableoldclick = false;

var diameter = Math.min(svg_width , svg_height),
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });

var lenofdata = 0;

var force = d3.layout.force();
var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("#topology").append("svg")
    .attr("width", svg_width)
    .attr("height", svg_height)
    .attr("id", "svg")
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

var nodes;

function buildnetworktopology()
{
    var interval;
    var nodelist = arguments[0];
    if (arguments.length>1)
    {
        interval = arguments[1];
        svg = d3.select("#topology_"+interval).append("svg")
                .attr("width", svg_width)
                .attr("height", svg_height)
                .append("g")
                .attr("transform", "translate(" + radius + "," + radius + ")");

    }
    nodes = cluster.nodes(packageHierarchy(nodelist)),
      links = connections(nodes);

  link  = svg.selectAll(".link").data(bundle(links));

  link.enter().append("path")
      .each(function(d) {

        var d_0_state = d[0]["state"],
            d_2_state = d[2]["state"];

        if (d_0_state=="stopped" || d_2_state=="stopped")
        {
          var pele = svg.selectAll(".link");
          pele[0].forEach(function(element,i)
          {
            if (element["id"].indexOf(d[0]["name"])!=-1 && d_0_state=="stopped")
              document.getElementById(element["id"]).style.display = "none";
            if (element["id"].indexOf(d[2]["name"])!=-1 && d_2_state=="stopped")
              document.getElementById(element["id"]).style.display = "none";
          });
        }

        d.source = d[0], d.target = d[d.length - 1]})
      .attr("class", "link")
      .attr("stroke",function(d){
        dest_name  = d[2].key;
        if (Object.keys(d[0]).indexOf("links")!=-1)
        {
          if (d[0].links.on_demand.indexOf(dest_name)!= -1)
            return "#333133";
          if (d[0].links.successor.indexOf(dest_name)!= -1)
            return "#4B4949";
          if (d[0].links.chord.indexOf(dest_name)!= -1)
            return "#333333";
        }

      })
      .attr("style", "display=block;")
      .attr("d", line)
    .attr("id", function(d)
    {
    dest_name  = d[2].key;
    if (Object.keys(d[0]).indexOf("links")!=-1)
    {
      var history_interval = "";
      if (Object.keys(d[0]).indexOf("interval")!=-1)
          history_interval = d[0]["interval"];
      if (d[0].links.on_demand.indexOf(dest_name)!= -1)
        return "on_demand_"+d[0].key+"_"+d[2].key+"_"+history_interval;
      if (d[0].links.successor.indexOf(dest_name)!= -1)
        return "successor_"+d[0].key+"_"+d[2].key+"_"+history_interval;
      if (d[0].links.chord.indexOf(dest_name)!= -1)
        return "chord_"+d[0].key+"_"+d[2].key+"_"+history_interval;
    }
    })
    .on("mouseover", linkmouseover)
    .on("mouseout", linkmouseout);

  node = svg.selectAll(".node").data(nodes.filter(function(n) { return !n.children; }));
  node1 = svg.selectAll(".node").data(nodes.filter(function(n) { return !n.children; }));
  node.enter().append("circle")
      .attr("class", "node")
      .attr("fill", function(d){
        if (d["state"] == "connected")
          return "green";
        if (d["state"] == "searching")
          return "yellow";
        if (d["state"] == "connecting")
          return "orange";
        if (d["state"] == "started")
          return "steelblue";
        return "red";
      })
      .attr("dy", ".31em")
      .attr("r", "10")
      .attr("transform", function(d) {
        return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted)
      .on("click", mouseclick);

  node1.enter().append("text")
      .attr("fill", "black")
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 28) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.node_name; });

   link.exit().remove();
   node.exit().remove();
   node1.exit().remove();

}


function linktype(source_keys,dest_name,ltype,torf,d)
{
    var history_interval = "";
    if (Object.keys(d[0]).indexOf("interval")!=-1)
          history_interval = d[0]["interval"];
	if (source_keys.indexOf(ltype) != -1)
	{
		if (d[0].links[ltype].indexOf(dest_name)!= -1)
			d3.selectAll("#"+ltype+"_"+d[0].key+"_"+d[2].key+"_"+history_interval).classed(ltype,torf);
	}
}

function linkmouseover(d)
{
  dest_name  = d[2].key;
  if (Object.keys(d[0]).indexOf("links")!=-1)
  {
    source_keys = Object.keys(d[0].links);
  	linktype(source_keys,dest_name,"on_demand",true,d);
  	linktype(source_keys,dest_name,"successor",true,d);
  	linktype(source_keys,dest_name,"chord",true,d);
  }
}

function linkmouseout(d)
{
      dest_name  = d[2].key;
      if (Object.keys(d[0]).indexOf("links")!=-1)
      {
        source_keys = Object.keys(d[0].links);
        linktype(source_keys,dest_name,"on_demand",false,d);
        linktype(source_keys,dest_name,"successor",false,d);
        linktype(source_keys,dest_name,"chord",false,d);
      }
}

function mouseovered(d) {
  setText(d);
  node
      .each(function(n) { n.target = n.source = false; });
  link[0]
      .forEach(function(l) {
    l = l["__data__"]
    if (l[0].key == d.name || l[2].key == d.name)
  	{
        dest_name  = l[2].key;
        if ( Object.keys(l[0]).indexOf("links")!=-1)
        {
            source_keys = Object.keys(l[0].links);
        	  linktype(source_keys,dest_name,"on_demand",true,l);
        	  linktype(source_keys,dest_name,"successor",true,l);
        	  linktype(source_keys,dest_name,"chord",true,l);
        }
    }
    });
  node
      .classed("node--target", function(n) { return n.target; })
      .classed("node--source", function(n) { return n.source; });
}

function mouseclick(d)
{
  var history_interval = "";
  if (Object.keys(d).indexOf("interval")!=-1)
      history_interval = d["interval"];

  var element = d["name"]+"_"+history_interval;

  if (disableoldclick == false)
  {
    if(document.getElementById(element+"_modal")==null)
    {
      $('#ModalDetails').append(setModalText(d,"new"));
      document.getElementById(element+"_modal").style.display = "block";
    }
    else
    {
      if (document.getElementById(element+"_modal").style.display == "none")
      {
        setModalText(d,"old");
        document.getElementById(element+"_modal").style.display = "block";
      }
      else
        document.getElementById(element+"_modal").style.display = "none";
    }
  }
  else
  {
      if (subgraphNodeDetails.indexOf(d["name"])==-1)
      {
        subgraphNodeDetails.push(d["name"]);
        subgraphNodeNameDetails.push(d["node_name"]);
      }
      document.getElementById("nodedisplaytext").setAttribute("value",subgraphNodeNameDetails.join());
  }
}

function mouseouted(d) {
  link[0]
      .forEach(function(l) {
    l = l["__data__"]
    if (l[0].key == d.name || l[2].key == d.name)
    {
        dest_name  = l[2].key;
        if ( Object.keys(l[0]).indexOf("links")!=-1)
        {
            source_keys = Object.keys(l[0].links);
            linktype(source_keys,dest_name,"on_demand",false,l);
            linktype(source_keys,dest_name,"successor",false,l);
            linktype(source_keys,dest_name,"chord",false,l);
        }
    }
    });

  node
      .classed("node--target", false)
      .classed("node--source", false);

  var history_interval = "";
  if (Object.keys(d).indexOf("interval")!=-1)
      history_interval = d["interval"];

  var modalElement = document.getElementById("text_"+d["name"]+"_"+history_interval);
  modalElement.style.display = "none";
}

d3.select(self.frameElement).style("height", diameter + "px");

function packageHierarchy() {
  var map = {};
  var classes = arguments[0];
  function find(name, data) {

    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
}

// Return a list of imports for the given array of nodes.
function connections() {
  var map = {},
  conns = [];
  var elenodes = arguments[0];

  // Compute a map from name to node.
  elenodes.forEach(function(d) {
    map[d.name] = d;
  });

  elenodes.forEach(function(d) {
    if (Object.keys(d).indexOf("links")!=-1)
    {
        if (d.links.successor) d.links.successor.forEach(function(i) {
          conns.push({source: map[d.name], target: map[i],"type":"successor"});
        });
    	if (d.links.on_demand) d.links.on_demand.forEach(function(i) {
          conns.push({source: map[d.name], target: map[i],"type":"ondemand"});
        });
    	if (d.links.chord) d.links.chord.forEach(function(i) {
        if (d.links.successor.indexOf(map[i]["name"])==-1)
          conns.push({source: map[d.name], target: map[i],"type":"chord"});
        });
    }
  });
  return conns;
}



function setText(d)
{
  var history_interval = "";
  if (Object.keys(d).indexOf("interval")!=-1)
      history_interval = d["interval"];
  var circle  = d;
  var state="";
  var uptime= "";
  var element = circle["name"]+"_"+history_interval;
  state = state + circle["state"];
  var temptime = circle["starttime"];
  temptime = new Date(temptime*1000);

  if (document.getElementById("text_"+element)==null)
  {
    var textele = texttemplate;
    textele = textele.replace(/text_element/g,"text_"+element);
    textele = textele.replace("$nodename",circle["node_name"]);
    textele = textele.replace("$ui",circle["uid"].substring(0,10));
    textele = textele.replace("$ipopip",circle["ip4"]);
    textele = textele.replace("$phyip",circle["GeoIP"]);
    uptime = uptime + temptime.toString();
    textele = textele.replace("$starttime",uptime);
    textele = textele.replace("$successor",countById(element,"successor"));
    textele = textele.replace("$ondemand",countById(element,"on_demand"));
    textele = textele.replace("$chord",countById(element,"chord"));
    var location="";
    if (circle["GeoIP"] != " " && Object.keys(circle).indexOf("location")!=-1)
        location = circle["location"]["city"]+", "+circle["location"]["region"]+", "+circle["location"]["country"];
    textele = textele.replace("$state",state);
    textele = textele.replace("$location",location);
    $("#NodeDetails").append(textele);
  }
  else
  {
    document.getElementById("text_"+element+"_successor").innerHTML   = countById(element,"successor");
    document.getElementById("text_"+element+"_ondemand").innerHTML  = countById(element,"on_demand");
    document.getElementById("text_"+element+"_chord").innerHTML     = countById(element,"chord");
    document.getElementById("text_"+element+"_state").innerHTML     = state;
    document.getElementById("text_"+element).style.display = "block";
  }
}

function countById(id,type)
{
  var nodeuid = id.split("_")[0],
      history_interval = id.split("_")[1];

  var pathele = "",i=0;
  if (history_interval=="")
      pathele = $("#topology").find("path");
  else
      pathele = $("#topology_"+history_interval).find("path");
  var noOfElements = pathele["length"];
  pathele = Object.values(pathele)

  var count=0;
  var elementconns = [];

  for(;i<noOfElements;i++){
        var element_id = pathele[i]["id"].split("_");
        if(id=="*"&&(element_id[0].includes(type)==true))
          count++;
        else
        {
              if (type == "successor")
              {
                  if((element_id[2].includes(nodeuid)==true)&&(element_id[0].includes(type)==true))
                      count++;
              }
              else
              {
                  if((element_id[2].includes(nodeuid)==true)&&(element_id[0].includes(type)==true))
                      count++;
                  else if (element_id[1].includes(nodeuid)==true &&(element_id[0].includes(type)==true))
                    count++;
              }
        }
  }
  return count;
}

function setModalText(d,type)
{
  var circle  = d;
  var state="";
  var uptime= "";
  var history_interval = "";
  if (Object.keys(d).indexOf("interval")!=-1)
      history_interval = d["interval"];

  var element  = circle["name"]+"_"+history_interval;
  state = state + circle["state"];
  var temptime = circle["starttime"];
  temptime = new Date(temptime*1000);

  var macuidmappingstr = "<p id='"+element+"_modal_maccontent'"+"><H3>Peer List</H3><table id='macidmapping'><tr><th width='15%'>Node Name</th><th width='30%' align='center'>Unique ID</th><th width='50%'> MAC Details</th></tr>";
  for (obj in circle["macuidmapping"])
  {
    var i;
    for (i=0;i<node[0].length;i++)
    {
      if (obj == node[0][i]["__data__"]["key"])
        macuidmappingstr = macuidmappingstr+ "<tr><td>"+node[0][i]["__data__"]["node_name"]+"</td><td>"+obj.substring(0,10)+"</td><td>"+circle["macuidmapping"][obj].join()+"</td></tr>";
    }
  }
  macuidmappingstr = macuidmappingstr+"</table></p>"

  if (type=="new")
  {
    var modalele = modaltemplate;
    modalele = modalele.replace(/myModal/g,element+"_modal");
    modalele = modalele.replace("$nodename",circle["node_name"]);
    modalele = modalele.replace("$ui",circle["uid"]);
    modalele = modalele.replace("$ipopip",circle["ip4"]);
    modalele = modalele.replace("$phyip",circle["GeoIP"]);
    uptime = uptime + temptime.toString();
    var location="";
    if (circle["GeoIP"] != " " && Object.keys(circle).indexOf("location")!=-1)
        location = circle["location"]["city"]+", "+circle["location"]["region"]+", "+circle["location"]["country"];
    modalele = modalele.replace("$starttime",uptime);
    modalele = modalele.replace("$location",location);
    modalele = modalele.replace("$macaddress",circle["mac"]);
    modalele = modalele.replace("$successor",countById(element,"successor"));
    modalele = modalele.replace("$ondemand",countById(element,"on_demand"));
    modalele = modalele.replace("$chord",countById(element,"chord"));
    modalele = modalele.replace("$state",state);
    //modalele = modalele.replace("$MACUIDMAP",macuidmappingstr);
    return modalele;
  }
  else
  {
    document.getElementById(element+"_modal_successor").innerHTML   = countById(element,"successor");
    document.getElementById(element+"_modal_ondemand").innerHTML  = countById(element,"on_demand");
    document.getElementById(element+"_modal_chord").innerHTML     = countById(element,"chord");
    document.getElementById(element+"_modal_state").innerHTML     = state;
    //$('#'+element+"_modal_maccontent").remove();
    //$('#'+element+"_modal_maccontent").append(macuidmappingstr);
  }
}

function closemodal(event)
{
    var node_id = event.target.parentNode.id;
    var element = node_id.substring(0,node_id.indexOf("_modal_content"));
    document.getElementById(element+"_modal").style.display = "none";
}


function buildmanagednodetopology()
{
    var nodedatas = arguments[0], eleuid = arguments[1];
    var innerRadiusManagedTopology, h_interval = arguments[2];

    if (h_interval=="")
        innerRadiusManagedTopology = innerRadius -100;
    else
        innerRadiusManagedTopology = innerRadius;

    var managednodecluster = d3.layout.cluster()
    .size([360, innerRadiusManagedTopology])
    .sort(null)
    .value(function(d) { return d.size; });

    if (nodedatas["response"].length == 0)
        return;

    var managednodes = managednodecluster.nodes(packageHierarchy(nodedatas["response"]));
    var managedlinks = connections(managednodes);

    var managednode_svg = d3.select("#managednode_topology_"+eleuid+"_modal").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    var managedlink  = managednode_svg.selectAll(".link").data(bundle(managedlinks));
    managedlink.enter().append("path")
        .each(function(d) {
        d.source = d[0], d.target = d[d.length - 1]})
        .attr("class", "link")
        .attr("style", "display=block;")
        .attr("d", line)
        .attr("stroke","grey");

    var managednode = managednode_svg.selectAll(".node").data(managednodes.filter(function(n) { return !n.children; }));
    var managednodetext = managednode_svg.selectAll(".node").data(managednodes.filter(function(n) { return !n.children; }));

    managednode.enter().append("circle")
          .attr("class", "node")
          .attr("fill", "green")
          .attr("dy", ".31em")
            .attr("r", "10")
          .attr("transform", function(d) {
            return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
          .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; });

    managednodetext.enter().append("text")
      .attr("fill", "black")
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 28) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.name; });

    managednodetext.exit().remove();
    managedlink.exit().remove();
    managednode.exit().remove();

    document.getElementById(eleuid+"_modal_table_content").style.display = "none";
    document.getElementById(eleuid+"_modal_back").style.display = "block";
    document.getElementById(eleuid+"_modal_getunmanagednodes").style.display = "none";
}


function getunmanagednodes(event)
{
    var node_id = event.target.parentNode.id;
    var nodedetails = node_id.substring(0,node_id.indexOf("_modal_content"));
    var nodeuid = nodedetails.split("_")[0],
        history_interval = nodedetails.split("_")[1];
    var node_topology = document.getElementById("managednode_topology_"+nodedetails+"_modal");

    if (node_topology.style.display == "")
    {
        // nodedetaillist contains current state. transform to switch topology
        if (history_interval=="")
            nodedetaillist = $("#topology").find("circle");
        else
            nodedetaillist = $("#topology_"+history_interval).find("circle");
        var noOfElements = nodedetaillist["length"],i=0;
        nodedetaillist = Object.values(nodedetaillist);
        var switchnode = {"links":{}}
        for (;i<noOfElements;i++) {
            if(nodedetaillist[i]["__data__"]["uid"] == nodeuid) {
                switchnode["name"] = nodedetaillist[i]["__data__"]["ip4"];
                switchnode["links"]["successor"] = nodedetaillist[i]["__data__"]["unmanagednodelist"];
                break;
            }
        }
        if(switchnode["links"]["successor"].length > 0) {
            linknodes = [];
            switchnode["links"]["successor"].forEach(function(unmanlinknode) {
                linknodes.push({"name":unmanlinknode, "links":{"successor":[switchnode["name"]]}});
            });
            linknodes.push(switchnode);
            buildmanagednodetopology({"response":linknodes}, nodedetails,history_interval);
        }
    }
    else
    {
        node_topology.style.display ="block";
        document.getElementById(nodedetails+"_modal_table_content").style.display = "none";
        document.getElementById(nodedetails+"_modal_back").style.display = "block";
        document.getElementById(nodedetails+"_modal_getunmanagednodes").style.display = "none";
    }
}

function back(event)
{
    var node_id = event.target.parentNode.id;
    var nodeuid = node_id.substring(0,node_id.indexOf("_modal_content"))
    document.getElementById(nodeuid+"_modal_table_content").style.display = "block";
    document.getElementById(nodeuid+"_modal_getunmanagednodes").style.display = "block";
    document.getElementById(nodeuid+"_modal_back").style.display = "none";
    document.getElementById("managednode_topology_"+nodeuid+"_modal").style.display = "none";
}
