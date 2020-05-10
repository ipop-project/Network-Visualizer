import React from "react";
import "../../CSS/SAGE2.css";
import ReactDOM from "react-dom";
import Cytoscape from 'react-cytoscapejs';
import CollapseButton from "../Common/CollapsibleButton";
import Card from "react-bootstrap/Card";
import RightPanel from "./RightPanel";
import CytoscapeStyle from './CytoscapeStyle';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Select from "react-select";
import Config from "../../Config/config";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-tippy/dist/tippy.css";
import ElementsObj from '../Common/ElementsObj';

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initMinZoom: 0.2, initMaxZoom: 2, setMinZoom: 0.2, setMaxZoom: 2
            , elementObj: null
            , isShowRightPanel: false
            , isAutoRefresh: false
            , nodeDetails: null
            , linkDetails: null
            , currentSelectedElement: null
            , graphType: null
            , multiWindowState: false
            , targetId: null
            , viewSelector: { label: "Topology", value: "Topology" } /** Deault view */
            , selectedOverlay: '104000F', graphType: 'main' /** For React test */
        };
        this.viewOptions = [
            { label: "Topology", value: "Topology" },
            { label: "Subgraph", value: "Subgraph" },
            // { label: "Map", value: "Map" },
        ]
        this.miniZoom = [
            { label: "0.2", value: "0.2" },
            { label: "1", value: "1" },
        ]
        this.maxZoom = [
            { label: "2", value: "2" },
            { label: "5", value: "5" },
        ]
        this.timer = null;
        this.customStyles = {
            control: styles => ({ ...styles }),
            option: (provided) => {
                return {
                    ...provided,
                    'font-size': '30px',
                };
            },
            singleValue: (provided, state) => {
                return {
                    ...provided,
                    'font-size': '30px',
                };
            },
        };
        window.graphComponent = this;
    }

    zoomIn = () => {
        try {
            var currentZoom = this.cy.zoom();
            this.cy.zoom(currentZoom + 0.1);
            document.getElementById('zoomSlider').value = (this.cy.zoom());
        }
        catch (e) {
            console.log('Cytoscape is not ready...');
        }
    }

    zoomOut = () => {
        try {
            var currentZoom = this.cy.zoom();
            this.cy.zoom(currentZoom - 0.1);
            document.getElementById('zoomSlider').value = (this.cy.zoom());
        } catch (e) {
            console.log('Cytoscape is not ready...');
        }
    }

    componentDidMount() {
        this.fetchData();
        this.toggleRightPanel(true);
        // this.requestGraphProperty();
        this.requestToolProperty();
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    /**
     * Section of method `request` && `respone` method for cummunicate SAGE2.
     * Includes >
     * @method requestGraphProperty
     * @method responseGraphProperty
     * @method requestToolProperty
     * @method responseToolProperty
     */

    /**
     * Method to reqest graph property from SAGE2.
     * 
     * @method requestGraphProperty
     */
    requestGraphProperty = () => {
        let packet = {
            nameOfComponent: `graphComponent`,
            callback: `responseGraphProperty`,
        }
        window.SAGE2_AppState.callFunctionInContainer(`requestGraphProperty`, packet);
    }

    /**
     * Method callback to get graph property from SAGE2.
     * 
     * @method responseGraphProperty
     */
    responseGraphProperty = (packet) => {
        packet = JSON.parse(packet);
        this.setState({ selectedOverlay: packet.overlayId, graphType: packet.graphType });
        if (packet.graphType === 'main') {
            var value = {
                width: 1280,
                height: 960,
                sage2w: 3840,
                sage2h: 2160,
            }
            window.SAGE2_AppState.callFunctionInContainer('setWindowSize', value);
            this.fetchData();
        }
        else {
            var promise = new Promise((resolve, reject) => {
                var value = {
                    width: 1024,
                    height: 768,
                    sage2w: 3840,
                    sage2h: 2160,
                }
                window.SAGE2_AppState.callFunctionInContainer('setWindowSize', value);
                resolve(true);
            })

            promise.then(() => {
                this.createSubGraph(packet).then((value) => {
                    this.setState({ renderGraph: true, targetId: packet.targetId, viewSelector: { label: "Subgraph", value: "Subgraph" } });
                    this.renderGraph();
                }).then(() => {
                    if (packet.targetId) {
                        this.handleSelectCyElement(packet.targetId);
                    }
                })
                    .catch((e) => {
                        console.log(`Error Message: ${e}`);
                    });
            })
        }
        this.setState({ graphType: packet.graphType });
    }

    /**
     * Method call for get Tool property data (mulitiState, etc.) from SAGE2 application.
     * 
     * @method requestToolProperty
     */
    requestToolProperty = () => {
        var packet = {
            func: `MultiState`,
            data: {
                nameOfComponent: `graphComponent`,
                callback: `responseToolProperty`,
            }
        }
        window.SAGE2_AppState.callFunctionInContainer(`request`, packet);

    }

    /**
     * Method for call back when SAGE2 send Tool property data (multiState, etc.)
     * 
     * @method responseToolProperty
     */
    responseToolProperty = (packet) => {
        packet = JSON.parse(packet);
        this.setState({ multiWindowState: packet.multiWindowState }, () => {
            if (this.state.graphType === 'main' && this.state.currentSelectedElement) {
                this.handleSelectCyElement(this.state.currentSelectedElement.id());
            }
        })
    }

    /**
     * End section of method `request` && `respone`.
     */

    /**
     * Section of method `create`.
     * Includes >
     * @method createSubGraph
     * @method createEdgeDetail
     * @method createNodeDetail
     */

    /**
     * Method create sub graph from window which is sub graph type.
     * 
     * @method createSubGraph
     */
    createSubGraph = (packet) => {
        return new Promise((resolve, reject) => {
            try {
                //delete this.viewOptions[0]; /** Remove Topology view from Subgraph view select options. */
                var elementObj = null;
                var overlay = this.state.selectedOverlay;
                var nodesJSON = packet.nodes;
                var linksJSON = packet.links;

                elementObj = new ElementsObj(nodesJSON[overlay]['current_state'], linksJSON[overlay]['current_state'])

                var nodes = nodesJSON[overlay]['current_state']

                Object.keys(nodes).sort().forEach((nodeID) => {

                    // graphElement.push(JSON.parse(`{"group":"nodes","data": {"id": "${nodeID}","label": "${nodes[nodeID].NodeName}","state":"","type":""}}`))
                    elementObj.addNodeElement(nodeID)

                    var links = linksJSON[overlay]['current_state'][nodeID]

                    Object.keys(links).forEach(linkID => {
                        // graphElement.push(JSON.parse(`{"group":"edges","data": { "id":"${linkID}" ,"label":"${links[linkID]['InterfaceName']}","source": "${links[linkID]['SrcNodeId']}","target": "${links[linkID]['TgtNodeId']}","state":"","type":"${links[linkID]['Type']}"}}`))
                        elementObj.addLinkElement(nodeID, linkID)
                    })

                })
                this.setState({ elementObj: elementObj });

                resolve(true);
            }
            catch (e) {
                console.log(`fail:${e}`);
                reject(false);
            }
        })
    }

    /**
     * Method to create node detail in right panel.
     * 
     * @method createNodeDetail
     */
    createNodeDetail = (flag) => {
        var rightPanelContent;
        if (flag) {
            var sourceNode = this.state.nodeDetails.sourceNode;
            var connectedNodes = this.state.nodeDetails.connectedNodes;
            var coordinate = this.state.currentSelectedElement.data('coordinate').split(',');
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate[0]},${coordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
                .then(res => res.json()).then((data) => {
                    try {
                        return data.results[data.results.length - 1].formatted_address;
                    }
                    catch (e) {
                        return '-';
                    }
                }).then((location) => {
                    rightPanelContent = <div id="elementDetails">
                        <h2>{sourceNode.name}</h2>
                        <div className="DetailsLabel">Node ID</div>
                        {sourceNode.id}
                        <div className="DetailsLabel">State</div>
                        {sourceNode.state}
                        <div className="DetailsLabel">City/State/Country</div>
                        {/* {sourceNode.location} wait for real data. */}
                        {location}
                        <br /><br />
                        <div id="connectedNode">
                            {connectedNodes.map(connectedNode => {
                                try {
                                    var connectedNodeDetail = this.state.elementObj.getConnectedNodeDetails(sourceNode.id, connectedNode.id())
                                    var connectedNodeBtn =
                                        <CollapseButton className='connectedNodeBtn' key={connectedNode.data('id') + "Btn"} id={connectedNode.data('id') + "Btn"} name={connectedNode.data('label')}>
                                            <div className="DetailsLabel">Node ID</div>
                                            {connectedNode.id()}
                                            <div className="DetailsLabel">Tunnel ID</div>
                                            {connectedNodeDetail.id}
                                            <div className="DetailsLabel">Interface Name</div>
                                            {connectedNodeDetail.name}
                                            <div className="DetailsLabel">MAC</div>
                                            {connectedNodeDetail.MAC}
                                            <div className="DetailsLabel">State</div>
                                            {connectedNodeDetail.state}
                                            <div className="DetailsLabel">Tunnel Type</div>
                                            {connectedNodeDetail.type}
                                            <div className="DetailsLabel">ICE Connection Type</div>
                                            {/* {connectedNodeDetail.ICEConnectionType} */}
                                                -
                                            <div className="DetailsLabel">ICE Role</div>
                                            {connectedNodeDetail.stats.IceProperties.role}
                                            <div className="DetailsLabel">Remote Address</div>
                                            {connectedNodeDetail.RemoteAddress}
                                            <div className="DetailsLabel">Local Address</div>
                                            {connectedNodeDetail.LocalAddress}
                                            <div className="DetailsLabel">Latency</div>
                                            {connectedNodeDetail.stats.IceProperties.latency}
                                            <Card.Body className="transmissionCard">
                                                Sent
                                            <div className="DetailsLabel">Byte Sent</div>
                                                {connectedNodeDetail.stats.byte_sent}
                                                <div className="DetailsLabel">Total Byte Sent</div>
                                                {connectedNodeDetail.stats.total_byte_sent}
                                            </Card.Body>
                                            <Card.Body className="transmissionCard">
                                                Received
                                            <div className="DetailsLabel">Byte Received</div>
                                                {connectedNodeDetail.stats.byte_receive}
                                                <div className="DetailsLabel">Total Byte Received</div>
                                                {connectedNodeDetail.state.total_byte_receive}
                                            </Card.Body>
                                        </CollapseButton>
                                    return connectedNodeBtn;
                                } catch (e) {
                                    console.log(`Error createNodeDetail > ${e}`);
                                }
                            })}
                        </div>
                    </div>
                    this.toggleRightPanel(false);

                }).then(() => {
                    ReactDOM.render(rightPanelContent, document.getElementById("rightPanelContent"));
                }).catch((e) => {
                    console.log(`Error createNodeDetail > ${e.message}`);
                })
        }
        else {
            rightPanelContent = <div></div>
            this.toggleRightPanel(true);
            ReactDOM.render(rightPanelContent, document.getElementById("rightPanelContent"));
        }
        //ReactDOM.render(rightPanelContent, document.getElementById("rightPanelContent"));
    }

    /**
     * Method to create edge detail in right panel.
     * 
     * @method createEdgeDetail
     */
    createEdgeDetail = (flag) => {
        var rightPanelContent;
        if (flag) {
            var linkDetails = this.state.linkDetails.linkDetails;
            var sourceNodeDetails = this.state.linkDetails.sourceNode;
            var targetNodeDetails = this.state.linkDetails.targetNode;

            const srcNode = this.state.currentSelectedElement.connectedNodes().filter((element) => {
                return element.data('id') == sourceNodeDetails.id
            })

            const tgtNode = this.state.currentSelectedElement.connectedNodes().filter((element) => {
                return element.data('id') == targetNodeDetails.id
            })

            const srcCoordinate = srcNode.data().coordinate.split(',')
            const tgtCoordinate = tgtNode.data().coordinate.split(',')

            /** For test in demo location wait for real data. */
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${srcCoordinate[0]},${srcCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
                .then(res => res.json()).then(data => {
                    try {
                        return data.results[data.results.length - 1].formatted_address;
                    }
                    catch (e) {
                        return '-';
                    }
                }).then(sourceLocation => {
                    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${tgtCoordinate[0]},${tgtCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
                        .then(res => res.json()).then(data => {
                            try {
                                return data.results[data.results.length - 1].formatted_address;
                            }
                            catch (e) {
                                return '-';
                            }
                        }).then(targetLocation => {
                            rightPanelContent = <div id='elementDetails'>
                                <h2>{linkDetails.InterfaceName}</h2>

                                <div className="row">

                                    <div className="col-10" style={{ paddingRight: "0" }}>

                                        <CollapseButton className="sourceNodeBtn" style={{marginBottom:'2.5%'}} key={sourceNodeDetails.id + "Btn"} id={sourceNodeDetails.id + "Btn"} name={sourceNodeDetails.name}>

                                            <div className="DetailsLabel">Node ID</div>
                                            {sourceNodeDetails.id}

                                            <div className="DetailsLabel">State</div>
                                            {sourceNodeDetails.state}

                                            <div className="DetailsLabel">City/State/Country</div>
                                            {/* {sourceNodeDetails.nodeLocation} */}
                                            {sourceLocation}

                                        </CollapseButton>

                                        <CollapseButton className="targetNodeBtn" style={{marginBottom:'2.5%'}} key={targetNodeDetails.id + "Btn"} id={targetNodeDetails.id + "Btn"} name={targetNodeDetails.name}>

                                            <div className="DetailsLabel">Node ID</div>
                                            {targetNodeDetails.id}

                                            <div className="DetailsLabel">State</div>
                                            {targetNodeDetails.state}

                                            <div className="DetailsLabel">City/State/Country</div>
                                            {/* {targetNodeDetails.nodeLocation} */}
                                            {targetLocation}

                                        </CollapseButton>

                                    </div>

                                    <div className="col" style={{ margin: "auto", padding: "0", textAlign: "center" }}>
                                        <button onClick={this.handleSwitch.bind(this, sourceNodeDetails, targetNodeDetails, linkDetails)} id="switchBtn" />
                                    </div>

                                </div>

                                <div className="DetailsLabel">Tunnel ID</div>
                                {linkDetails.id}
                                <div className="DetailsLabel">Interface Name</div>
                                {linkDetails.name}
                                <div className="DetailsLabel">MAC</div>
                                {linkDetails.MAC}
                                <div className="DetailsLabel">State</div>
                                {linkDetails.state}
                                <div className="DetailsLabel">Tunnel Type</div>
                                {linkDetails.type}
                                <div className="DetailsLabel">ICE Connection Type</div>
                                {/* {linkDetails.ICEConnectionType} */}
                                -
                                <div className="DetailsLabel">ICE Role</div>
                                {linkDetails.stats.IceProperties.role}
                                <div className="DetailsLabel">Remote Address</div>
                                {linkDetails.RemoteAddress}
                                <div className="DetailsLabel">Local Address</div>
                                {linkDetails.LocalAddress}
                                <div className="DetailsLabel">Latency</div>
                                {linkDetails.stats.IceProperties.latency}
                                <br /><br />

                                <Card.Body className="transmissionCard">
                                    Sent
                            <div className="DetailsLabel">Byte Sent</div>
                                    {linkDetails.stats.byte_sent}
                                    <div className="DetailsLabel">Total Byte Sent</div>
                                    {linkDetails.stats.total_byte_sent}
                                </Card.Body>

                                <Card.Body className="transmissionCard">
                                    Received
                            <div className="DetailsLabel">Byte Received</div>
                                    {linkDetails.stats.byte_receive}
                                    <div className="DetailsLabel">Total Byte Received</div>
                                    {linkDetails.stats.total_byte_receive}
                                </Card.Body>

                            </div>
                            this.toggleRightPanel(false);

                        })
                        .then(() => {
                            ReactDOM.render(rightPanelContent, document.getElementById("rightPanelContent"));
                        })
                })
        }
        else {
            rightPanelContent = <div></div>
            this.toggleRightPanel(true);
        }
        ReactDOM.render(rightPanelContent, document.getElementById("rightPanelContent"));
    }
    /**
     * End section of method `create`
     */

    setOverlayElements = (nodes, links) => {
        let packet = {
            name: `OverlayElements`,
            data: {
                nodes,
                links,
            },
        }
        window.SAGE2_AppState.callFunctionInContainer(`set`, packet);
    }

    setDataForSearch = (element) => {
        let packet = {
            name: 'DataForSearch',
            data: {
                element
            },
        }
        window.SAGE2_AppState.callFunctionInContainer(`set`, packet);
    }

    /**
     * Method for get IPOP data from IPOP server.
     * 
     * @method fetchData
     */
    fetchData = () => {
        var intervalNo = new Date().toISOString().split(".")[0];
        var serverIP = `${Config.IPOP.ip}:${Config.IPOP.port}`;
        var allowOrigin = 'https://cors-anywhere.herokuapp.com/';  /* you need to allow origin to get data from outside server*/
        var nodeURL = allowOrigin + "http://" + serverIP + "/IPOP/overlays/" + this.state.selectedOverlay + "/nodes?interval=" + intervalNo + "&current_state=True";
        var linkURL = allowOrigin + "http://" + serverIP + "/IPOP/overlays/" + this.state.selectedOverlay + "/links?interval=" + intervalNo + "&current_state=True";

        // var nodeURL = "http://" + serverIP + "/IPOP/overlays/" + this.state.selectedOverlay + "/nodes?interval=" + intervalNo + "&current_state=True";
        // var linkURL = "http://" + serverIP + "/IPOP/overlays/" + this.state.selectedOverlay + "/links?interval=" + intervalNo + "&current_state=True";

        var elementObj = null;
        var overlay = this.state.selectedOverlay;

        /** new fetch for influxDB */
        fetch(nodeURL).then(res => res.json()).then(nodesJSON => {

            fetch(linkURL).then(res => res.json()).then(linksJSON => {

                elementObj = new ElementsObj(nodesJSON[overlay]['current_state'], linksJSON[overlay]['current_state'])

                var nodes = nodesJSON[overlay]['current_state']
                Object.keys(nodes).sort().forEach((nodeID) => {
                    // graphElement.push(JSON.parse(`{"group":"nodes","data": {"id": "${nodeID}","label": "${nodes[nodeID].NodeName}","state":"","type":""}}`))
                    elementObj.addNodeElement(nodeID)

                    var links = linksJSON[overlay]['current_state'][nodeID]
                    try {
                        Object.keys(links).forEach(linkID => {
                            // graphElement.push(JSON.parse(`{"group":"edges","data": { "id":"${linkID}" ,"label":"${links[linkID]['InterfaceName']}","source": "${links[linkID]['SrcNodeId']}","target": "${links[linkID]['TgtNodeId']}","state":"","type":"${links[linkID]['Type']}"}}`))
                            elementObj.addLinkElement(nodeID, linkID)
                        })
                    } catch (e) {
                        console.log(`${nodeID} has no tunnel.`)
                    }

                })
                this.setOverlayElements(nodesJSON, linksJSON);
                return elementObj
            }).then((elementObj) => {
                this.setState({ elementObj: elementObj, renderGraph: true }, () => {
                    this.renderGraph();
                })
            })
                .then(() => {
                    this.setDataForSearch(this.cy.json());
                })

        })
    }

    autoFetchData = () => {
        /** For auto refresh function */
    }

    /**
     * Section of `handle` method.
     * Includes >
     * @method handleClickCyElement @method handleSelectCyElement @method handleSwitch
     * @method handleZoomSlider @method handleMouseOverPage @method handleConfigToggle
     */

    /**
     * Method handle selected element when action is from inside.
     * 
     * @method handleClickCyElement
     */
    handleClickCyElement = (id) => {
        switch (this.state.graphType) {
            case 'main':
                var packet = {
                    //url: 'http://150.29.149.79:3000/graph', /** IP for React client server */
                    url: `${Config.React.perfix}${Config.React.ip}:${Config.React.port}/#/SAGE2_graph`,
                    targetId: id,
                    targetLabel: this.state.currentSelectedElement.data('label'),
                    overlayId: this.state.selectedOverlay,
                    type: 'subGraph',
                }
                if (this.state.multiWindowState) { window.SAGE2_AppState.callFunctionInContainer('openGraph', packet) };
                var packet4map = {
                    appId: `map`,
                    nameOfComponent: `graphComponent`,
                    callback: `handleSelectElement`,
                    targetId: this.state.currentSelectedElement.data().id,
                }
                window.SAGE2_AppState.callFunctionInContainer(`sendSelectNodeToMap`, packet4map);
                break;
            case 'sub':
                if (this.state.currentSelectedElement) {
                    var packet = {
                        name: `SelectedFromSub`,
                        data: {
                            oldTargetId: this.state.targetId,
                            newTargetId: this.state.currentSelectedElement.id(),
                            newTargetLabel: this.state.currentSelectedElement.data('label'),
                        }
                    }
                    this.setState(prevState => {
                        return { targetId: prevState.currentSelectedElement.id() }
                    }, () => {
                        window.SAGE2_AppState.callFunctionInContainer('set', packet);
                    })
                }
                break;
        }
    }

    /**
     * Method handle selected element when action is from outside (like from main graph.).
     * 
     * @method handleSelectCyElement
     */
    handleSelectCyElement = (id) => {
        try {
            var element = this.cy.elements(`#${id}`);
            element.select();
            element.trigger('click');
        }
        catch (e) {
            console.log('Cytoscape Not Ready...');
        }
    }

    /**
     * Method to handle slider zoom.
     * 
     * @method handleZoomSlider
     */
    handleZoomSlider = (e) => {
        try {
            this.cy.zoom(parseFloat(e.target.value));
        } catch (e) {
            console.log('Cytoscape is not ready...  ');

        }
    }

    /**
     * Method to handle switch button in right panel.
     * 
     * @method handleSwitch
     */
    handleSwitch = (sourceNodeDetails, targetNodeDetails, linkDetails) => {
        var sourceNode = targetNodeDetails;
        var targetNode = sourceNodeDetails;
        linkDetails = this.state.elementObj.getLinkDetails(targetNodeDetails.id, linkDetails.id)
        this.setState({ linkDetails: { linkDetails, sourceNode, targetNode } }, () => {
            this.createEdgeDetail(true);
        });
    }

    /**
     * Mthod handle when mouse over on cytoscape.
     * 
     * @method handleMouseOverPage
     */
    handleMouseOverPage = (e) => {
        if (this.state.graphType === 'sub' && this.state.currentSelectedElement)
            this.handleClickCyElement(this.state.currentSelectedElement.id());
    }

    handleSetMinZoom = (e) => {
        if (this.cy) {
            try {
                this.cy.minZoom(parseFloat(e.value));
                document.getElementById("zoomSlider").min = parseFloat(e.value);
            } finally {
                if (this.cy.zoom() < parseFloat(e.value)) {
                    this.cy.zoom(parseFloat(e.value));
                }
                this.setState({ setMinZoom: e.value })
            }
        }
    }

    handleSetMaxZoom = (e) => {
        if (this.cy) {
            try {
                this.cy.maxZoom(parseFloat(e.value));
                document.getElementById("zoomSlider").max = parseFloat(e.value);
            } finally {
                if (this.cy.zoom() > parseFloat(e.value)) {
                    this.cy.zoom(parseFloat(e.value));
                }
                this.setState({ setMaxZoom: e.value })
            }
        }
    }

    handleViewSelector = (e) => {
        if (this.cy) {
            this.cy.elements().removeClass(this.state.viewSelector.value);
            this.cy.elements().removeClass('selected');
        }
        var prevView = null;
        this.setState((prev) => {
            prevView = prev.viewSelector.value;
            return { viewSelector: e };
        }, () => {
            try {
                this[`render${e.value}View`](prevView);
            }
            catch (e) {
                console.log(e.message);
            }
        })
    }

    handleWheel = (e) => {
        try {
            document.getElementById("zoomSlider").value = (this.cy.zoom());
        } catch (e) {
            console.log(`Error func handleWheel > ${e.message}`)
        }
    }

    handleMakerClicked = (node) => {
        node.trigger('click');
    }

    handleRefresh = () => {
        try {
            this.cy.zoom(0.8);
            document.getElementById('zoomSlider').value = this.cy.zoom();
            this.cy.center();
        } catch (e) {
            console.log(`Error func handleRefresh > ${e.message}`)
        }
    }

    handleAutoRefresh = () => {
        this.setState(prevState => {
            return { isAutoRefresh: !prevState.isAutoRefresh }
        }, () => {
            if (this.state.isAutoRefresh) {
                this.timer = setInterval(() => {
                    try {
                        /** some action. */
                    } catch (error) {
                        console.log(`Error func handleAutoRefresh > ${error}`)
                    }
                }, 1000)
            }
            else {
                clearInterval(this.timer);
            }
        })
    }

    /**
     * End section `handle` method.
     */

    /**
	* Method called when click node elements on graph.
	*
	* @method eventClickNode
    */
    eventClickNode = (node) => {
        var sourceNode = this.state.elementObj.getNodeDetails(node.data('id'));
        var connectedNodes = this.cy.elements(node.incomers().union(node.outgoers())).filter((ele) => {
            return ele.isNode();
        })
        this.setState({
            nodeDetails: {
                'sourceNode': sourceNode, 'connectedNodes': connectedNodes,
            }
        }, () => {
            if (this.state.graphType === 'main') {
                if (!this.state.multiWindowState) this.createNodeDetail(true); /** Node Detail */
                else this.createNodeDetail(false);
            }
            else {
                this.createNodeDetail(true)
            }
            this.renderAnimationClicked(node);
        })
    }

    /**
	* Method called when click edge elements on graph.
	*
	* @method eventClickEdge
    */
    eventClickEdge = (edge) => {
        var [sourceNode, targetNode]
            = [this.state.elementObj.getNodeDetails(edge.data('source'))
                , this.state.elementObj.getNodeDetails(edge.data('target'))];
        var linkDetails = this.state.elementObj.getLinkDetails(sourceNode.id, edge.data('id'))
        this.setState({ linkDetails: { linkDetails, sourceNode, targetNode } },
            () => {
                if (this.state.graphType === 'main') {
                    if (!this.state.multiWindowState) this.createEdgeDetail(true); /** Edge Detail */
                    else this.createEdgeDetail(false);
                }
                else {
                    this.createEdgeDetail(true);
                }
                this.renderAnimationClicked(edge);
            })
    }

    /**
     * Method for toggle detail panel in the right page.
     * 
     * @method toggleRightPanel
     */
    toggleRightPanel = (flag) => {
        if (typeof flag === 'object' && flag !== null) {
            this.setState(prevState => {
                return { isShowRightPanel: !prevState.isShowRightPanel };
            }, () => {
                document.getElementById("rightPanel").hidden = this.state.isShowRightPanel;
            })
        }
        else {
            this.setState({ isShowRightPanel: flag }, () => {
                document.getElementById("rightPanel").hidden = this.state.isShowRightPanel
            })
        }
    }

    /**
     * Section of method render.
     */
    renderGraph = () => {
        ReactDOM.render(
            <Cytoscape id="cy"
                cy={(cy) => {
                    this.cy = cy;
                    var _this = this;
                    this.cy.maxZoom(this.state.initMaxZoom);
                    this.cy.minZoom(this.state.initMinZoom);
                    this.cy.zoom(0.8);
                    this.cy.center();
                    this.cy.on('click', (event) => {
                        if (event.target !== cy) {
                            /** reset style */
                            cy.elements().removeClass(this.state.viewSelector.value);
                            cy.elements().removeClass('selected');
                            var element = event.target;
                            _this.setState({ currentSelectedElement: element }, () => {
                                _this.handleClickCyElement(element.id()); /** for open sub graph */
                            })
                            if (element.isNode()) {
                                _this.eventClickNode(element);
                            }
                            else {
                                _this.eventClickEdge(element);
                            }
                        }
                        else {
                            if (_this.state.graphType === 'main') {
                                cy.elements().removeClass(this.state.viewSelector.value);
                                cy.elements().removeClass('selected');
                            }
                            else {
                                cy.elements().removeClass('selected');
                            }
                            _this.setState(prevState => {
                                return {
                                    currentSelectedElement: null,
                                }
                            })
                            _this.createNodeDetail(false);
                        }
                    })
                    this.cy.on('mouseover', (event) => {
                        event.preventDefault();
                        _this.handleMouseOverPage();
                    })
                }}
                elements={this.state.elementObj.getAllElementObj()}
                stylesheet={CytoscapeStyle}
                style={{ width: window.innerWidth, height: window.innerHeight }}
                layout={{ name: "circle" }}
            />
            , document.getElementById('midArea'))
    }

    renderAnimationClicked = (element) => {
        if (element) {
            if (this.state.viewSelector.value !== 'Map' || this.state.viewSelector.value !== 'Log') {
                if (element.isNode()) {
                    this.cy.elements().difference(element.outgoers().union(element.incomers())).not(element).addClass(this.state.viewSelector.value);
                }
                else {
                    this.cy.elements().difference(element.connectedNodes()).not(element).addClass(this.state.viewSelector.value);
                }
                element.addClass('selected');
            }
        }
    }

    renderTopologyView = () => {
        var promise = new Promise((resolve, reject) => {
            this.renderGraph();
            resolve(this.state.currentSelectedElement);
        })
        promise.then((value) => {
            try {
                value.trigger('click');
            } catch (e) {
            }
        })
    }

    renderSubgraphView = (prev) => {
        var promise = new Promise((resolve, reject) => {
            if (prev === `Map`) {
                this.renderGraph();
            }
            resolve(this.state.currentSelectedElement);
        })
        promise.then((value) => {
            try {
                value.trigger('click');
            } catch (e) {
                this.renderGraph();
            }
        })
    }

    /** For test random lat lng  */
    getRandomInRange(from, to, fixed) {
        return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    }

    /**
     * End section of method render.
     */

    render() {
        return <>
            <div id="container" className="container-fluid">
                <div id="mainContent" className="row" style={{ color: "white" }}>
                    <div id="leftTools" className="col-1">

                        <OverlayTrigger rootClose={true} trigger="click" placement="right" overlay={
                            <Popover >
                                <Popover.Title as="h3">IPOP Network Visualizer : View</Popover.Title>
                                <Popover.Content id="viewContent">
                                    <div>
                                        <Select
                                            styles={window.innerWidth > 1280 ? this.customStyles : ''}
                                            options={this.viewOptions}
                                            onChange={value => this.handleViewSelector(value)}
                                            value={this.state.viewSelector}
                                            defaultValue={this.state.viewSelector}
                                        />
                                    </div>
                                </Popover.Content>
                            </Popover>}>
                            <button id="viewBtn"></button>
                        </OverlayTrigger>

                        <OverlayTrigger rootClose={true} trigger="click" placement="right" overlay={
                            <Popover>
                                <Popover.Title as="h3">IPOP Network Visualizer : Configure</Popover.Title>
                                <Popover.Content id="configContent">
                                    <div className="row">
                                        <div className="col">
                                            <label>Minimun zoom</label>
                                        </div>
                                        <div className="col">
                                            <Select
                                                styles={window.innerWidth > 1280 ? this.customStyles : ''}
                                                options={this.miniZoom}
                                                onChange={value => this.handleSetMinZoom(value)}
                                                value={{ label: this.state.setMinZoom, value: this.state.minZoom }}
                                                defaultValue={{ label: this.state.setMinZoom, value: this.state.setMinZoom }}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <label>Maximum zoom</label>
                                        </div>
                                        <div className="col">
                                            <Select
                                                styles={window.innerWidth > 1280 ? this.customStyles : ''}
                                                options={this.maxZoom}
                                                onChange={value => this.handleSetMaxZoom(value)}
                                                value={{ label: this.state.setMaxZoom, value: this.state.maxZoom }}
                                                defaultValue={{ label: this.state.setMaxZoom, value: this.state.setMaxZoom }}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <label>Auto Refresh</label>
                                        </div>
                                        <div className="col">
                                            <input type="checkbox"
                                                className="autoRefreshCheck"
                                                defaultChecked={this.state.isAutoRefresh}
                                                onChange={this.handleAutoRefresh}
                                            ></input>
                                        </div>
                                    </div>
                                </Popover.Content>
                            </Popover>}>
                            <button onClick={this.handleConfigToggle} id="configBtn" className="leftToolsBtn"></button>
                        </OverlayTrigger>

                        <button onClick={this.handleRefresh} id="refreshBtn"></button>
                        <button onClick={this.zoomIn} id="plusBtn"></button>
                        <div>
                            <input id="zoomSlider" onChange={this.handleZoomSlider} type="range"
                                min={this.state.initMinZoom} max={this.state.initMaxZoom} step={0.1}
                                defaultValue={0.8}></input>
                        </div>
                        <button onClick={this.zoomOut} id="minusBtn"></button>
                    </div>
                    <section onWheel={this.handleWheel} id="midArea" className="col-9">
                        {this.state.renderGraph ? (<></>) : (<div className="loader">Loading...</div>)}
                    </section>
                    <button onClick={this.toggleRightPanel} id="overlayRightPanelBtn" />
                    <RightPanel rightPanelTopic='Details'></RightPanel>
                </div>
            </div>
        </>
    }

}

export default Graph;