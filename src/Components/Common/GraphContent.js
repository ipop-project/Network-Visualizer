import React from "react";
import ReactDOM from "react-dom";
import RightPanel from "./RightPanel";
import Card from "react-bootstrap/Card";
import Cytoscape from 'react-cytoscapejs';
import ViewSelector from "./ViewSelector";
import CollapseButton from "./CollapseButton";
import cytoscapeStyle from "./cytoscapeStyle.js";
import { Typeahead } from "react-bootstrap-typeahead";
import CreateGraphContents from "./CreateGraphContents";

class GraphContent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            minZoom: 0.2,
            maxZoom: 2,
            zoom: 0.8,
            ipopData: null,
            graphElement: [],
            dataReady: false,
            refresh: false,
            cytoscape: null,
            switchToggle: false,
            nodeDetails: null,
            linkDetails: null,
            currentSelectedElement: null
        }
    }

    zoomIn = () => {
        this.setState(prevState => {
            return { zoom: prevState.zoom + 0.1 }
        })

    }

    zoomOut = () => {
        this.setState(prevState => {
            return { zoom: prevState.zoom - 0.1 }
        })
    }

    handleZoomSlider = (e) => {
        if (e.target.value > this.state.zoom) {
            console.log(parseFloat(e.target.value - this.state.zoom));
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate() {
        if (this.state.linkDetails !== null) {
            this.renderLinkDetails()
        }
        if (this.state.cytoscape !== null) {
            this.state.cytoscape.zoom(this.state.zoom)
            document.getElementById("zoomSlider").value = (this.state.zoom)
        }
    }

    renderNodeDetails = () => {

        var sourceNode = this.state.nodeDetails.sourceNode;
        var connectedNodes = this.state.nodeDetails.connectedNodes;

        var ipop = this.state.ipopData;

        var rightPanelContent = <div>

            <h5>{sourceNode.nodeName}</h5>

            <div className="DetailsLabel">Node ID</div>
            {sourceNode.nodeID}

            <div className="DetailsLabel">State</div>
            {sourceNode.nodeState}

            <div className="DetailsLabel">City/Country</div>
            {sourceNode.nodeLocation}
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
        ReactDOM.render(rightPanelContent, document.getElementById("rightPanelContent"))
    }

    renderLinkDetails = () => {

        var linkDetails = this.state.linkDetails.linkDetails;
        var sourceNodeDetails = this.state.linkDetails.sourceNodeDetails;
        var targetNodeDetails = this.state.linkDetails.targetNodeDetails;

        var linkContent = <div>
            <h5>{linkDetails.InterfaceName}</h5>

            <div className="row">

                <div className="col-10" style={{ paddingRight: "0" }}>

                    <CollapseButton className="sourceNodeBtn" key={sourceNodeDetails.nodeID + "Btn"} id={sourceNodeDetails.nodeID + "Btn"} name={sourceNodeDetails.nodeName}>

                        <div className="DetailsLabel">Node ID</div>
                        {sourceNodeDetails.nodeID}

                        <div className="DetailsLabel">State</div>
                        {sourceNodeDetails.nodeState}

                        <div className="DetailsLabel">City/Country</div>
                        {sourceNodeDetails.nodeLocation}

                    </CollapseButton>

                    <CollapseButton className="targetNodeBtn" key={targetNodeDetails.nodeID + "Btn"} id={targetNodeDetails.nodeID + "Btn"} name={targetNodeDetails.nodeName}>

                        <div className="DetailsLabel">Node ID</div>
                        {targetNodeDetails.nodeID}

                        <div className="DetailsLabel">State</div>
                        {targetNodeDetails.nodeState}

                        <div className="DetailsLabel">City/Country</div>
                        {targetNodeDetails.nodeLocation}

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
        </div>

        ReactDOM.render(linkContent, document.getElementById("rightPanelContent"))
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
                    linkDetails = that.state.ipopData.getLinkDetails(that.state.currentSelectedElement.data().target, that.state.currentSelectedElement.data().id);
                } else {
                    linkDetails = that.state.ipopData.getLinkDetails(that.state.currentSelectedElement.data().source, that.state.currentSelectedElement.data().id);
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
        }).catch(function (e) {

        })

    }

    setNodeDetails = (node) => {
        var sourceNode = this.state.ipopData.getNodeDetails(node.data().id);

        var connectedNodes = this.state.cytoscape.elements(node.incomers().union(node.outgoers())).filter((element) => {
            return element.isNode();
        });

        this.setState({ nodeDetails: { "sourceNode": sourceNode, "connectedNodes": connectedNodes } })

        this.renderNodeDetails();
    }

    setLinkDetails = (link) => {
        var linkDetails = this.state.ipopData.getLinkDetails(link.data().source, link.data().id);

        var sourceNode = link.data().source;

        var targetNode = link.data().target;

        var sourceNodeDetails = this.state.ipopData.getNodeDetails(link.data().target);

        var targetNodeDetails = this.state.ipopData.getNodeDetails(link.data().source);

        this.setState({ linkDetails: { "linkDetails": linkDetails, "sourceNode": sourceNode, "targetNode": targetNode, "sourceNodeDetails": sourceNodeDetails, "targetNodeDetails": targetNodeDetails } })

        this.renderLinkDetails();
    }

    renderGraph = () => {
        ReactDOM.render(<Cytoscape id="cy"
            cy={(cy) => {

                this.cy = cy;

                this.setState({ cytoscape: this.cy });

                this.cy.zoom(this.state.zoom);

                var that = this;

                this.cy.on("click", function (e) {
                    console.log(e.target);

                    if (e.target.length !== undefined) {

                        if (e.target.isNode()) {
                            that.setNodeDetails(e.target);
                        } else if (e.target.isEdge()) {
                            that.setLinkDetails(e.target)
                        }

                        that.setState({ currentSelectedElement: e.target })

                    }
                })


            }}

            elements={Cytoscape.normalizeElements({
                nodes: this.state.graphElement[0],
                edges: this.state.graphElement[1]
            })}

            stylesheet={cytoscapeStyle}

            style={{ width: window.innerWidth, height: window.innerHeight }}

            layout={{ name: "circle" }}

        />, document.getElementById("midArea"))

        ReactDOM.render(<ViewSelector />, document.getElementById("viewSelector"));


        ReactDOM.render(<Typeahead selectHintOnEnter id="searchGraphElement"
            selectHintOnEnter
            labelKey={(element) => { return (`${element.data().label}`); }}
            filterBy={this.elementFilter}
            options={this.state.cytoscape.elements().map(element => { return element; })}
            selected={this.state.selected}
            placeholder="Search node or tunnel"
            renderMenuItemChildren={(element) => {
                return (
                    <>
                        <div className="resultLabel">
                            {element.data().label}
                        </div>
                        <small>ID : {element.data().id}</small>
                    </>
                )
            }}

        >
        </Typeahead>, document.getElementById("searchOption"))
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
        var serverIP = '18.220.44.57:5000';
        var allowOrigin = 'https://cors-anywhere.herokuapp.com/';  /* you need to allow origin to get data from outside server*/

        var nodeURL = allowOrigin + "http://" + serverIP + "/IPOP/overlays/" + selectedOverlay + "/nodes?interval=" + intervalNo + "&current_state=True";
        var linkURL = allowOrigin + "http://" + serverIP + "/IPOP/overlays/" + selectedOverlay + "/links?interval=" + intervalNo + "&current_state=True";

        var ipop = new CreateGraphContents();
        var nodeConf = [];
        var linkConf = [];
        var targetConf, sourceConf;

        fetch(nodeURL).then(res => res.json()).then(nodes => {
            fetch(linkURL).then(res => res.json()).then(links => {
                ipop.init(this.props.selectedOverlay, nodes, links);
                this.setState({ ipopData: ipop });
            }).then(() => {
                ipop.getNodeIDs().forEach(nodeID => {
                    nodeConf.push(JSON.parse(`{ "data": { "id": "${nodeID}", "label": "${ipop.getNodeName(nodeID)}" ,"type":""} }`));

                    ipop.getLinkIDs(nodeID).forEach(linkID => {
                        sourceConf = ipop.getSourceNode(nodeID, linkID);
                        targetConf = ipop.getTargetNode(nodeID, linkID);

                        linkConf.push(JSON.parse(`{ "data": { "source": "${sourceConf}", "target": "${targetConf}","id":"${ipop.getLinkDetails(nodeID, linkID)["TunnelID"]}" ,"label":"${ipop.getLinkName(nodeID, linkID)}","type":"${ipop.getLinkObj()[nodeID][linkID]["Type"]}"} }`));

                    })
                });
                this.setState({ graphElement: [nodeConf, linkConf] })
                this.setState({ dataReady: true })
            }).then(() => {
                this.renderGraph()
            })
        })
    }

    handleWheel = (e) => {
        // if (e.deltaY > 0) {
        //     this.zoomOut();
        // } else {
        //     this.zoomIn();
        // }
    }

    render() {
        return <>
            <div id="leftTools" className="col-1">
                <div>
                    <button id="homeBtn"></button>
                </div>
                <div>
                    <button id="refreshBtn"></button>
                </div>
                <div>
                    <button id="infoBtn"></button>
                </div>
                <div>
                    <button id="configBtn"></button>
                </div>
                <div>
                    <button onClick={this.zoomIn} id="plusBtn"></button>
                </div>
                <div>
                    <input id="zoomSlider" onChange={this.handleZoomSlider} type="range" min={this.state.minZoom} max={this.state.maxZoom} step="0.1"></input>
                </div>
                <div>
                    <button onClick={this.zoomOut} id="minusBtn"></button>
                </div>
            </div>

            <section onWheel={this.handleWheel} id="midArea" className="col-9">
            </section>

            <RightPanel rightPanelTopic="Details"></RightPanel>

        </>
    }
}

export default GraphContent;
