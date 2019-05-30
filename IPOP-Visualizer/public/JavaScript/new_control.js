
// $('#toggle:checkbox').change(function () {
//     if (this.checked) {
//         requestIPOPData();
//     } else {
//     //   testGeo();
//     }
//   });


requestIPOPData();

/* request data from server */
async function requestIPOPData() {

    let query;
    try {
        await $.get(`/newData?${query}`, data => {
            var ipopObj = new BuildIPOPData();

            ipopObj.setData(data.ipop);

            $(document).ready(function () {
                $("#overlayShowUp").load("/icons.html", function (responseTxt, statusTxt, xhr) {
                    if (statusTxt == "success") {
                        $('#overLayID').show();
                        $('#overLayID').html('Overlay: <strong>' + ipopObj.getOverlayID() + '</strong>');
                        $('#travel').hide();
                    } else {
                        alert("Error: " + xhr.status + ": " + xhr.statusText);
                    }
                });
            });

            createGraph(ipopObj);
        });

    } catch (error) {
        alert("Error: Can not get Data");
    }
}


/* create graph */
var createGraph = function (ipopObj) {

    let nodeList = [];
    let linkList = [];
    for (var i = 0; i < ipopObj.getNumNodes(); i++) {

        var nodeID = ipopObj.getNodeIDList()[i];
        var jsonStr = '{ "data": { "id": "' + nodeID + '" },"grabbable": false,"selectable": true}';
        var linkIDList = ipopObj.getLinkIDListOf(nodeID);

        linkIDList.forEach((linkID) => {
            var tgtNodeID = ipopObj.getLinkListOf(nodeID)[linkID]["TgtNodeId"];
            var srcNodeID = ipopObj.getLinkListOf(nodeID)[linkID]["SrcNodeId"];
            //alert("src "+ srcNodeID + " tgt "+ tgtNodeID + "link: " +linkID);

            if (ipopObj.getNodeIDList().includes(tgtNodeID)) {
                var linkStr = '{ "data": { "id": "' + linkID + '", "source": "' + srcNodeID + '", "target": "' + tgtNodeID + '" } }'
                linkList.push(JSON.parse(linkStr));
            }

        });

        nodeList.push(JSON.parse(jsonStr));
    }

    var cy = window.cy = cytoscape({
        container: document.getElementById('cy'),

        style: [
            {
                selector: 'node',
                style: {
                    // 'content': 'data(id)'
                    width: 36.37,
                    height: 36.37,
                    "background-color": "#9FC556"
                }

            }, {
                selector: "node:selected",
                style: {
                    width: 36.37,
                    height: 36.37,
                    "border-width": "72.67",
                    "border-color": "#56C5BC",
                    "border-opacity": "0.3",
                    "background-color": "#9FC556"
                }
            },
            {
                selector: 'edge',
                style: {
                    'curve-style': 'haystack',
                    'z-index': "999999",
                    "line-color": "#56C5BC",
                }
            }, {
                selector: "edge:selected",
                style: {
                    'width': 10,
                    "line-color": "#56C5BC"
                }
            }

        ],

        elements: {
            nodes: nodeList,
            edges: linkList
        },

        layout: {
            name: 'circle',
        }
    });

    /* node Tippy */
    var count = 1;
    var placement = 'right';
    var tippyList = {};


    ipopObj.getNodeIDList().forEach((nodeID) => {

        var halfOflist = Math.ceil(ipopObj.getNodeIDList().length / 2) + 1;

        if (count == 1) {
            placement = 'top';
        } else if (count == halfOflist) {
            placement = 'left'; // actully it should be bottom
        } else if (count > halfOflist) {
            placement = 'left';
        } else {
            placement = 'right';
        }

        let nodeName = ipopObj.getNodeList()[nodeID]["NodeName"];
        let nodeI = cy.getElementById(nodeID);
        let tippyID = makeTippy(nodeI, nodeName, placement, false, 'node');
        tippyList[nodeID] = tippyID;

        tippyID.show();
        count++;
    });

    /* handdling any event when user mouseover on node */
    mouseOverEvent(ipopObj, cy);

    /* handdling any event when user click element on graph */
    clickEvent(ipopObj, cy, tippyList);

}


/* draw color when select node */
var nodeSelect = function (cy, objID, ipopObj) {
    cy.style().selector('node').style({ width: 20, height: 20, 'background-color': '#4B6483' }).update();
    cy.style().selector('edge').style({ 'curve-style': 'haystack', 'line-color': '#4B6483', 'z-index': "0" }).update();
    cy.style().selector('node[id=\"' + objID + '\"]').style({ width: 36.37, height: 36.37, "background-color": "#9FC556" }).update();

    ipopObj.getLinkIDListOf(objID).forEach((linkID) => {
        tID = cy.edges('[id = "' + linkID + '"]').data("target");
        if (tID == objID) {
            tID = cy.edges('[id = "' + linkID + '"]').data("source");
        }
        cy.style().selector('node[id=\"' + tID + '\"]').style({ width: 36.37, height: 36.37, "background-color": "#9FC556" }).update();
        cy.style().selector('edge[id=\"' + linkID + '\"]').style({ 'curve-style': 'haystack', 'line-color': '#56C5BC', 'z-index': "999999999" }).update();
    })

};


/* draw color when select edge */
var edgeSelect = function (cy, objID, sourceID, targetID) {
    cy.style().selector('node').style({ width: 20, height: 20, 'background-color': '#4B6483' }).update();
    cy.style().selector('edge').style({ 'curve-style': 'haystack', 'line-color': '#4B6483', 'z-index': "0" }).update();
    cy.style().selector('node[id=\"' + sourceID + '\"]').style({ width: 36.37, height: 36.37, "background-color": "#9FC556" }).update();
    cy.style().selector('node[id=\"' + targetID + '\"]').style({ width: 36.37, height: 36.37, "background-color": "#9FC556" }).update();
    cy.style().selector('edge[id=\"' + objID + '\"]').style({ 'curve-style': 'haystack', 'line-color': '#56C5BC', 'z-index': "999999" }).update();
};



var makeTippy = function (node, text, placement, isHide, theme) {
    return tippy(node.popperRef(), {
        content: function () {
            var div = document.createElement('div');
            div.innerHTML = text;
            div.style.cssText = '';
            return div;
        },
        trigger: 'manual',
        arrow: true,
        placement: placement,
        hideOnClick: isHide,
        multiple: true,
        sticky: true,
        size: "large",
        theme: theme,
        duration: [0, 0]
    });
};


var makeTippyNodeData = function (node, theme, htmlEle) {
    return tippy(node.popperRef(), {
        content: function () {
            return htmlEle;
        },
        trigger: 'manual',
        arrow: true,
        multiple: true,
        sticky: true,
        size: "large",
        theme: theme,
        zIndex: 1000000
    });
};

var currentNodeDataAdding = function (nodeName, ipopObj, objID) {
    $("#nodeName").html(nodeName);

    let topic = ["Node ID", "State", "Location"];
    let data = [];

    data.push(objID.substr(0, 7));
    data.push("Connected");
    data.push("Gaineville, FL");



    htmlContent = "";
    let index = 0;
    topic.forEach((content => {
        htmlContent = htmlContent + '<p class="topic">' + content + '</p>';
        htmlContent = htmlContent + '<p class="data">' + data[index] + '</p>';
        index++;
    }))
    $("#node1").html(htmlContent);
}


var ortherNodeDataAdding = function (ipopObj, objID) {

    var linkIDList = ipopObj.getLinkIDListOf(objID);
    var tgtLinkIDList = [];
    var tgtNodeNameList = [];
    var tgtNodeIDList = [];

    linkIDList.forEach((linkID) => {
        var tgtNodeID = ipopObj.getLinkListOf(objID)[linkID]["TgtNodeId"];

        if (ipopObj.getNodeIDList().includes(tgtNodeID)) {
            tgtNodeNameList.push(ipopObj.getNodeList()[tgtNodeID]["NodeName"]);
            tgtNodeIDList.push(tgtNodeID);
            tgtLinkIDList.push(linkID);
        }

    });

    $("#connectedCount").html("Connected Node(" + tgtLinkIDList.length + ")");

    $.get("/ortherNodeDetail.html", function (data) {
        for (let index = 0; index < tgtNodeNameList.length; index++) {

            if (index == 0) {
                $("#warpper").html(data);
            } else {
                $("#warpper").append(data);
            }

            $('#card2_show').attr('id', 'show' + index);
            $('#card2_hide').attr('id', 'hide' + index);
            $('#showName').attr('id', 'showName' + index);
            $('#hideName').attr('id', 'hideName' + index);
            $('#otherNodeData').attr('id', 'otherNodeData' + index);
            $('#sentData').attr('id', 'sentData' + index);
            $('#rcvData').attr('id', 'rcvData' + index);
            $('#brief').attr('id', 'brief' + index);
            $('#cardBody').attr('id', 'cardBody' + index);
            $('#showName' + index).html(tgtNodeNameList[index]);
            $('#hideName' + index).html(tgtNodeNameList[index]);


            let tgtNodeTopic = ["Node ID", "Tunnel ID", "Interface Name", "MAC", "State"];
            let tgtNodeData = [];

            var bit7NodeID = tgtNodeIDList[index].substr(0, 7);
            tgtNodeData.push(bit7NodeID);
            var bit7LinkID = tgtLinkIDList[index].substr(0, 7);
            tgtNodeData.push(bit7LinkID);
            tgtNodeData.push(ipopObj.getLinkListOf(objID)[tgtLinkIDList[index]]["InterfaceName"]);
            tgtNodeData.push(ipopObj.getLinkListOf(objID)[tgtLinkIDList[index]]["MAC"]);
            tgtNodeData.push(ipopObj.getLinkListOf(objID)[tgtLinkIDList[index]]["State"]);

            htmlContent = "";
            let i = 0;
            tgtNodeTopic.forEach((content => {
                htmlContent = htmlContent + '<p class="topic">' + content + '</p>';
                htmlContent = htmlContent + '<p class="data">' + tgtNodeData[i] + '</p>';
                i++;
            }))
            $('#otherNodeData' + index).html(htmlContent);


            tgtNodeTopic = [];
            tgtNodeData = [];
            content2 = '<p style="font-size:17px;font-weight:500;color:#56C5BC;line-height: 7px">Sent</p>'
            tgtNodeTopic = ["Bytes Sents(Bs)", "Total Bytes Sents(MB)"];

            btSent = ipopObj.getLinkListOf(objID)[tgtLinkIDList[index]]["Stats"][0]["sent_bytes_second"];
            tgtNodeData.push(btSent);
            tbtSent = ipopObj.getLinkListOf(objID)[tgtLinkIDList[index]]["Stats"][0]["sent_total_bytes"];
            tgtNodeData.push(tbtSent);

            htmlContent = "";
            i = 0;
            tgtNodeTopic.forEach((content => {
                htmlContent = htmlContent + '<p class="topic">' + content + '</p>';
                htmlContent = htmlContent + '<p class="data">' + tgtNodeData[i] + '</p>';
                i++;
            }))

            $('#sentData' + index).html(content2 + htmlContent);



            tgtNodeTopic = [];
            tgtNodeData = [];
            content = '<p style="font-size:17px;font-weight:500;color:#56C5BC;line-height: 7px">Received</p>'
            tgtNodeTopic = ["Bytes Received(Bs)", "Total Bytes Received(MB)"];

            btRcv = ipopObj.getLinkListOf(objID)[tgtLinkIDList[index]]["Stats"][0]["recv_bytes_second"];
            tgtNodeData.push(btRcv);
            tbtRcv = ipopObj.getLinkListOf(objID)[tgtLinkIDList[index]]["Stats"][0]["recv_total_bytes"];
            tgtNodeData.push(tbtRcv);
            htmlContent = "";
            i = 0;
            tgtNodeTopic.forEach((content => {
                htmlContent = htmlContent + '<p class="topic">' + content + '</p>';
                htmlContent = htmlContent + '<p class="data">' + tgtNodeData[i] + '</p>';
                i++;
            }))

            $('#rcvData' + index).html(content + htmlContent);
            $('#brief' + index).html("");

        }

        $(document).ready(function () {
            for (let index = 0; index < tgtNodeNameList.length; index++) {
                $("#show" + index + ",#hide" + index).click(function () {
                    if ($("#show" + index).is(":hidden")) {
                        $("#hide" + index).hide();
                        $("#show" + index).show();
                        $("#cardBody" + index).slideUp("slow");
                    } else {
                        $("#cardBody" + index).slideDown("slow");
                        $("#hide" + index).show();
                        $("#show" + index).hide();
                    }
                });
            }
        });
    });
}


var addSorceNodeData = function (ipopObj, sourceID) {

    $('#sourceNameShow').html(ipopObj.getNodeList()[sourceID]['NodeName']);
    $('#sourceNameHide').html(ipopObj.getNodeList()[sourceID]['NodeName']);

    let topic = ["Node ID", "State", "Location"];
    let data = [];

    data.push(sourceID.substr(0, 7));
    data.push("Connected");
    data.push("Gaineville, FL");
    // data.push("-");
    // data.push("-");
    // data.push(ipopObj.getNodeList()[sourceID]["IP4"]);
    // data.push("-");

    htmlContent = "";
    let index = 0;
    topic.forEach((content => {
        htmlContent = htmlContent + '<p class="topic">' + content + '</p>';
        htmlContent = htmlContent + '<p class="data">' + data[index] + '</p>';
        index++;
    }))

    $("#sourceData").html(htmlContent);
}

var addTargetNodeData = function (ipopObj, targetID) {

    $('#tgtNameShow').html(ipopObj.getNodeList()[targetID]['NodeName']);
    $('#tgtNameHide').html(ipopObj.getNodeList()[targetID]['NodeName']);


    let topic = ["Node ID", "State", "Location"];
    let data = [];

    data.push(targetID.substr(0, 7));
    data.push("Connected");
    data.push("Gaineville, FL");

    htmlContent = "";
    let index = 0;
    topic.forEach((content => {
        htmlContent = htmlContent + '<p class="topic">' + content + '</p>';
        htmlContent = htmlContent + '<p class="data">' + data[index] + '</p>';
        index++;
    }))

    $("#tgtData").html(htmlContent);
}


addLinkData = function (ipopObj, sourceID, objID) {
    let content1 = '<div class="card-body" style=" border-radius: 0px;border-radius: 6px " id="card2_body"><div class="inner">';

    let tgtNodeTopic = ["Tunnel ID", "Interface Name", "MAC", "State"];
    let tgtNodeData = [];

    var bit7LinkID = objID.substr(0, 7);
    tgtNodeData.push(bit7LinkID);
    tgtNodeData.push(ipopObj.getLinkListOf(sourceID)[objID]["InterfaceName"]);
    tgtNodeData.push(ipopObj.getLinkListOf(sourceID)[objID]["MAC"]);
    tgtNodeData.push(ipopObj.getLinkListOf(sourceID)[objID]["State"]);


    let htmlContent = "";
    let i = 0;
    tgtNodeTopic.forEach((content => {
        htmlContent = htmlContent + '<p class="topic">' + content + '</p>';
        htmlContent = htmlContent + '<p class="data">' + tgtNodeData[i] + '</p>';
        i++;
    }))

    let content2 = '</div><div class="boxInner"><p style="font-size:17px;font-weight:500;color:#56C5BC;line-height: 7px">Sent</p>';
    tgtNodeTopic = [];
    tgtNodeData = [];
    tgtNodeTopic = ["Bytes Sents(Bs)", "Total Bytes Sents(MB)"];
    btSent = ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["sent_bytes_second"];
    tgtNodeData.push(btSent);
    tbtSent = ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["sent_total_bytes"];
    tgtNodeData.push(tbtSent);

    let htmlContent2 = "";
    i = 0;
    tgtNodeTopic.forEach((content => {
        htmlContent2 = htmlContent2 + '<p class="topic">' + content + '</p>';
        htmlContent2 = htmlContent2 + '<p class="data">' + tgtNodeData[i] + '</p>';
        i++;
    }))


    let content3 = '</div><div class="boxInner"><p style="font-size:17px;font-weight:500;color:#56C5BC;line-height: 7px">Received</p>';
    tgtNodeTopic = [];
    tgtNodeData = [];
    tgtNodeTopic = ["Bytes Received(Bs)", "Total Bytes Received(MB)"];

    btRcv = ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["recv_bytes_second"];
    tgtNodeData.push(btRcv);
    tbtRcv = ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["recv_total_bytes"];
    tgtNodeData.push(tbtRcv);

    let htmlContent3 = "";
    i = 0;
    tgtNodeTopic.forEach((content => {
        htmlContent3 = htmlContent3 + '<p class="topic">' + content + '</p>';
        htmlContent3 = htmlContent3 + '<p class="data">' + tgtNodeData[i] + '</p>';
        i++;
    }))


    // let content4 = '</div><div class="inner">';
    // tgtNodeTopic = [];
    // tgtNodeData = [];
    // tgtNodeTopic = ["Writable", "Local Address", "Best Connection", "New Connection", "Timeout", "rtt"];
    // tgtNodeData.push(ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["writable"]);
    // tgtNodeData.push("-");
    // tgtNodeData.push(ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["best_conn"]);
    // tgtNodeData.push(ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["new_conn"]);
    // tgtNodeData.push(ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["timeout"]);
    // tgtNodeData.push(ipopObj.getLinkListOf(sourceID)[objID]["Stats"][0]["rtt"]);

    // let htmlContent4 = "";
    // i = 0;
    // tgtNodeTopic.forEach((content => {
    //     htmlContent4 = htmlContent4 + '<p class="topic">' + content + '</p>';
    //     htmlContent4 = htmlContent4 + '<p class="data">' + tgtNodeData[i] + '</p>';
    //     i++;
    // }));

    // $("#edgDet").append(content1 + htmlContent + content2 + htmlContent2 + content3 + htmlContent3 + content4 + htmlContent4 + "</div></div>");

    $("#edgDet").append(content1 + htmlContent + content2 + htmlContent2 + content3 + htmlContent3 + "</div>");
    // $(document).ready(function () {
    //     $("#sourceNodeShow,#sourceNodeHide").click(function () {
    //         if ($("#sourceNodeShow").is(":hidden")) {
    //             $("#sourceNodeHide").hide();
    //             $("#sourceNodeShow").show();
    //             $("#sourceBody").slideUp("slow");
    //         } else {
    //             $("#sourceBody").slideDown("slow");
    //             $("#sourceNodeHide").show();
    //             $("#sourceNodeShow").hide();
    //         }
    //     });
    // });

    // $(document).ready(function () {
    //     $("#targetNodeShow,#targetNodeHide").click(function () {
    //         if ($("#targetNodeShow").is(":hidden")) {
    //             $("#targetNodeHide").hide();
    //             $("#targetNodeShow").show();
    //             $("#targetBody").slideUp("slow");
    //         } else {
    //             $("#targetBody").slideDown("slow");
    //             $("#targetNodeHide").show();
    //             $("#targetNodeShow").hide();
    //         }
    //     });
    // });

    // $(document).ready(function () {
    //     $("#hide_info").click(function () {
    //         $("#edgDet").slideToggle("slow");
    //     });
    // });
}

var mouseOverEvent = function (ipopObj, cy) {
    var nodeDataTippy = null;

    cy.on('mouseover', 'node', function (event) {
        let nodeID = event.target.id();
        let content1 = ' <div class="inner"  style="margin: auto;text-align:left;">';
        let lineContent = '<hr style="border-color:#405B80;margin-top: -6px;margin-bottom: 6px">';
        let topicList = ['Node ID', '# of lncident Edges'];
        let dataList = [];
        // let ipv4 = ipopObj.getNodeList()[nodeID]["IP4"];


        var tgtLinkCount = 0;
        ipopObj.getLinkIDListOf(nodeID).forEach((linkID) => {
            var tgtNodeID = ipopObj.getLinkListOf(nodeID)[linkID]["TgtNodeId"];
            if (ipopObj.getNodeIDList().includes(tgtNodeID)) {
                tgtLinkCount++;
            }
        });

        dataList.push('<p class="data">' + nodeID.substr(0, 7) + '</p>');
        dataList.push('<p class="data">' + tgtLinkCount + '</p>');
        dataList.push('<p class="data">' + '-' + '</p>');

        htmlContent = "";
        let index = 0;
        topicList.forEach((content => {
            htmlContent = htmlContent + '<p class="topic">' + content + '</p>';
            htmlContent = htmlContent + dataList[index];
            index++;

            if (index != topicList.length) {
                htmlContent = htmlContent + lineContent;
            }
        }))

        $("#hoverDetail").html(content1 + htmlContent + '</div>');


        if (nodeDataTippy == null) {
            nodeDataTippy = makeTippyNodeData(cy.getElementById(event.target.id()), 'nodeData', $("#hoverDetail").html());
        } else {
            nodeDataTippy.destroy();
            nodeDataTippy = makeTippyNodeData(cy.getElementById(event.target.id()), 'nodeData', $("#hoverDetail").html());
        }
        nodeDataTippy.show();

        $("#hoverDetail").html("");
    });

    cy.on('mouseout', 'node', function () {
        if (nodeDataTippy != null) {
            nodeDataTippy.destroy();
            nodeDataTippy = null;
        }
    });
}

var clickEvent = function (ipopObj, cy, tippyList) {
    var tippyID = null;
    var nodeIdTippy = null;
    var isClicked = true;
    cy.on('click', function (event) {

        if (event.target !== cy) {
            let objID = event.target.id();

            if (!ipopObj.getNodeIDList().includes(objID)) {

                /* event of edge */

                restageEvent(tippyID, nodeIdTippy, tippyList);

                let sourceID = cy.edges('[id = "' + objID + '"]').data("source");
                let targetID = cy.edges('[id = "' + objID + '"]').data("target");
                let nodeI = cy.getElementById(objID);
                tippyID = makeTippy(nodeI, objID.substr(0, 7), "right", false, 'edge');
                tippyID.show();


                $('#travel').show();
                $('#overLayBox').hide();
                $("#overlayIDIntravel").html('Overlay: <strong>' + ipopObj.getOverlayID() + '</strong>');
                $("#inTravel").html('Link: <strong>' + objID.substr(0, 7) + '</strong>');
                $("#detail").html("");


                /* select edge to show node is connected by the edge */
                edgeSelect(cy, objID, sourceID, targetID);


                /* show edge's detail */
                $(document).ready(function () {
                    $("#edgeDetail").load("/edge_detail.html", function (responseTxt, statusTxt, xhr) {

                        if (statusTxt == "success") {
                            $("#edgeDetail").show();
                            $("#edgeName").html(objID.substr(0, 7));
                            $("#sourceNode").html("");
                            $("#targetNode").html("");
                            $("#edgDet").html("");


                            addSorceNodeData(ipopObj, sourceID);
                            addTargetNodeData(ipopObj, targetID);
                            addLinkData(ipopObj, sourceID, objID);


                            $(document).ready(function () {
                                $("#cross").click(function () {
                                    location.reload();
                                    $("#edgeDetail").hide();
                                });

                                $("#swap-icon").click(function () {

                                    if (isClicked) {
                                        $("#sourceNode").html("");
                                        $("#targetNode").html("");
                                        $("#edgDet").html("");
                                        addSorceNodeData(ipopObj, targetID);
                                        addTargetNodeData(ipopObj, sourceID);
                                        addLinkData(ipopObj, targetID, objID);
                                        isClicked = false;
                                    } else {
                                        $("#sourceNode").html("");
                                        $("#targetNode").html("");
                                        $("#edgDet").html("");
                                        addSorceNodeData(ipopObj, sourceID);
                                        addTargetNodeData(ipopObj, targetID);
                                        addLinkData(ipopObj, sourceID, objID);
                                        isClicked = true;
                                    }

                                });
                            });

                        } else {
                            alert("Error: " + xhr.status + ": " + xhr.statusText);
                        }
                    });
                });

            } else {
                /* Event of  node  */

                let nodeName = ipopObj.getNodeList()[objID]["NodeName"];


                $('#travel').show();
                $('#overLayBox').hide();
                $("#overlayIDIntravel").html('Overlay: <strong>' + ipopObj.getOverlayID() + '</strong>');
                $("#inTravel").html('Node: <strong>' + nodeName + '</strong>');

                cy.style().selector('node').style({ width: 36.37, height: 36.37, "background-color": "#9FC556" }).update();
                cy.style().selector('edge').style({ 'curve-style': 'haystack', 'line-color': '#56C5BC', 'z-index': "999999" }).update();
                restageEvent(tippyID, nodeIdTippy, tippyList);

                nodeIdTippy = objID;
                tippyList[nodeIdTippy].set({ theme: 'edge' });

                nodeSelect(cy, objID, ipopObj);     /* select node to show the node that it connect */


                $(document).ready(function () {
                    $("#edgeDetail").html("");
                    $("#detail").load("/detail.html", function (responseTxt, statusTxt, xhr) {

                        if (statusTxt == "success") {
                            $("#detail").show();

                            currentNodeDataAdding(nodeName, ipopObj, objID);
                            ortherNodeDataAdding(ipopObj, objID);

                            $(document).ready(function () {
                                $("#cross").click(function () {
                                    location.reload();
                                    $("#detail").hide();
                                });
                            });

                        } else {
                            alert("Error: " + xhr.status + ": " + xhr.statusText);
                        }
                    });
                });
            }
        } else {

            /* if user click on each part that not graph */
            restageEvent(tippyID, nodeIdTippy, tippyList);
            cy.style().selector('node').style({ width: 36.37, height: 36.37, "background-color": "#9FC556" }).update();
            cy.style().selector('edge').style({ 'curve-style': 'haystack', 'line-color': '#56C5BC', 'z-index': "999999" }).update();

            $('#travel').hide();
            $('#overLayBox').show();
            $("#detail").html("");
            $("#edgeDetail").html("");

        }
    });
}


/* restate of clickEvent */
var restageEvent = function (tippyID, nodeIdTippy, tippyList) {
    temp = null

    if (tippyID != null) {
        tippyID.hide();
    }

    if (nodeIdTippy != null) {
        tippyList[nodeIdTippy].set({ theme: 'node' });
    }

}


