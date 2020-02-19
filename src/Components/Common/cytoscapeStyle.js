var cytoscapeStyle = [
    {
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
        selector: "node.hide",
        style: {
            "background-color": "grey",
            "z-index": "0",
            "opacity": "0.3"
        }
    }, {
        selector: "edge",
        style: {
            "line-color": "data(color)",
            "width": "5%",
            "z-index": "3"
        }
    }, {
        selector: "edge.hide",
        style: {
            "line-color": "grey",
            "z-index": "0",
            "opacity": "0.3"
        }
    }, {
        selector: "edge:selected",
        style: {
            "z-index": "3"
        }
    }
]

export default cytoscapeStyle;