var cytoscapeStyle = [{
    selector: 'node',
    style: {
        width: "60%",
        height: "60%",
        "label": "data(label)",
        "text-valign": "center",
        "background-color": "#8AA626",
        "font-weight": "bold"
    }
}, {
    selector: 'node:selected',
    style: {
        "border-width": "30%",
        "border-opacity": "0.3",
        "border-color": "#8AA626",
        "background-color": "#8AA626"
    }
}, {
    selector: "node.transparent",
    style: {
        "background-color": "grey",
        "z-index": "0",
        "opacity": "0.3"
    }
}, {
    selector:"node.subgraph",
    style:{
        "display":"none"
    }
},{
    selector: "edge",
    style: {
        "line-color": "data(color)",
        "width": "5%",
        "z-index": "3"
    }
}, {
    selector: "edge.transparent",
    style: {
        "line-color": "grey",
        "z-index": "0",
        "opacity": "0.3"
    }
},{
    selector:"edge.subgraph",
    style:{
        "display":"none"
    }
},{
    selector: "edge:selected",
    style: {
        "z-index": "3"
    }
}]

export default cytoscapeStyle;