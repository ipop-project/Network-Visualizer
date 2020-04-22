export default class ElementsObj {

    constructor(nodes, links) {
        var raw_nodes = nodes
        var raw_links = links

        this.getNodeDetails = (id) => {
            var nodeDetails = {
                "name": raw_nodes[id].NodeName,
                "id": id,
                "state": '-',
                "location": '-'
            }

            return nodeDetails
        }

        this.getLinkDetails = (src,id) => {
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
                "stats": raw_links[src][id].Stats
            }

            return linkDetails
        }

        this.getConnectedNodeDetails = (src, tgt) => {
            var connectedNodeDetails
            
            Object.keys(raw_links[src]).forEach(link => {
                if (raw_links[src][link].TgtNodeId === tgt) {
                    connectedNodeDetails = this.getLinkDetails(src,link)
                }
            });

            return connectedNodeDetails
        }
        
    }
}