var cytoscapeStyle = [
    {
        selector: 'node',
        style: {
            width: "60%",
            height: "60%",
            "label": "data(label)",
            "text-valign": "center",
            "background-color": "#8AA626",
            "font-weight":"bold"
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
        selector: "edge.CETypeLongDistance",
        style: {
            "line-color": "#5E4FA2"
        }
    }, {
        selector: "edge:selected",
        style: {
            "width": "10%",
            "z-index": "3"
        }
    }, {
        selector: "edge.CETypeILongDistance",
        style: {
            "line-color": "#5E4FA2"
        }
    }, {
        selector: "edge.CETypePredecessor",
        style: {
            "line-color": "#01665E"
        }
    }, {
        selector: "edge.CETypeSuccessor",
        style: {
            "line-color": "#01665E"
        }
    }
]

export default cytoscapeStyle;