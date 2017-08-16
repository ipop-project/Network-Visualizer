var nodedetaillist;
var svg_width = 960,svg_height = 960;
function makePage(data,state) {
  nodedetaillist = JSON.parse(data);
  if (lenofdata==0)
    lenofdata = nodedetaillist.length;
  buildnetworktopology(nodedetaillist);
}







