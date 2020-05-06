import React from "react";
import "../../CSS/SAGE2.css";
import ReactDOM from "react-dom";
import Cytoscape from 'react-cytoscapejs';
import "bootstrap/dist/css/bootstrap.min.css";
import "react-tippy/dist/tippy.css";
import RightPanel from "./RightPanel";
import CytoscapeStyle from './CytoscapeStyle';
import GoogleMapReact from "google-map-react";
import ElementsObj from '../Common/ElementsObj';
import Config from "../../Config/config";

class Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            nodes: [], links: [], initMinZoom: 0.2, initMaxZoom: 2, setMinZoom: 0.2, setMaxZoom: 2
            , renderGraph: false
            , currentSelectedElement: null
            , center: { lat: 13.736717, lng: 100.523186 }
            , zoom: 0
            , elementObj: null
            // , selectedOverlay: '104000F'

        }
        this.googleMapReact = React.createRef();
        window.graphComponent = this;
    }

    componentDidMount = () => {
        this.requestGraphProperty();
        // this.fetchData() /** For Test */
    }

    requestGraphProperty = () => {
        let packet = {
            nameOfComponent: `graphComponent`,
            callback: `responseGraphProperty`,
        }
        window.SAGE2_AppState.callFunctionInContainer(`requestGraphProperty`, packet);
    }

    responseGraphProperty = (packet) => {
        packet = JSON.parse(packet);
        this.setState({ selectedOverlay: packet.overlayId });
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
            this.createCytoscapeElement(packet).then(() => {
                this.renderGraph();
            })
                .then(() => {
                    console.log(JSON.stringify(this.cy.json()));
                    if (packet.targetId) {
                        var element = this.cy.elements(`#${packet.targetId}`);
                        this.setState({ currentSelectedElement: element });
                    }
                    this.cy.elements().style({ 'display': 'none' })
                    this.setState({ renderGraph: true })
                })
        })
    }

    fetchData = () => {
        var intervalNo = new Date().toISOString().split(".")[0];
        var serverIP = `${Config.IPOP.ip}:${Config.IPOP.port}`;
        var allowOrigin = 'https://cors-anywhere.herokuapp.com/';  /* you need to allow origin to get data from outside server*/
        var nodeURL = allowOrigin + "http://" + serverIP + "/IPOP/overlays/" + this.state.selectedOverlay + "/nodes?interval=" + intervalNo + "&current_state=True";
        var linkURL = allowOrigin + "http://" + serverIP + "/IPOP/overlays/" + this.state.selectedOverlay + "/links?interval=" + intervalNo + "&current_state=True";
        var elementObj = null;
        var overlay = this.state.selectedOverlay;
        console.log(nodeURL);
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
                return elementObj
            }).then((elementObj) => {
                this.setState({ elementObj: elementObj }, () => {
                    this.renderGraph();
                })
            })
                .then(() => {
                    this.setState({ renderGraph: true })
                })

        })
    }

    hasGeometric = (node) => {
        if (node.data('coordinate').split(',')[1]) return true;
        return false;
    }

    createCytoscapeElement = (packet) => {
        return new Promise((resolve, reject) => {
            try {
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

    handleMakerClicked = (node) => {
        console.log(node)
        var packet = {
            name: `SelectedFromMap`,
            data: {
                appId: `map`,
                targetId: node.data().id,
            }
        }
        window.SAGE2_AppState.callFunctionInContainer(`set`, packet);
        this.resetAnimation(this.state.currentSelectedElement);
        var center = { lat: parseFloat(node.data('coordinate').split(',')[0]), lng: parseFloat(node.data('coordinate').split(',')[1]) }
        this.setState({ currentSelectedElement: node, center: center, zoom: 10 }, () => {
            document.getElementById(`nodeMaker-${this.state.currentSelectedElement.data().id}`).classList.add(`selected`);
        })
    }

    handleSelectElement = (id) => {
        console.log('handleSelectElement');
        try {
            this.resetAnimation(this.state.currentSelectedElement);
            var element = this.cy.elements(`#${id}`);
            if (element.isNode()) {
                console.log('condition is node');
                if (this.hasGeometric(element)) {
                    var center = { lat: parseFloat(element.data('coordinate').split(',')[0]), lng: parseFloat(element.data('coordinate').split(',')[1]) }
                    this.setState({ center: center, zoom: 10, currentSelectedElement: element }, () => {
                        document.getElementById(`nodeMaker-${element.data().id}`).classList.add(`selected`);
                    })
                }
            }
            else {
                console.log('condition is link');
                /** New Version */
                var new_element = element.connectedNodes().filter(this.hasGeometric);
                if (new_element.length === 2) /** link has connected by 2 nodes and all has GEO. */ {
                    console.log('condition link 1');
                    var promise = new Promise((resolve, reject) => {
                        var center = {};
                        var zoom = 1;
                        var [lat1, lng1, lat2, lng2] = [element.connectedNodes()[0].data('coordinate').split(',')[0]
                            , element.connectedNodes()[0].data('coordinate').split(',')[1]
                            , element.connectedNodes()[1].data('coordinate').split(',')[0]
                            , element.connectedNodes()[1].data('coordinate').split(',')[1]];
                        var [lat, lng] = this.midpoint(parseFloat(lat1), parseFloat(lng1), parseFloat(lat2), parseFloat(lng2));
                        center = { lat: lat, lng: lng };
                        zoom = this.getZoomLevel(this.getDistanceBetweenPoints(lat1, lng1, lat2, lng2) * 0.001)
                        console.log(`Distance in Kilometers: ${this.getDistanceBetweenPoints(lat1, lng1, lat2, lng2) * 0.001}`);
                        resolve({ center, zoom });
                    })
                    promise.then((packet) => {
                        this.setState({ center: packet.center, zoom: packet.zoom, currentSelectedElement: element }, () => {
                            this.state.currentSelectedElement.connectedNodes().forEach((node) => {
                                document.getElementById(`nodeMaker-${node.data().id}`).classList.add(`selected`);
                            })
                        })
                    }).catch((e) => {
                        console.log(`Error handleSelectElement > ${e}`)
                    })
                }
                else if (new_element.length === 1)/** link has connected by 2 nodes but one of them has GEO. */ {
                    console.log('condition link 2');
                    this.handleSelectElement(new_element[0].data('id'));
                }
                else/** link has connected by 2 nodes but all of them not have GEO. */ {
                    console.log('condition link 3');
                    console.log(`${id} connected nodes which not have GEO.`)
                }

                /** Old Version */
                // var promise = new Promise((resolve, reject) => {
                //     var center = {};
                //     var zoom = 1;
                //     if (element.connectedNodes().length == 2) {
                //         var [lat1, lng1, lat2, lng2] = [element.connectedNodes()[0].data('coordinate').split(',')[0]
                //         , element.connectedNodes()[0].data('coordinate').split(',')[1]
                //         , element.connectedNodes()[1].data('coordinate').split(',')[0]
                //         , element.connectedNodes()[1].data('coordinate').split(',')[1]];
                //         var [lat, lng] = this.midpoint(parseFloat(lat1), parseFloat(lng1), parseFloat(lat2), parseFloat(lng2));
                //         center = { lat: lat, lng: lng };
                //         zoom = this.getZoomLevel(this.getDistanceBetweenPoints(lat1, lng1, lat2, lng2) * 0.001)
                //         console.log(`Distance in Kilometers: ${this.getDistanceBetweenPoints(lat1, lng1, lat2, lng2) * 0.001}`);
                //         resolve({ center, zoom });
                //     }
                //     else {
                //         reject('Error handleSelectElement > Edge connect more than 2 nodes.');
                //     }
                // })
                // promise.then((packet) => {
                //     this.setState({ center: packet.center, zoom: packet.zoom, currentSelectedElement: element }, () => {
                //         this.state.currentSelectedElement.connectedNodes().filter(this.hasGeometric).forEach((node) => {
                //             document.getElementById(`nodeMaker-${node.data().id}`).classList.add(`selected`);
                //         })
                //     })
                // }).catch((e) => {
                //     console.log(`Error handleSelectElement > ${e}`)
                // })
            }
        } catch (e) {
            console.log(`Error handleSelectElement > ${e}`)
        }
    }

    midpoint(lat1, lng1, lat2, lng2) {
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

    deg2rad(degrees) {
        return degrees * Math.PI / 180;
    };

    getDistanceBetweenPoints = (lat1, lng1, lat2, lng2) => {
        let R = 6378137 /** The radius of the planet earth in meters */
        let dLat = this.deg2rad(lat2 - lat1);
        let dLong = this.deg2rad(lng2 - lng1);
        let a = Math.sin(dLat / 2)
            *
            Math.sin(dLat / 2)
            +
            Math.cos(this.deg2rad(lat1))
            *
            Math.cos(this.deg2rad(lat1))
            *
            Math.sin(dLong / 2)
            *
            Math.sin(dLong / 2)
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let distance = R * c;
        return distance;
    }

    getZoomLevel = (distance) => {
        var zoom;
        if (distance > 0 && distance < 20) {
            zoom = 10;
        }
        else if (distance > 20 && distance < 100) {
            zoom = 9;
        }
        else if (distance > 100 && distance < 500) {
            zoom = 8;
        }
        else if (distance > 500 && distance < 1500) {
            zoom = 7;
        }
        else if (distance > 1500 && distance < 5000) {
            zoom = 5;
        }
        else {
            zoom = 1;
        }
        return zoom;

    }


    resetAnimation = (element) => {
        if (element) {
            if (element.isNode()) {
                document.getElementById(`nodeMaker-${element.data().id}`).classList.remove(`selected`);
            }
            else {
                element.connectedNodes().forEach((node) => {
                    document.getElementById(`nodeMaker-${node.data().id}`).classList.remove(`selected`);
                })
            }
        }
    }

    renderGraph = () => {
        ReactDOM.render(
            <Cytoscape id="cy"
                cy={(cy) => {
                    this.cy = cy;
                    var _this = this;
                }}
                elements={this.state.elementObj.getAllElementObj()}
                stylesheet={CytoscapeStyle}
                style={{ width: window.innerWidth, height: window.innerHeight }}
                layout={{ name: "circle" }}
            />
            , document.getElementById('cy'))
    }

    getRandomInRange(from, to, fixed) {
        return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    }

    handleGoogleApiLoaded = ({ map, maps }) => {
        console.log(`Render react-google-map completed...`);
        if (this.state.currentSelectedElement) {
            this.handleSelectElement(this.state.currentSelectedElement.data().id);
        }
    }

    render() {
        return (
            <>
                <div id="container" className="container-fluid">
                    <div id="mainContent" className="row" style={{ color: "white" }}>
                        <section id="midArea" className="col-9">
                            <div id="cy"></div>
                            {this.state.renderGraph ? (<>
                                <GoogleMapReact
                                    bootstrapURLKeys={{
                                        key: "AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs",
                                        language: 'en'
                                    }}
                                    //defaultCenter={this.state.center}
                                    center={this.state.center}
                                    defaultZoom={1}
                                    zoom={this.state.zoom}
                                    ref={this.googleMapReact}
                                    yesIWantToUseGoogleMapApiInternals
                                    onGoogleApiLoaded={this.handleGoogleApiLoaded}
                                >
                                    {this.cy.elements("node").filter(this.hasGeometric).map((node) => {
                                        return <button key={node.data('id') + `Maker`} onClick={this.handleMakerClicked.bind(this, node)}
                                            id={`nodeMaker-${node.data('id')}`} className="nodeMarker"
                                            lat={node.data('coordinate').split(',')[0]}
                                            lng={node.data('coordinate').split(',')[1]}>
                                            <label className="markerLabel">
                                                {node.data('label')}
                                            </label>
                                        </button>
                                    })}
                                </GoogleMapReact>
                            </>) : (<div className="loader">Loading...</div>)}
                        </section>
                    </div>
                </div>
            </>
        )
    }
}

export default Map;