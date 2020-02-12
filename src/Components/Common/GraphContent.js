import React from "react";
import ReactDOM from "react-dom";
import ViewSelector from "./ViewSelector";
import CreateGraphContents from "./CreateGraphContents";
import Cytoscape from 'react-cytoscapejs';
import RightPanel from "./RightPanel";
import CollapseButton from "./CollapseButton";
import Card from "react-bootstrap/Card";

class GraphContent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            nodeIDs: [], linkIDs: [], minZoom: 0.2, maxZoom: 2, zoom: 0.8, ipop: null,
            nodeConf: null, linkConf: null, dataReady: false, refresh: false, graph: null
        }
    }

    zoomIn = () => {
        if (this.state.zoom < this.state.maxZoom) {
            this.setState(prevState => {
                return { zoom: prevState.zoom + 0.1 }
            })
        }
        this.state.graph.zoom(this.state.zoom);
    }

    zoomOut = () => {
        if (this.state.zoom > this.state.minZoom) {
            this.setState(prevState => {
                return { zoom: prevState.zoom - 0.1 }
            })
        }
        this.state.graph.zoom(this.state.zoom);
    }

    handleZoomSlider = (e) => {
        var newZoom = e.target.value;
        this.setState(prevState => {
            if (prevState.zoom > newZoom) {
                return { zoom: prevState.zoom - (this.state.zoom - newZoom) };
            }
            else if (prevState.zoom < newZoom) {
                return { zoom: prevState.zoom + (newZoom - this.state.zoom) }
            }
        })
    }

    componentDidMount() {
        this.fetchData();
        ReactDOM.render(<ViewSelector />, document.getElementById("viewSelector"))
    }

    componentDidUpdate() {
        if (this.state.dataReady) {
            if (this.state.refresh) {
                this.renderGraph(this.state.nodeConf, this.state.linkConf)
            }
        }
    }

    renderGraph = (nodeConf, linkConf) => {
        var ipop = this.state.ipop;
        ReactDOM.render(<Cytoscape id="cy"
            cy={(cy) => {
                this.cy = cy;
                this.setState({ graph: this.cy });

                this.cy.zoom(this.state.zoom);

                this.cy.center();

                this.cy.panningEnabled(false)

                this.cy.on("click", function (e) {
                    if (e.target.length === undefined) {
                        // var nodeElement = document.createElement("DIV");
                        // document.getElementById("rightPanel").childNodes[2].replaceWith(nodeElement)
                    }
                })

                this.cy.on("click", "node", function (e) {

                    var connectedNodes = cy.elements(e.target.incomers().intersection(e.target.outgoers()));
                    connectedNodes.forEach(ele=>{
                        console.log(ele.isNode());
                    })
                    

                    var nodeDetails = ipop.getNodeDetails(e.target.id());
                    var rightPanelContent = <div>
                        <h5>{nodeDetails.nodeName}</h5>

                        <div className="DetailsLabel">Node ID</div>
                        {nodeDetails.nodeID}

                        <div className="DetailsLabel">State</div>
                        {nodeDetails.nodeState}

                        <div className="DetailsLabel">City/Country</div>
                        {nodeDetails.nodeLocation}

                        <div id="connectedNode" style={{ overflow: "auto" }}>
                            {connectedNodes.map(connectedNode => {
                                var connectedNodeDetail = ipop.findConnectedNodeDetails(nodeDetails.nodeID, connectedNode.id())
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
                })

                this.cy.on("click","edge",function(e){
                    var linkDetails = ipop.getLinkDetails(e.target.data().source,e.target.data().linkID);

                    var linkContent = <div>

                        <CollapseButton></CollapseButton>

                        <h5>{linkDetails.InterfaceName}</h5>

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
                })

            }}

            elements={Cytoscape.normalizeElements({
                nodes: nodeConf,
                edges: linkConf
            })}

            stylesheet={[
                {
                    selector: 'node',
                    style: {
                        width: 36.37,
                        height: 36.37,
                        "background-color": "#9FC556",
                        "label": "data(label)",
                        "text-valign": "center",
                        "text-outline-color": "#9FC556",
                        "text-outline-width": "5%",
                        "text-outline-opacity": "1"
                    }

                }, {
                    selector: "node:selected",
                    style: {
                        width: 36.37,
                        height: 36.37,
                        "border-width": "50%",
                        "border-color": "white",
                        "border-opacity": "0.2",
                        "background-color": "#9FC556"
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'curve-style': 'haystack',
                        "line-color": "#56C5BC",
                    }
                }, {
                    selector: "edge:selected",
                    style: {
                        "line-color": "white",
                    }
                }
            ]}

            style={{ width: window.innerWidth, height: window.innerHeight }}

            layout={{ name: "circle" }}
        />, document.getElementById("midArea"))

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
        var targetConf, sourceConf;
        var linkConf = [];

        fetch(nodeURL).then(res => res.json()).then(nodes => {
            fetch(linkURL).then(res => res.json()).then(links => {
                ipop.init(this.props.selectedOverlay, nodes, links);
                this.setState({ ipop: ipop });
            }).then(() => {
                ipop.getNodeIDs().forEach(nodeID => {
                    nodeConf.push(JSON.parse(`{ "data": { "id": "${nodeID}", "label": "${ipop.getNodeName(nodeID)}" } }`));

                    ipop.getLinkIDs(nodeID).forEach(linkID => {
                        sourceConf = ipop.getSourceNode(nodeID, linkID);
                        targetConf = ipop.getTargetNode(nodeID, linkID);

                        linkConf.push(JSON.parse(`{ "data": { "source": "${sourceConf}", "target": "${targetConf}","linkID":"${ipop.getLinkDetails(nodeID,linkID)["TunnelID"]}" } }`));
                    })
                });
                this.setState({ nodeConf: nodeConf, linkConf: linkConf })
                this.setState({ dataReady: true })
            }).then(() => {
                this.renderGraph(this.state.nodeConf, this.state.linkConf)
            })
        })
    }

    handleWheel = (e) => {
        if (e.deltaY > 0) {
            this.zoomOut();
        } else {
            this.zoomIn();
        }
    }

    render() {
        return <>
            <div id="leftTools" className="col-1">
                <button id="homeBtn"></button>
                <button id="refreshBtn"></button>
                <button id="infoBtn"></button>
                <button id="configBtn"></button>
                <button onClick={this.zoomIn} id="plusBtn"></button>
                <div id="zoomSlider">
                    <input onChange={this.handleZoomSlider} type="range" min={this.state.minZoom} max={this.state.maxZoom} step="0.1" value={this.state.zoom}></input>
                </div>
                <button onClick={this.zoomOut} id="minusBtn"></button>
            </div>

            <section onWheel={this.handleWheel} id="midArea" className="col-9">
            </section>

            <RightPanel rightPanelTopic="Details"></RightPanel>

        </>
    }
}

export default GraphContent;
