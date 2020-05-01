export default class ElementsObj {

    constructor(nodes, links) {
        var raw_nodes = nodes
        var raw_links = links
        var elementObj = [];

        this.addNodeElement = (id) =>{
            const nodeDetails = this.getNodeDetails(id)
            elementObj.push(JSON.parse(`{"group":"nodes","data": {"id": "${nodeDetails.id}","label": "${nodeDetails.name}","state":"","type":""}}`));
        }

        this.addLinkElement = (src,id) =>{
            const linkDetails = this.getLinkDetails(src,id)
            elementObj.push(JSON.parse(`{"group":"edges","data": { "id":"${linkDetails.id}" ,"label":"${linkDetails.name}","source": "${linkDetails.source}","target": "${linkDetails.target}","state":"","type":"${linkDetails.type}"}}`));
        }

        this.getAllElementObj = () =>{
            return elementObj
        }

        this.getNodeDetails = (id) => {
            var nodeDetails = {
                "name": raw_nodes[id].NodeName,
                "id": id,
                "state": '-',
                "location": '-',
                "raw_data":raw_nodes
            }

            return nodeDetails
        }

        this.getLinkDetails = (src, id) => {
            var linkDetails = {
                "name": raw_links[src][id].InterfaceName,
                "id": id,
                "MAC": raw_links[src][id].MAC,
                "state": raw_links[src][id].State,
                "type": raw_links[src][id].Type,
                "ICEConnectionType": '-',
                "ICERole": '-',
                "remoteAdress": '-',
                "localAddress": '-',
                "latency": '-',
                "stats": raw_links[src][id].Stats,
                "source":raw_links[src][id]['SrcNodeId'],
                "target":raw_links[src][id]['TgtNodeId'],
                "raw_data":raw_links
            }

            return linkDetails
        }

        this.getConnectedNodeDetails = (src, tgt) => {
            var connectedNodeDetails

            Object.keys(raw_links[src]).forEach(link => {
                if (raw_links[src][link].TgtNodeId === tgt) {
                    connectedNodeDetails = this.getLinkDetails(src, link)
                }
            });

            return connectedNodeDetails
        }

    }
}