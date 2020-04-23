import React from 'react'
import '../../CSS/Main.css'
import Config from '../../config'
import 'react-tippy/dist/tippy.css'
import { Tooltip } from 'react-tippy'
import RightPanel from './RightPanel'
import OthersView from './OthersView.js'
import OverlayObj from './OverlaysObj.js'
import ElementsObj from './ElementsObj.js'
import { Spinner, Button } from 'react-bootstrap'
import ipop_ic from '../../Images/Icons/ipop_ic.svg'
import { Typeahead } from 'react-bootstrap-typeahead'
import CollapsibleButton from './CollapsibleButton.js'

class OverlaysView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      overlaysObj: null,
      searchElement: [],
      selectedOverlay: null,
      isToggle: true,
      selectedView: 'Topology',
      elementObj: null
    }
  }

  componentDidMount() {
    var intervalNo = new Date().toISOString().split('.')[0]

    // you need to allow origin to get data from outside server.
    var allowOrigin = 'https://cors-anywhere.herokuapp.com/'

    // URL for REST API.
    var url = allowOrigin + 'http://' + Config.ip + ':' + Config.port + '/IPOP/overlays?interval=' + intervalNo + '&current_state=True'
    console.log(url);
    
    fetch(url).then(res => res.json())
      .then((overlays) => {
        // console.log(overlays);

        return new OverlayObj(overlays.current_state) // create overlay object that contain all overlays and its details.
      })
      .then((overlaysObj) => { this.setState({ overlaysObj: overlaysObj, searchElement: overlaysObj.getOverlayName() }) }) // set overlay object to overlaysObj state.
      .catch(error => {
        alert(error)
      })
  }

  handleRightPanelToggle = () => {
    this.setState(prevState => {
      return { isToggle: !prevState.isToggle }
    })
    if (this.state.isToggle) {
      document.getElementById('rightPanel').hidden = true
    } else {
      document.getElementById('rightPanel').hidden = false
    }
  }

  renderRightPanel = () => {
    if (this.state.overlaysObj !== null) {
      return this.renderOverlayBtn()
    } else {
      console.log('overlay data not ready yet.')
    }
  }

  renderOverlayBtn = () => {
    const overlayBtn = this.state.overlaysObj.getOverlayName().map((overlay) => {
      return <CollapsibleButton key={overlay + 'Btn'} id={overlay + 'Btn'} name={overlay}>
        <div>Number of nodes : {this.state.overlaysObj.getNumberOfNodes(overlay)}<br />Number of links : {this.state.overlaysObj.getNumberOfLinks(overlay)}</div>
      </CollapsibleButton>
    })
    return overlayBtn
  }

  selectOverlay = (overlay) => {
    this.setState({ selectedOverlay: overlay })

    var intervalNo = new Date().toISOString().split('.')[0]
    
    // you need to allow origin to get data from outside server.
    var allowOrigin = 'https://cors-anywhere.herokuapp.com/'

    var nodeURL = allowOrigin + 'http://' + Config.ip + ':' + Config.port + '/IPOP/overlays/' + overlay + '/nodes?interval=' + intervalNo + '&current_state=True'
    var linkURL = allowOrigin + 'http://' + Config.ip + ':' + Config.port + '/IPOP/overlays/' + overlay + '/links?interval=' + intervalNo + '&current_state=True'
    console.log(nodeURL);

    console.log(linkURL);

    var elementObj = null

    fetch(nodeURL).then(res => res.json()).then(nodesJSON => {
      console.log(nodesJSON);

      fetch(linkURL).then(res => res.json()).then(linksJSON => {
        console.log(linksJSON);

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
        return elementObj
      }).then((elementObj) => { this.setState({ elementObj: elementObj, searchElement: elementObj.getAllElementObj().map((obj) => { return obj.data.label }) }) })

    })

  }

  renderMainContent = () => {
    if (this.state.overlaysObj !== null) {
      if (this.state.selectedOverlay === null) {
        return this.renderOverlaysContent()
      } else {
        if (this.state.graphElement === null) {
          return <Spinner id='loading' animation='border' variant='info' />
        } else {
          if (this.state.elementObj !== null) {
            
            return this.renderOthersViewContent()
          }
        }
      }
    } else {
      return <Spinner id='loading' animation='border' variant='info' />
    }
  }

  renderOthersViewContent = () => {
    return <OthersView elementObj={this.state.elementObj} />
  }

  renderOverlaysContent = () => {
    const overlays = this.state.overlaysObj.getOverlayName().map((overlay) => {
      return <Tooltip className='overlayTooltips' sticky={true} key={overlay} duration='500' animation='scale' interactive position='bottom' arrow={true} open={true}
        html={(<div>{overlay}</div>)}>
        <button onClick={this.selectOverlay.bind(this, overlay)} id={overlay} className='overlay' />
      </Tooltip>
    })

    return <>
      {overlays}
    </>
  }

  render() {
    return (<div id='container' className='container-fluid' style={{ padding: '0' }}>

      <header id='header' className='row' style={{ padding: '0.2%', margin: '0' }}>
        <div id='ipopTitle' className='col-2' style={{ marginLeft: '0' }}>
          <img id='ipopLogo' src={ipop_ic} alt='ipop_ic' />
          <label id='ipopTitle' style={{ marginTop: '0.5rem' }}>
            IPOP NETWORK VISUALIZER
          </label>
        </div>

        <div id='viewBar' className='col-7'>

        </div>

        <div id='searchBar' className='col-2' style={{ marginLeft: 'auto' }}>
          <Typeahead
            id='searchOverlay'
            onChange={(selected) => {
              try {
                document.getElementById(selected).click()
              } catch {
              }
            }}
            options={this.state.searchElement !== null ? this.state.searchElement : []}
            selected={this.state.selected}
            selectHintOnEnter
            placeholder={this.state.selectedOverlay == null ? 'select an overlay' : 'select a node or tunnel'}
            renderMenuItemChildren={(option) => {
              return (
                <div className='searchResult'>
                  <div className='resultLabel'>
                    <b>{option}</b>
                  </div>
                  <small className='resultLabel'>Number of nodes : Number of links : </small><br />
                </div>
              )
            }}
          >
          </Typeahead>
        </div>
        <Button onClick={this.handleRightPanelToggle} id='menuBtn' style={{ marginRight: '0.5%' }} />
      </header>


      <div id='mainContent' style={{ margin: 'auto' }} >
        <RightPanel rightPanelTopic='Overlays' >{this.renderRightPanel()}</RightPanel>
        {this.renderMainContent()}
      </div>

    </div>)
  }
}

export default OverlaysView
