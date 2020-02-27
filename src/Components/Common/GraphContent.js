import React from "react";
import ReactDOM from "react-dom";
import RightPanel from "./RightPanel";
import Card from "react-bootstrap/Card";
import Cytoscape from 'react-cytoscapejs';
import CollapseButton from "./CollapseButton";
import Popover from "react-bootstrap/Popover";
import cytoscapeStyle from "./cytoscapeStyle.js";
import { Typeahead } from "react-bootstrap-typeahead";
import CreateGraphContents from "./CreateGraphContents";
import static_ic from "../../Images/Icons/static_ic.svg";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import ondemand_ic from "../../Images/Icons/ondemand_ic.svg";
import connected_ic from "../../Images/Icons/connected_ic.svg";
import no_tunnel_ic from "../../Images/Icons/no_tunnel_ic.svg";
import successor_ic from "../../Images/Icons/successor_ic.svg";
import longdistance_ic from "../../Images/Icons/longdistance_ic.svg";
import not_reporting_ic from "../../Images/Icons/not_reporting_ic.svg";
import GoogleMapReact from 'google-map-react';

class GraphContent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            nodeLocations: {
                a100001feb6040628e5fb7e70b04f001: [35.667780, 139.792468],
                a100002feb6040628e5fb7e70b04f002: [36.063169, 140.135293],
                a100003feb6040628e5fb7e70b04f003: [36.036767, 139.139504],
                a100004feb6040628e5fb7e70b04f004: [36.124898, 138.014066],
                a100005feb6040628e5fb7e70b04f005: [35.176555, 136.856869],
                a100006feb6040628e5fb7e70b04f006: [34.992293, 135.762571],
                a100007feb6040628e5fb7e70b04f007: [34.682988, 135.528840],
                a100008feb6040628e5fb7e70b04f008: [35.864095, 139.667933],
                a100009feb6040628e5fb7e70b04f009: [36.640714, 138.955405],
                a100010feb6040628e5fb7e70b04f010: [34.377240, 132.457048],
            },
            initMinZoom: 0.2,
            initMaxZoom: 2,
            setMinZoom: 0.2,
            setMaxZoom: 2,
            // wheelSensitive:0.1,
            ipop: null,
            graphElement: [],
            dataReady: false,
            refresh: false,
            // cytoscape: null,
            switchToggle: false,
            infoToggle: true,
            configToggle: true,
            nodeDetails: null,
            linkDetails: null,
            currentSelectedElement: null,
            currentView: null
        }
    }

    componentDidMount() {
        // document.getElementById("searchBar").remove(document.getElementById("searchOverlay"))
        document.getElementById("overlayRightPanelBtn").click();
        this.fetchData();
    }

    renderNodeDetails = () => {
        // console.log("redering node");

        var sourceNode = this.state.nodeDetails.sourceNode;
        var connectedNodes = this.state.nodeDetails.connectedNodes;

        var ipop = this.state.ipop;
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.nodeLocations[sourceNode.nodeID][0]},${this.state.nodeLocations[sourceNode.nodeID][1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
            .then(res => res.json()).then((data) => {
                console.log(data);
                return data.results[data.results.length - 3].formatted_address;
            }).then((location) => {
                var nodeContent = <div>

                    <h5>{sourceNode.nodeName}</h5>

                    <div className="DetailsLabel">Node ID</div>
                    {sourceNode.nodeID}

                    <div className="DetailsLabel">State</div>
                    {sourceNode.nodeState}

                    <div className="DetailsLabel">City/State/Country</div>
                    {location}
                    <br /><br />

                    <div id="connectedNode" style={{ overflow: "auto" }}>
                        {connectedNodes.map(connectedNode => {
                            var connectedNodeDetail = ipop.findConnectedNodeDetails(sourceNode.nodeID, connectedNode.id())
                            var connectedNodeBtn =
                                <CollapseButton key={ipop.getNodeName(connectedNode.id()) + "Btn"} id={ipop.getNodeName(connectedNode.id()) + "Btn"} name={ipop.getNodeName(connectedNode.id())}>
                                    <div className="DetailsLabel">Node ID</div>
                                    {connectedNode.id()}
                                    <div className="DetailsLabel">Tunnel ID</div>
                                    {connectedNodeDetail.TunnelID}
                                    <div className="DetailsLabel">Interface Name</div>
                                    {connectedNodeDetail.InterfaceName}
                                    <div className="DetailsLabel">MAC</div>
                                    {connectedNodeDetail.MAC}
                                    <div className="DetailsLabel">State</div>
                                    {connectedNodeDetail.State}
                                    <div className="DetailsLabel">Tunnel Type</div>
                                    {connectedNodeDetail.TunnelType}
                                    <div className="DetailsLabel">ICE Connection Type</div>
                                    {connectedNodeDetail.ICEConnectionType}
                                    <div className="DetailsLabel">ICE Role</div>
                                    {connectedNodeDetail.ICERole}
                                    <div className="DetailsLabel">Remote Address</div>
                                    {connectedNodeDetail.RemoteAddress}
                                    <div className="DetailsLabel">Local Address</div>
                                    {connectedNodeDetail.LocalAddress}
                                    <div className="DetailsLabel">Latency</div>
                                    {connectedNodeDetail.Latency}
                                    <Card.Body className="transmissionCard">
                                        Sent
                                                <div className="DetailsLabel">Byte Sent</div>
                                        -
                                                <div className="DetailsLabel">Total Byte Sent</div>
                                        {connectedNodeDetail.Stats[0].sent_total_bytes}
                                    </Card.Body>

                                    <Card.Body className="transmissionCard">
                                        Received
                                                <div className="DetailsLabel">Byte Received</div>
                                        -
                                                <div className="DetailsLabel">Total Byte Received</div>
                                        {connectedNodeDetail.Stats[0].recv_total_bytes}
                                    </Card.Body>

                                </CollapseButton>

                            return connectedNodeBtn;
                        })}
                    </div>

                </div>
                ReactDOM.render(nodeContent, document.getElementById("rightPanelContent"))
            })


    }

    renderLinkDetails = () => {

        var linkDetails = this.state.linkDetails.linkDetails;
        var sourceNodeDetails = this.state.linkDetails.sourceNodeDetails;
        var targetNodeDetails = this.state.linkDetails.targetNodeDetails;
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.nodeLocations[sourceNodeDetails.nodeID][0]},${this.state.nodeLocations[sourceNodeDetails.nodeID][1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
            .then(res => res.json()).then(data => {
                return data.results[data.results.length - 3].formatted_address;
            }).then(sourceLocation => {
                fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.nodeLocations[targetNodeDetails.nodeID][0]},${this.state.nodeLocations[targetNodeDetails.nodeID][1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
                    .then(res => res.json()).then(data => {
                        return data.results[data.results.length - 3].formatted_address;
                    }).then(targetLocation => {

                        var linkContent = <div>
                            <h5>{linkDetails.InterfaceName}</h5>

                            <div className="row">

                                <div className="col-10" style={{ paddingRight: "0" }}>

                                    <CollapseButton className="sourceNodeBtn" key={sourceNodeDetails.nodeID + "Btn"} id={sourceNodeDetails.nodeID + "Btn"} name={sourceNodeDetails.nodeName}>

                                        <div className="DetailsLabel">Node ID</div>
                                        {sourceNodeDetails.nodeID}

                                        <div className="DetailsLabel">State</div>
                                        {sourceNodeDetails.nodeState}

                                        <div className="DetailsLabel">City/State/Country</div>
                                        {sourceLocation}

                                    </CollapseButton>

                                    <CollapseButton className="targetNodeBtn" key={targetNodeDetails.nodeID + "Btn"} id={targetNodeDetails.nodeID + "Btn"} name={targetNodeDetails.nodeName}>

                                        <div className="DetailsLabel">Node ID</div>
                                        {targetNodeDetails.nodeID}

                                        <div className="DetailsLabel">State</div>
                                        {targetNodeDetails.nodeState}

                                        <div className="DetailsLabel">City/Country</div>
                                        {targetLocation}

                                    </CollapseButton>

                                </div>

                                <div className="col" style={{ margin: "auto", padding: "0", textAlign: "center" }}>
                                    <button onClick={this.handleSwitch} id="switchBtn" />
                                </div>

                            </div>

                            <div className="DetailsLabel">Tunnel ID</div>
                            {linkDetails.TunnelID}
                            <div className="DetailsLabel">Interface Name</div>
                            {linkDetails.InterfaceName}
                            <div className="DetailsLabel">MAC</div>
                            {linkDetails.MAC}
                            <div className="DetailsLabel">State</div>
                            {linkDetails.State}
                            <div className="DetailsLabel">Tunnel Type</div>
                            {linkDetails.TunnelType}
                            <div className="DetailsLabel">ICE Connection Type</div>
                            {linkDetails.ICEConnectionType}
                            <div className="DetailsLabel">ICE Role</div>
                            {linkDetails.ICERole}
                            <div className="DetailsLabel">Remote Address</div>
                            {linkDetails.RemoteAddress}
                            <div className="DetailsLabel">Local Address</div>
                            {linkDetails.LocalAddress}
                            <div className="DetailsLabel">Latency</div>
                            {linkDetails.Latency}
                            <br /><br />

                            <Card.Body className="transmissionCard">
                                Sent
                                        <div className="DetailsLabel">Byte Sent</div>
                                -
                                        <div className="DetailsLabel">Total Byte Sent</div>
                                {linkDetails.Stats[0].sent_total_bytes}
                            </Card.Body>

                            <Card.Body className="transmissionCard">
                                Received
                                        <div className="DetailsLabel">Byte Received</div>
                                -
                                        <div className="DetailsLabel">Total Byte Received</div>
                                {linkDetails.Stats[0].recv_total_bytes}
                            </Card.Body>
                            <OverlayTrigger rootClose={true} trigger="click" placement="left" overlay={
                                <Popover>
                                    <Popover.Title as="h3">Transmission Graph</Popover.Title>
                                    <Popover.Content>
                                        <div className="row">

                                        </div>
                                    </Popover.Content>
                                </Popover>}>
                                <button id="transmissionBtn" >Transmission graph</button>
                            </OverlayTrigger>
                        </div>

                        ReactDOM.render(linkContent, document.getElementById("rightPanelContent"))
                    })
            })

    }

    handleSwitch = () => {

        var that = this;
        var promise = new Promise(function (resolve, reject) {
            try {
                that.setState(prevState => {
                    return { switchToggle: !prevState.switchToggle }
                })

                resolve(true)
            } catch{
                reject(false)
            }
        })

        promise.then(function () {
            that.swap()
        }).catch(function (e) {

        });

    }

    swap = () => {

        var that = this;
        var linkDetails;
        var promise = new Promise(function (resolve, reject) {
            try {
                if (that.state.switchToggle) {
                    linkDetails = that.state.ipop.getLinkDetails(that.state.currentSelectedElement.data().target, that.state.currentSelectedElement.data().id);
                } else {
                    linkDetails = that.state.ipop.getLinkDetails(that.state.currentSelectedElement.data().source, that.state.currentSelectedElement.data().id);
                }
                resolve(linkDetails)
            } catch{
                reject(false)
            }
        })

        promise.then(function (linkDetails) {
            that.setState(prevState => {
                return { linkDetails: { "linkDetails": linkDetails, "sourceNodeDetails": prevState.linkDetails.targetNodeDetails, "targetNodeDetails": prevState.linkDetails.sourceNodeDetails } }
            })
        }).then(function () {
            that.renderLinkDetails();
        }).catch(function (e) {

        })

    }

    setNodeDetails = (node) => {
        // console.log("setting node ");
        var that = this;
        var promise = new Promise(function (resolve, reject) {
            try {
                var sourceNode = that.state.ipop.getNodeDetails(node.data().id);

                var connectedNodes = that.state.cytoscape.elements(node.incomers().union(node.outgoers())).filter((element) => {
                    return element.isNode();
                });

                that.setState({ nodeDetails: { "sourceNode": sourceNode, "connectedNodes": connectedNodes } })

                resolve(true)
            } catch{
                reject(false)
            }
        })

        promise.then(function () {
            that.renderNodeDetails();
        }).catch(function () {

        })
    }

    setLinkDetails = (link) => {
        var that = this;
        var promise = new Promise(function (resolve, reject) {
            try {
                var linkDetails = that.state.ipop.getLinkDetails(link.data().source, link.data().id);

                var sourceNode = link.data().source;

                var targetNode = link.data().target;

                var sourceNodeDetails = that.state.ipop.getNodeDetails(link.data().source);

                var targetNodeDetails = that.state.ipop.getNodeDetails(link.data().target);

                that.setState({ linkDetails: { "linkDetails": linkDetails, "sourceNode": sourceNode, "targetNode": targetNode, "sourceNodeDetails": sourceNodeDetails, "targetNodeDetails": targetNodeDetails } })

                resolve(true);
            } catch{
                reject(false);
            }
        })

        promise.then(function () {
            that.renderLinkDetails();
        }).catch(function () {

        })
    }

    renderGraph = () => {
        this.setState({ currentView: "Topology" })
        ReactDOM.render(<Cytoscape id="cy"
            cy={(cy) => {

                this.cy = cy;

                this.setState({ cytoscape: cy });

                this.cy.maxZoom(this.state.initMaxZoom);
                this.cy.minZoom(this.state.initMinZoom);
                this.cy.zoom(0.8);
                this.cy.center();

                var that = this;

                if (this.state.currentSelectedElement !== null) {
                    if (this.state.currentSelectedElement.isNode()) {
                        var selectedElement = this.cy.elements().filter(node => node.data().id === this.state.currentSelectedElement.data().id).filter(element => { return element.isNode() });
                        var relatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement);
                        var notRelatedElement = this.cy.elements().difference(selectedElement.outgoers().union(selectedElement.incomers())).not(selectedElement)
                        selectedElement.select();
                        relatedElement.removeClass("transparent")
                        notRelatedElement.addClass("transparent");
                    } else if (this.state.currentSelectedElement.isEdge()) {
                        //    console.log(this.state.currentSelectedElement)
                        var relatedElement2 = this.state.currentSelectedElement.connectedNodes().union(this.state.currentSelectedElement);
                        var notRelatedElement2 = this.cy.elements().difference(this.state.currentSelectedElement.connectedNodes()).not(this.state.currentSelectedElement);
                        // var relatedElement2 = selectedElement.connectedNodes().union(selectedElement);
                        // var notRelatedElement2 = that.cy.elements().difference(selectedElement.connectedNodes()).not(selectedElement);
                        this.state.currentSelectedElement.select();
                        relatedElement2.removeClass("transparent")
                        notRelatedElement2.addClass("transparent");
                    }
                }

                this.cy.on("click", function (e) {
                    var selectedElement = e.target[0];
                    var relatedElement;
                    var notRelatedElement;
                    try {
                        // console.log(e.target[0]===this.cy);
                        if (document.getElementById("rightPanel").hidden === true) {
                            document.getElementById("overlayRightPanelBtn").click();
                        }
                        if (selectedElement.isNode()) {
                            // console.log(`selected from clicked : ${JSON.stringify(e.target.data())}`);
                            that.setNodeDetails(selectedElement);

                            relatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement);
                            notRelatedElement = that.cy.elements().difference(selectedElement.outgoers().union(selectedElement.incomers())).not(selectedElement)

                        } else if (selectedElement.isEdge()) {
                            that.setLinkDetails(selectedElement)
                            relatedElement = selectedElement.connectedNodes().union(selectedElement);
                            notRelatedElement = that.cy.elements().difference(selectedElement.connectedNodes()).not(selectedElement);
                        }
                        if (document.getElementById("viewSelector").value !== "Subgraph") {
                            relatedElement.removeClass("transparent")
                            notRelatedElement.addClass("transparent");
                        }
                    } catch {
                        // console.log(e.target[0]===this.cy);
                        if (e.target[0] === this.cy) {
                            document.getElementById("overlayRightPanelBtn").click();
                            ReactDOM.render(<></>, document.getElementById("rightPanelContent"))
                            that.cy.elements().removeClass("transparent");
                        }
                    } finally {
                        if (e.target[0] !== this.cy) {
                            that.setState({ switchToggle: false, currentSelectedElement: e.target })
                        } else {
                            that.setState({ switchToggle: false, currentSelectedElement: null })
                        }
                    }

                })

            }}
            wheelSensitivity={0.1}

            elements={Cytoscape.normalizeElements({
                nodes: this.state.graphElement[0],
                edges: this.state.graphElement[1]
            })}

            stylesheet={cytoscapeStyle}

            style={{ width: window.innerWidth, height: window.innerHeight }}

            layout={{ name: "circle" }}

        />, document.getElementById("midArea"))

        ReactDOM.render(<select defaultValue="Topology" onChange={this.handleViewSelector} id="viewSelector" className="custom-select">
            <option value="Topology">Topology</option>
            <option value="Subgraph">Subgraph</option>
            <option value="Map">Map</option>
            <option value="Log">Log</option>
            <option value="NetworkFlow">NetworkFlow</option>
            <option value="TunnelUtilization">TunnelUtilization</option>
        </select>, document.getElementById("viewBar"));

        ReactDOM.render(<Typeahead selectHintOnEnter id="searchGraphElement"

            onChange={(selected) => {
                try {
                    if (this.state.currentSelectedElement !== null) {
                        this.state.currentSelectedElement.unselect();
                    } else {

                    }
                    selected[0].select();
                    selected[0].trigger("click");
                    this.setState({ switchToggle: false, currentSelectedElement: selected[0] })
                } catch (e) {
                    // alert(e)
                    ReactDOM.render(<></>, document.getElementById("rightPanelContent"))
                    this.cy.elements().removeClass("transparent");
                }
            }}
            labelKey={(element) => { return (`${element.data().label}`); }}
            filterBy={this.elementFilter}
            options={this.cy.elements().map(element => { return element; })}
            selected={this.state.selected}
            placeholder="Search node or tunnel"
            renderMenuItemChildren={(element) => {
                return (
                    <div className="searchResult">
                        <div className="resultLabel">
                            {element.data().label}
                        </div>
                        <small className="resultLabel">ID : {element.data().id}</small>
                    </div>

                )
            }}

        > </Typeahead>, document.getElementById("searchBar"))

    }

    elementFilter = (element, props) => {
        if (element.group === 'nodes') {
            return (element.data().label.toLowerCase().indexOf(props.text.toLowerCase()) !== -1
                ||
                element.data().id.toLowerCase().indexOf(props.text.toLowerCase()) !== -1);
        }
        else {
            return (element.data().label.toLowerCase().indexOf(props.text.toLowerCase()) !== -1
                ||
                element.data().id.toLowerCase().indexOf(props.text.toLowerCase()) !== -1);
        }
    }

    fetchData = () => {
        var selectedOverlay = this.props.selectedOverlay;
        var intervalNo = new Date().toISOString().split(".")[0];
        var serverIP = '52.139.216.32:5000';
        var allowOrigin = 'https://cors-anywhere.herokuapp.com/';  /* you need to allow origin to get data from outside server*/

        var nodeURL = allowOrigin + "http://" + serverIP + "/IPOP/overlays/" + selectedOverlay + "/nodes?interval=" + intervalNo + "&current_state=True";
        var linkURL = allowOrigin + "http://" + serverIP + "/IPOP/overlays/" + selectedOverlay + "/links?interval=" + intervalNo + "&current_state=True";

        var ipop = new CreateGraphContents();
        var nodeConf = [];
        var linkConf = [];
        var targetConf, sourceConf;

        fetch(nodeURL).then(res => res.json()).then(nodes => {
            fetch(linkURL).then(res => res.json()).then(links => {
                console.log(links);
                ipop.init(this.props.selectedOverlay, nodes, links);
                this.setState({ ipop: ipop });
            }).then(() => {
                ipop.getNodeIDs().forEach(nodeID => {
                    console.log(nodeID);
                    nodeConf.push(JSON.parse(`{ "data": { "id": "${nodeID}", "label": "${ipop.getNodeName(nodeID)}" ,"type":"","lat":"${this.state.nodeLocations[nodeID][0]}","lng":"${this.state.nodeLocations[nodeID][1]}"} }`));
                    ipop.getLinkIDs(nodeID).forEach(linkID => {
                        sourceConf = ipop.getSourceNode(nodeID, linkID);
                        targetConf = ipop.getTargetNode(nodeID, linkID);
                        var linkColor;
                        switch (ipop.getLinkDetails(nodeID, linkID).TunnelType) {
                            case 'CETypeILongDistance':
                                linkColor = '#5E4FA2';
                                break;
                            case 'CETypeLongDistance':
                                linkColor = '#5E4FA2';
                                break;
                            case 'CETypePredecessor':
                                linkColor = '#01665E';
                                break;
                            case 'CETypeSuccessor':
                                linkColor = '#01665E';
                                break;
                            default: break;
                        }
                        linkConf.push(JSON.parse(`{ "data": { "source": "${sourceConf}", "target": "${targetConf}","id":"${linkID}" ,"label":"${ipop.getLinkName(nodeID, linkID)}","type":"${ipop.getLinkObj()[nodeID][linkID]["Type"]}","color":"${linkColor}"} }`));
                    })
                });
                this.setState({ graphElement: [nodeConf, linkConf], currentView: "Topology" })
            }).then(() => {
                this.renderGraph()
            })
        })
    }

    handleRefresh = () => {
        this.cy.zoom(0.8);
        document.getElementById("zoomSlider").value = this.cy.zoom();
        this.cy.center();
    }

    zoomIn = () => {
        var currentZoom = this.cy.zoom();
        this.cy.zoom(currentZoom + 0.1);
        document.getElementById("zoomSlider").value = (this.cy.zoom())
    }

    zoomOut = () => {
        var currentZoom = this.cy.zoom();
        this.cy.zoom(currentZoom - 0.1);
        document.getElementById("zoomSlider").value = (this.cy.zoom())
    }

    handleZoomSlider = (e) => {
        this.cy.zoom(parseFloat(e.target.value));
    }

    handleWheel = (e) => {
        document.getElementById("zoomSlider").value = (this.cy.zoom())
    }

    handleSetMinZoom = (e) => {
        try {
            this.cy.minZoom(parseFloat(e.target.value));
            document.getElementById("zoomSlider").min = parseFloat(e.target.value);
        } finally {
            if (this.cy.zoom() < parseFloat(e.target.value)) {
                this.cy.zoom(parseFloat(e.target.value));
            }
            this.setState({ setMinZoom: e.target.value })
        }
    }

    handleSetMaxZoom = (e) => {
        try {
            this.cy.maxZoom(parseFloat(e.target.value));
            document.getElementById("zoomSlider").max = parseFloat(e.target.value);
        } finally {
            if (this.cy.zoom() > parseFloat(e.target.value)) {
                this.cy.zoom(parseFloat(e.target.value));
            }
            this.setState({ setMinZoom: e.target.value })
        }
    }

    // handleSetZoomSensitive = (e) => {
    //     this.setState({wheelSensitive:e.target.value});
    // }

    handleBackToHome = () => {
        if (window.confirm("Your current process will be loss. Are you sure to go back ?") === true) {
            window.location.reload(true);
        }
    }

    renderSubgraph = () => {
        var selectedElement = this.state.currentSelectedElement;
        var notRelatedElement;
        if (this.state.currentView !== "Map") {
            console.log("here");

            try {
                if (selectedElement.isNode()) {
                    notRelatedElement = this.cy.elements().difference(selectedElement.outgoers().union(selectedElement.incomers())).not(selectedElement);
                } else if (selectedElement.isEdge()) {
                    notRelatedElement = this.cy.elements().difference(selectedElement.connectedNodes()).not(selectedElement);
                }
                notRelatedElement.addClass("subgraph")
                this.setState({ currentView: "Subgraph" })
            } catch{
                alert("Please select node or tunnel.")
                document.getElementById("viewSelector").value = this.state.currentView;
            }

        } else {
            alert("Map is not available for this view.")
            document.getElementById("viewSelector").value = this.state.currentView;
        }

    }

    renderTopology = () => {
        document.getElementById("homeBtn").hidden = false;
        document.getElementById("refreshBtn").hidden = false;
        document.getElementById("configBtn").hidden = false;
        document.getElementById("infoBtn").hidden = false;
        document.getElementById("plusBtn").hidden = false;
        document.getElementById("minusBtn").hidden = false;
        document.getElementById("zoomSlider").hidden = false;
        if (this.state.currentView === "Subgraph") {
            this.cy.elements().removeClass("subgraph");
        } else if (this.state.currentView === "Map") {
            this.renderGraph();
        }
    }

    handleMakerClicked = (node) => {
        if (this.state.currentSelectedElement.isNode()) {
            node.trigger("click")
            document.getElementById(node.data().id + "Marker").classList.add("selected");
            this.setState({ switchToggle: false, currentSelectedElement: node })
        }
    }

    midpoint = (lat1, lng1, lat2, lng2) => {
        lat1 = this.deg2rad(lat1);
        lng1 = this.deg2rad(lng1);
        lat2 = this.deg2rad(lat2);
        lng2 = this.deg2rad(lng2);

        var dlng = lng2 - lng1;
        var Bx = Math.cos(lat2) * Math.cos(dlng);
        var By = Math.cos(lat2) * Math.sin(dlng);
        var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
            Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
        var lng3 = lng1 + Math.atan2(By, (Math.cos(lat1) + Bx));

        return [(lat3 * 180) / Math.PI, (lng3 * 180) / Math.PI];
    }

    deg2rad = (degrees) => {
        return degrees * Math.PI / 180;
    };

    renderMap = () => {

        var that = this;
        if (this.state.currentSelectedElement !== null) {

            if (this.state.currentSelectedElement.isEdge()) {

                var createMapFromEdge = new Promise((resolve, reject) => {
                    try {
                        var selectedElement = this.state.currentSelectedElement;
                        var relatedElement = selectedElement.connectedNodes();
                        console.log(relatedElement);
                        var centerPoint = this.midpoint(this.state.nodeLocations[selectedElement.data().source][0], this.state.nodeLocations[selectedElement.data().source][1], this.state.nodeLocations[selectedElement.data().target][0], this.state.nodeLocations[selectedElement.data().target][1])
                        var map = <GoogleMapReact
                            bootstrapURLKeys={{
                                key: "AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs",
                                language: 'en'
                            }}
                            center={{ lat: centerPoint[0], lng: centerPoint[1] }}
                            defaultZoom={10}
                        >

                            {relatedElement.map(node => {
                                return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + "Marker"} id={node.data().id + "Marker"} className="nodeMarker" lat={node.data().lat} lng={node.data().lng}>
                                    <label className="markerLabel">
                                        {node.data().label}
                                    </label>
                                </button>
                            })}

                        </GoogleMapReact>

                        this.setState({ currentView: "Map" })
                        ReactDOM.render(map, document.getElementById("midArea"))
                      
                        resolve(true);
                    } catch (e) {
                        console.log(e)
                        // alert("You have to select a node.")
                        // document.getElementById("viewSelector").value = this.state.currentView;
                        reject(false);
                    }
                })

                createMapFromEdge.then(function () {
                    if (that.state.currentSelectedElement !== null) {
                        console.log(document.getElementById(that.state.currentSelectedElement.data().id + "Marker"));
                        
                        // document.getElementById(that.state.currentSelectedElement.data().id + "Marker").classList.add("selected");
                    }
                })
                
            } else if (this.state.currentSelectedElement.isNode()) {

                var createMapFromNode = new Promise((resolve, reject) => {
                    try {
                        var selectedElement = this.state.currentSelectedElement;
                        var relatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement);

                        console.log(relatedElement);

                        var map = <GoogleMapReact
                            bootstrapURLKeys={{
                                key: "AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs",
                                language: 'en'
                            }}
                            center={{ lat: this.state.nodeLocations[this.state.currentSelectedElement.data().id][0], lng: this.state.nodeLocations[this.state.currentSelectedElement.data().id][1] }}
                            defaultZoom={10}
                        >

                            {relatedElement.map(node => {
                                return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + "Marker"} id={node.data().id + "Marker"} className="nodeMarker" lat={node.data().lat} lng={node.data().lng}>
                                    <label className="markerLabel">
                                        {node.data().label}
                                    </label>
                                </button>
                            })}

                        </GoogleMapReact>

                        ReactDOM.render(map, document.getElementById("midArea"))
                        this.setState({ currentView: "Map" })
                        resolve(true);
                    } catch (e) {
                        // alert("You have to select a node.")
                        // document.getElementById("viewSelector").value = this.state.currentView;
                        reject(false);
                    }
                })

                createMapFromNode.then(function () {
                    if (that.state.currentSelectedElement !== null) {
                        console.log(document.getElementById(that.state.currentSelectedElement.data().id + "Marker"));
                        document.getElementById(that.state.currentSelectedElement.data().id + "Marker").classList.add("selected");
                    }
                })


            }
        } else {
            alert("Please select some node or tunnel.")
            document.getElementById("viewSelector").value = this.state.currentView;
        }
    }

    componentDidUpdate() {
        if (this.state.currentView === "Map") {
            document.getElementById("homeBtn").hidden = true;
                document.getElementById("refreshBtn").hidden = true;
                document.getElementById("configBtn").hidden = true;
                document.getElementById("infoBtn").hidden = true;
                document.getElementById("plusBtn").hidden = true;
                document.getElementById("minusBtn").hidden = true;
                document.getElementById("zoomSlider").hidden = true;
            var selectedElement = this.state.currentSelectedElement;
            if (this.state.currentSelectedElement.isNode()) {
                try {
                    var nodeRelatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement).filter(element => {
                        return element.isNode();
                    });
                    console.log(nodeRelatedElement)
                    var nodeMap = <GoogleMapReact
                        bootstrapURLKeys={{
                            key: "AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs",
                            language: 'en'
                        }}
                        center={{ lat: this.state.nodeLocations[this.state.currentSelectedElement.data().id][0], lng: this.state.nodeLocations[this.state.currentSelectedElement.data().id][1] }}
                        defaultZoom={8}
                    >

                        {nodeRelatedElement.map(node => {
                            if (node.data().id === this.state.currentSelectedElement.data().id) {
                                return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + "Marker"} id={node.data().id + "Marker"} className="nodeMarker selected" lat={node.data().lat} lng={node.data().lng}>
                                    <label className="markerLabel">
                                        {node.data().label}
                                    </label>
                                </button>
                            } else {
                                return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + "Marker"} id={node.data().id + "Marker"} className="nodeMarker" lat={node.data().lat} lng={node.data().lng}>
                                    <label className="markerLabel">
                                        {node.data().label}
                                    </label>
                                </button>
                            }
                        })}

                    </GoogleMapReact>

                    ReactDOM.render(nodeMap, document.getElementById("midArea"))

                } catch (e) {
                    console.log(e)
                    alert("You have to select a node.")
                    document.getElementById("viewSelector").value = this.state.currentView;
                }
            } else if (this.state.currentSelectedElement.isEdge()) {
                try {
                    var edgeRelatedElement = selectedElement.connectedNodes();
                    console.log(edgeRelatedElement);
                    var centerPoint = this.midpoint(this.state.nodeLocations[selectedElement.data().source][0], this.state.nodeLocations[selectedElement.data().source][1], this.state.nodeLocations[selectedElement.data().target][0], this.state.nodeLocations[selectedElement.data().target][1])
                    var edgeMap = <GoogleMapReact
                        bootstrapURLKeys={{
                            key: "AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs",
                            language: 'en'
                        }}
                        center={{ lat: centerPoint[0], lng: centerPoint[1] }}
                        defaultZoom={10}
                    >

                        {edgeRelatedElement.map(node => {
                            return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + "Marker"} id={node.data().id + "Marker"} className="nodeMarker" lat={node.data().lat} lng={node.data().lng}>
                                <label className="markerLabel">
                                    {node.data().label}
                                </label>
                            </button>
                        })}

                    </GoogleMapReact>

                    ReactDOM.render(edgeMap, document.getElementById("midArea"))
                } catch (e) {
                    console.log(e)
                    // alert("You have to select a node.")
                    // document.getElementById("viewSelector").value = this.state.currentView;
                }
            }

        }
    }

    handleViewSelector = (e) => {
        switch (e.target.value) {
            case "Subgraph": this.renderSubgraph(); break;
            case "Topology": this.renderTopology(); break;
            case "Map": this.renderMap(); break;

            default: ;
        }
    }

    renderTunnelUtilization = () => {

    }

    render() {
        return <>
            <div id="leftTools" className="col-3">
                <div>
                    <button onClick={this.handleBackToHome} id="homeBtn" className="leftToolsBtn"></button>
                </div>
                <div>
                    <button onClick={this.handleRefresh} id="refreshBtn" className="leftToolsBtn"></button>
                </div>
                <div>
                    <OverlayTrigger rootClose={true} trigger="click" placement="right" overlay={
                        <Popover>
                            <Popover.Title as="h3">IPOP Network Visualizer : Legend</Popover.Title>
                            {/* <Card id="infoContent"> */}
                            <Popover.Content id="infoContent">
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan={2}>Node</th>
                                            <th colSpan={2}>Tunnel</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ width: "5%", margin: "auto" }}><img className="node_img" src={connected_ic} alt="connected_node" /></td>
                                            <td>Connected</td>
                                            <td style={{ width: "15%" }}><img className="tunnel_img" src={longdistance_ic} alt="longdistance_tunnel" /></td>
                                            <td>Long Distance</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: "5%" }}><img className="node_img" src={not_reporting_ic} alt="not_reporting_node" /></td>
                                            <td>Not Reporting</td>
                                            <td style={{ width: "15%" }}><img className="tunnel_img" src={ondemand_ic} alt="ondemand_tunnel" /></td>
                                            <td>On Demand</td>
                                        </tr>
                                        <tr>
                                            <td style={{ width: "5%" }}><img className="node_img" src={no_tunnel_ic} alt="no_tunnel_node" /></td>
                                            <td>No Tunnels</td>
                                            <td style={{ width: "15%" }}><img className="tunnel_img" src={static_ic} alt="static_tunnel" /></td>
                                            <td>Static</td>
                                        </tr>
                                        <tr>
                                            <td ></td>
                                            <td></td>
                                            <td style={{ width: "15%" }}><img className="tunnel_img" src={successor_ic} alt="successor_tnnel" /></td>
                                            <td>Successor</td>
                                        </tr>
                                    </tbody>
                                </table>
                                {/* </Card> */}
                            </Popover.Content>
                        </Popover>}>
                        <button onClick={this.handleInfoToggle} id="infoBtn" className="leftToolsBtn"></button>
                    </OverlayTrigger>
                </div>
                <div>
                    <OverlayTrigger rootClose={true} trigger="click" placement="right" overlay={
                        <Popover>
                            <Popover.Title as="h3">IPOP Network Visualizer : Configure</Popover.Title>
                            <Popover.Content id="configContent">
                                <div className="row">
                                    <div className="col">
                                        <label>Minimun zoom</label>
                                    </div>
                                    <div className="col">
                                        <select defaultValue={this.state.setMinZoom} onChange={this.handleSetMinZoom} id="minZoomSelector" value={this.state.minZoom}>
                                            <option id="0.2">0.2</option>
                                            <option id="1">1</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <label>Maximum zoom</label>
                                    </div>
                                    <div className="col">
                                        <select defaultValue={this.state.setMaxZoom} onChange={this.handleSetMaxZoom} id="maxZoomSelector" value={this.state.maxZoom}>
                                            <option>2</option>
                                            <option>5</option>
                                        </select>
                                    </div>
                                </div>
                                {/* <div className="row">
                                    <div className="col">
                                        <label>Zoom sensitivity</label>
                                    </div>
                                    <div className="col">
                                        <select onChange={this.handleSetZoomSensitive} id="zoomSensitiveSelector">
                                            <option>0.1</option>
                                            <option>1</option>
                                        </select>
                                    </div>
                                </div> */}
                            </Popover.Content>
                        </Popover>}>
                        <button onClick={this.handleConfigToggle} id="configBtn" className="leftToolsBtn"></button>
                    </OverlayTrigger>
                </div>
                <div>
                    <button onClick={this.zoomIn} id="plusBtn" className="leftToolsBtn"></button>
                </div>
                <div>
                    <input id="zoomSlider" onChange={this.handleZoomSlider} type="range" min={this.state.initMinZoom}
                        max={this.state.initMaxZoom} step={0.1} defaultValue={0.8}></input>
                </div>
                <div>
                    <button onClick={this.zoomOut} id="minusBtn" className="leftToolsBtn"></button>
                </div>

            </div>

            <section onWheel={this.handleWheel} id="midArea">
            </section>

            <RightPanel rightPanelTopic="Details"></RightPanel>

        </>
    }
}

export default GraphContent;