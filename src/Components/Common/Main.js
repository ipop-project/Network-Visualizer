import React from 'react'
import 'react-tippy/dist/tippy.css'
import { Tooltip } from 'react-tippy'
import RightPanel from './RightPanel'
import GraphContent from './GraphContent'
import 'bootstrap/dist/css/bootstrap.min.css'
import CollapsibleButton from './CollapsibleButton.js'
import { Typeahead } from 'react-bootstrap-typeahead'
import '../../CSS/Main.css'
import OverlayObj from './OverlaysObj.js'
import Config from '../../config'
import { Spinner, Button } from 'react-bootstrap'
import ipop_ic from '../../Images/Icons/ipop_ic.svg'

class Main extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      overlaysObj: null,
      selectedOverlay: null,
      isToggle: true
    }
  }

  componentDidMount () {
    // fetch overlay data.
    var intervalNo = new Date().toISOString().split('.')[0]

    // get IP address of IPOP server from config.js
    var serverIP = Config.serverIP

    // you need to allow origin to get data from outside server.
    var allowOrigin = 'https://cors-anywhere.herokuapp.com/'

    // URL for REST API.
    var url = allowOrigin + 'http://' + serverIP + '/IPOP/overlays?interval=' + intervalNo + '&current_state=True'

    fetch(url).then(res => res.json())
      .then((overlays) => {
        return new OverlayObj(overlays.current_state) // create overlay object that contain all overlays and its details.
      })
      .then((overlaysObj) => { this.setState({ overlaysObj: overlaysObj }) }) // set overlay object to overlaysObj state.
      .catch(error => {
        alert(error)
      })
  }

  // componentDidUpdate () {
  //   if (this.state.selectedOverlay === false) {
  //     if (this.state.searchData !== '') {
  //       this.state.overlays.forEach(overlay => {
  //         if (!overlay.match(this.state.searchData)) {
  //           document.getElementById(overlay).hidden = true
  //           document.getElementById(overlay + 'Btn').hidden = true
  //         } else {
  //           document.getElementById(overlay).hidden = false
  //           document.getElementById(overlay + 'Btn').hidden = false
  //         }
  //       })
  //     } else {
  //       this.state.overlays.forEach(overlay => {
  //         document.getElementById(overlay).hidden = false
  //         document.getElementById(overlay + 'Btn').hidden = false
  //       })
  //     }
  //   }
  // }

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

  // renderGraphContent = (overlayId) => {
  //   return <GraphContent selectedOverlay={overlayId} />
  // }

  renderRightPanel = () => {
    return this.renderOverlayBtn()
  }

  renderOverlayBtn = () => {
    const overlayBtn = this.state.overlaysObj.getOverlayName().map((overlay) => {
      return <CollapsibleButton key={overlay + 'Btn'} id={overlay + 'Btn'} name={overlay}>
        <div>Number of nodes : {this.state.overlaysObj.getNumberOfNodes(overlay)}<br />Number of links : {this.state.overlaysObj.getNumberOfLinks(overlay)}</div>
      </CollapsibleButton>
    })
    return overlayBtn
  }

  selectOverlay = (overlayId) => {
    this.setState({ selectedOverlayId: overlayId })
  }

  renderMainContent = () => {
    if (this.state.overlaysObj !== null) {
      return this.renderOverlaysContent()
    } else {
      return <Spinner id='loading' animation="border" variant="info" />
    }
  }

  renderOverlaysContent = () => {
    const overlays = this.state.overlaysObj.getOverlayName().map((overlay) => {
      return <Tooltip className="overlayTooltips" sticky={true} key={overlay} duration="500" animation="scale" interactive position="bottom" arrow={true} open={true}
        html={(<div>{overlay}</div>)}>
        <button onClick={this.selectOverlay.bind(this, overlay)} id={overlay} className="overlay" />
      </Tooltip>
    })

    return <>
      {overlays}
      <RightPanel rightPanelTopic="Overlays" >{this.renderRightPanel()}</RightPanel>
    </>
  }

  render () {
    return (<div id="container" className="container-fluid">

      <header id='header' className='row' style={{ padding: '0.2%' }}>
        <div id='ipopTitle' className='col-2' style={{ marginLeft: '0' }}>
          <img src={ipop_ic} alt='ipop_ic' />
          <label id='ipopTitle'>
            IPOP NETWORK VISUALIZER
          </label>
        </div>

        <div id='viewBar' className='col-7'>

        </div>

        <div id='searchBar' className='col-2'>
          <Typeahead
            id="searchOverlay"
            onChange={(selected) => {
              try {
              } catch {
              }
            }}
            options={this.state.overlaysObj !== null ? this.state.overlaysObj.getOverlayName() : []}
            selected={this.state.selected}
            selectHintOnEnter
            labelKey="overlay"
            placeholder={this.state.selectedOverlay == null ? 'select an overlay' : 'select a node or tunnel'}
            renderMenuItemChildren={(option) => {
              return (
                <div className="searchResult">
                  <div className="resultLabel">
                    {option}
                  </div>
                  <small className="resultLabel">Number of nodes : {this.state.overlaysObj.getNumberOfNodes(option)} Number of links : {this.state.overlaysObj.getNumberOfLinks(option)}</small><br />
                </div>
              )
            }}
          >
          </Typeahead>
        </div>
        <Button onClick={this.handleRightPanelToggle} id='menuBtn' />
      </header>

      <div id="mainContent" className="row" style={{ margin: 'auto' }}>
        {this.renderMainContent()}
      </div>

    </div>)
  }
}

export default Main
