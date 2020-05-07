export default class OverlaysObj {
  constructor(overlays) {
    var overlayList = []

    Object.keys(overlays).forEach(overlay => {
      const overlayStr = { name: overlay, description: overlays[overlay].description, numberOfNodes: overlays[overlay].num_nodes, numberOfLinks: overlays[overlay].num_links }
      // const overlayStr = { name: overlay, numberOfNodes: overlays[overlay].NumNodes, numberOfLinks: overlays[overlay].NumLinks }
      overlayList.push(overlayStr)
    })

    this.getOverlayList = () => {
      return overlayList
    }

    this.getOverlayName = () => {
      var overlaysName = []
      this.getOverlayList().forEach(overlay => { overlaysName.push(overlay.name) })
      return overlaysName
    }

    this.getOverlay = (overlay) => {
      return overlayList.find(element => element.name === overlay)
    }

    this.getNumberOfNodes = (overlay) => {
      return overlayList.find(element => element.name === overlay).numberOfNodes
    }

    this.getNumberOfLinks = (overlay) => {
      return overlayList.find(element => element.name === overlay).numberOfLinks
    }

    this.getOverlayDescription = (overlay) => {
      return overlayList.find(element => element.name === overlay).description
    }
  }
}
