import React from 'react'
import ReactDOM from 'react-dom'
import RightPanel from './RightPanel'
import Card from 'react-bootstrap/Card'
import Cytoscape from 'react-cytoscapejs'
import CollapsibleButton from './CollapsibleButton.js'
import Popover from 'react-bootstrap/Popover'
import cytoscapeStyle from './cytoscapeStyle.js'
import { Typeahead } from 'react-bootstrap-typeahead'
import CreateGraphContents from './CreateGraphContents'
import static_ic from '../../Images/Icons/static_ic.svg'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import ondemand_ic from '../../Images/Icons/ondemand_ic.svg'
import connected_ic from '../../Images/Icons/connected_ic.svg'
import no_tunnel_ic from '../../Images/Icons/no_tunnel_ic.svg'
import successor_ic from '../../Images/Icons/successor_ic.svg'
import longdistance_ic from '../../Images/Icons/longdistance_ic.svg'
import not_reporting_ic from '../../Images/Icons/not_reporting_ic.svg'
import GoogleMapReact from 'google-map-react'
import Config from '../../config'

class OtherViews extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nodeLocations: {
        a100001feb6040628e5fb7e70b04f001: [35.667780, 139.792468],
        a100002feb6040628e5fb7e70b04f002: [36.063169, 140.135293],
        a100003feb6040628e5fb7e70b04f003: [36.036767, 139.139504],
        a100004feb6040628e5fb7e70b04f004: [36.124898, 138.014066],
        a100005feb6040628e5fb7e70b04f005: [35.176555, 136.856869],
        a100006feb6040628e5fb7e70b04f006: [34.992293, 135.762571],
        a100007feb6040628e5fb7e70b04f007: [34.682988, 135.528840],
        a100008feb6040628e5fb7e70b04f008: [35.864095, 139.667933],
        a100009feb6040628e5fb7e70b04f009: [36.640714, 138.955405],
        a100010feb6040628e5fb7e70b04f010: [34.377240, 132.457048]
      },
      minZoom: 0.1,
      maxZoom: 2,
      switchToggle: false,
      selectedElement: null
    }
  }

  componentDidMount() {
    document.getElementById('mainContent').onwheel = this.handleWheelZoom
    // document.getElementById('rightPanel')
  }

  renderViewContent = () => {
    return <Cytoscape id='cy'
      cy={(cy) => {

        this.cy = cy
        this.cy.userZoomingEnabled(false)
        this.cy.minZoom(this.state.minZoom)
        this.cy.zoom(0.8)
        this.cy.maxZoom(this.state.maxZoom)
        this.cy.center()

        this.cy.on('click', (e) => {
          var clickEvent = new Promise((resolve, reject) => {
            try {
              this.setState({ selectedElement: (e.target) })
              resolve()
            } catch (e) {
              console.log(e);
              reject()
            }
          })
          try {
            if (e.target.isNode()) {
              clickEvent.then(this.renderNodeDetails)
            } else if (e.target.isEdge()) {
              var sourceNodeDetails = this.state.elementObj.getNodeDetails(e.target.data().source)
              var targetNodeDetails = this.state.elementObj.getNodeDetails(e.target.data().target)
              var linkDetails = this.state.elementObj.getLinkDetails(sourceNodeDetails.id, e.target.data().id)
              clickEvent.then(this.renderLinkDetails(sourceNodeDetails, targetNodeDetails, linkDetails))
            }
            document.getElementById('rightPanel').hidden = false;
          } catch (e) {
            document.getElementById('rightPanel').hidden = true;
            // setRightPanelElement(null)
          }

        })

      }}

      elements={this.props.elementObj.getAllElementObj()}

      stylesheet={cytoscapeStyle}

      style={{ width: window.innerWidth, height: window.innerHeight }}

      layout={{ name: 'circle' }}

    />
  }

  renderNodeDetails = () => {
    const nodeDetails = this.props.elementObj.getNodeDetails(this.state.selectedElement.data().id)
    const connectedNodes = this.cy.elements(this.state.selectedElement.incomers().union(this.state.selectedElement.outgoers())).filter((element) => {
      return element.isNode()
    })

    var rightPanelElement = (<div id='nodeDetails'>
      <h5>{nodeDetails.name}</h5>

      <div className="DetailsLabel">Node ID</div>
      {nodeDetails.id}

      <div className="DetailsLabel">State</div>
      {nodeDetails.state}

      <div className="DetailsLabel">City/State/Country</div>
      {nodeDetails.location}
      <br /><br />

      <div id="connectedNode">
        {connectedNodes.map(connectedNode => {
          var connectedNodeDetails = this.props.elementObj.getConnectedNodeDetails(nodeDetails.id, connectedNode.data().id)
          // console.log(connectedNodeDetails);
          return <CollapsibleButton

            id={connectedNode.data().id + 'Btn'}
            className='connectedNodeBtn'
            key={connectedNode.data().id + 'Btn'}
            eventKey={connectedNode.data().label}
            name={connectedNode.data().label}
          ><>
              <div className="DetailsLabel">Node ID</div>
              {connectedNode.data().id}
              <div className="DetailsLabel">Tunnel ID</div>
              {connectedNodeDetails.id}
              <div className="DetailsLabel">Interface Name</div>
              {connectedNodeDetails.name}
              <div className="DetailsLabel">MAC</div>
              {connectedNodeDetails.MAC}
              <div className="DetailsLabel">State</div>
              {connectedNodeDetails.state}
              <div className="DetailsLabel">Tunnel Type</div>
              {connectedNodeDetails.type}
              <div className="DetailsLabel">ICE Connection Type</div>
              {connectedNodeDetails.ICEConnectionType}
              <div className="DetailsLabel">ICE Role</div>
              {connectedNodeDetails.ICERole}
              <div className="DetailsLabel">Remote Address</div>
              {connectedNodeDetails.remoteAddress}
              <div className="DetailsLabel">Local Address</div>
              {connectedNodeDetails.localAddress}
              <div className="DetailsLabel">Latency</div>
              {connectedNodeDetails.latency}
              <Card.Body className="transmissionCard">
                Sent
                                        <div className="DetailsLabel">Byte Sent</div>
                                            -
                                        <div className="DetailsLabel">Total Byte Sent</div>
                {connectedNodeDetails.stats[0].sent_total_bytes}
              </Card.Body>

              <Card.Body className="transmissionCard">
                Received
                                        <div className="DetailsLabel">Byte Received</div>
                                            -
                                        <div className="DetailsLabel">Total Byte Received</div>
                {connectedNodeDetails.stats[0].recv_total_bytes}
              </Card.Body>
            </>
          </CollapsibleButton>
        })

        }
      </div>
    </div>)

  }

  handleSwitch = (sourceNodeDetails, targetNodeDetails, linkDetails) => {
    const { elements } = this.props
    const new_linkDetails = elements.getLinkDetails(targetNodeDetails.id, linkDetails.id)
    this.renderLinkDetails(targetNodeDetails, sourceNodeDetails, new_linkDetails)
  }

  renderLinkDetails = (sourceNodeDetails, targetNodeDetails, linkDetails) => {
    try {

      var rightPanelElement = (<div>
        <h5>{linkDetails.name}</h5>

        <div className="row">

          <div className="col-9" style={{ paddingRight: '0' }}>
            <CollapsibleButton

              id={sourceNodeDetails.id + 'Btn'}
              className='sourceNodeBtn'
              key={sourceNodeDetails.id + 'Btn'}
              eventKey={sourceNodeDetails.id + 'Btn'}
              name={sourceNodeDetails.name}
            >
              <>
                <div className="DetailsLabel">Node ID</div>
                {sourceNodeDetails.id}

                <div className="DetailsLabel">State</div>
                {sourceNodeDetails.state}

                <div className="DetailsLabel">City/State/Country</div>
                {sourceNodeDetails.location}
              </>
            </CollapsibleButton>

            <CollapsibleButton

              id={targetNodeDetails.id + 'Btn'}
              className='targetNodeBtn'
              key={targetNodeDetails.id + 'Btn'}
              eventKey={targetNodeDetails.id + 'Btn'}
              name={targetNodeDetails.name}
            >
              <>
                <div className="DetailsLabel">Node ID</div>
                {targetNodeDetails.id}

                <div className="DetailsLabel">State</div>
                {targetNodeDetails.state}

                <div className="DetailsLabel">City/State/Country</div>
                {targetNodeDetails.location}
              </>
            </CollapsibleButton>

          </div>

          <div className="col" style={{ margin: 'auto', padding: '0', textAlign: 'center' }}>
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
        {linkDetails.ICEConnectionType}
        <div className="DetailsLabel">ICE Role</div>
        {linkDetails.ICERole}
        <div className="DetailsLabel">Remote Address</div>
        {linkDetails.remoteAddress}
        <div className="DetailsLabel">Local Address</div>
        {linkDetails.localAddress}
        <div className="DetailsLabel">Latency</div>
        {linkDetails.latency}
        <br /><br />

        <Card.Body className="transmissionCard">
          Sent
                    <div className="DetailsLabel">Byte Sent</div>
                        -
                    <div className="DetailsLabel">Total Byte Sent</div>
          {linkDetails.stats[0].sent_total_bytes}
        </Card.Body>

        <Card.Body className="transmissionCard">
          Received
                    <div className="DetailsLabel">Byte Received</div>
                        -
                    <div className="DetailsLabel">Total Byte Received</div>
          {linkDetails.stats[0].recv_total_bytes}
        </Card.Body>

      </div >)

    } catch{

    }
  }

  handleZoomIn = () => {
    if (this.cy.zoom !== this.state.maxZoom) {
      this.cy.zoom(this.cy.zoom() + 0.1)
      document.getElementById('zoomSlider').value = (this.cy.zoom())
    }
  }

  handleZoomOut = () => {
    if (this.cy.zoom !== this.state.minZoom) {
      this.cy.zoom(this.cy.zoom() - 0.1)
      document.getElementById('zoomSlider').value = (this.cy.zoom())
    }
  }

  handleZoomSlider = (e) => {
    this.cy.zoom(parseFloat(e.target.value))
  }

  handleWheelZoom = (e) => {
    if (e.deltaY > 0) {
      this.handleZoomOut()
    } else {
      this.handleZoomIn()
    }
  }

  handleSetMinZoom = (e) => {
    if (parseFloat(e.target.value) > this.cy.zoom()) {
      this.cy.zoom(parseFloat(e.target.value))
      document.getElementById('zoomSlider').value = parseFloat(e.target.value)
    }
    this.setState({ minZoom: e.target.value })
  }

  handleSetMaxZoom = (e) => {
    if (parseFloat(e.target.value) < this.cy.zoom()) {
      this.cy.zoom(parseFloat(e.target.value))
      document.getElementById('zoomSlider').value = parseFloat(e.target.value)
    }
    this.setState({ maxZoom: e.target.value })
  }

  handleBackToHome = () => {
    if (window.confirm('Your current process will be loss. Are you sure to go back ?') === true) {
      window.location.reload(true)
    }
  }

  render() {
    return <>
      {/* <RightPanel rightPanelTopic='Overlays' >{this.renderRightPanel()}</RightPanel> */}
      <div id='leftToolsBtn'>
        <div style={{ width: 'fit-content' }}>
          <button onClick={this.handleBackToHome} id='homeBtn'></button>
        </div>
        <div style={{ width: 'fit-content' }}>
          <button onClick={this.handleRefresh} id='refreshBtn'></button>
        </div>
        <div style={{ width: 'fit-content' }}>
          <OverlayTrigger rootClose={true} trigger='click' placement='right' overlay={
            <Popover>
              <Popover.Title as='h3'><b>IPOP Network Visualizer : Legend</b></Popover.Title>
              <Popover.Content id='infoContent'>
                <table>
                  <thead>
                    <tr>
                      <th colSpan={2}>Node</th>
                      <th colSpan={2}>Tunnel</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ width: '5%', margin: 'auto' }}><img className='node_img' src={connected_ic} alt='connected_node' /></td>
                      <td>Connected</td>
                      <td style={{ width: '15%' }}><img className='tunnel_img' src={longdistance_ic} alt='longdistance_tunnel' /></td>
                      <td>Long Distance</td>
                    </tr>
                    <tr>
                      <td style={{ width: '5%' }}><img className='node_img' src={not_reporting_ic} alt='not_reporting_node' /></td>
                      <td>Not Reporting</td>
                      <td style={{ width: '15%' }}><img className='tunnel_img' src={ondemand_ic} alt='ondemand_tunnel' /></td>
                      <td>On Demand</td>
                    </tr>
                    <tr>
                      <td style={{ width: '5%' }}><img className='node_img' src={no_tunnel_ic} alt='no_tunnel_node' /></td>
                      <td>No Tunnels</td>
                      <td style={{ width: '15%' }}><img className='tunnel_img' src={static_ic} alt='static_tunnel' /></td>
                      <td>Static</td>
                    </tr>
                    <tr>
                      <td ></td>
                      <td></td>
                      <td style={{ width: '15%' }}><img className='tunnel_img' src={successor_ic} alt='successor_tnnel' /></td>
                      <td>Successor</td>
                    </tr>
                  </tbody>
                </table>
              </Popover.Content>
            </Popover>}>
            <button onClick={this.handleInfoToggle} id='infoBtn'></button>
          </OverlayTrigger>
        </div>
        <div style={{ width: 'fit-content' }}>
          <OverlayTrigger rootClose={true} trigger='click' placement='right' overlay={
            <Popover>
              <Popover.Title as='h3'><b>IPOP Network Visualizer : Configure</b></Popover.Title>
              <Popover.Content id='configContent'>
                <div className='row'>
                  <div className='col'>
                    <label>Minimun zoom</label>
                  </div>
                  <div className='col'>
                    <select defaultValue={this.state.minZoom} onChange={this.handleSetMinZoom} id='minZoomSelector' value={this.state.minZoom}>
                      <option>0.1</option>
                      <option>1</option>
                    </select>
                  </div>
                </div>
                <div className='row'>
                  <div className='col'>
                    <label>Maximum zoom</label>
                  </div>
                  <div className='col'>
                    <select defaultValue={this.state.maxZoom} onChange={this.handleSetMaxZoom} id='maxZoomSelector' value={this.state.maxZoom}>
                      <option>2</option>
                      <option>5</option>
                    </select>
                  </div>
                </div>
              </Popover.Content>
            </Popover>}>
            <button onClick={this.handleConfigToggle} id='configBtn' ></button>
          </OverlayTrigger>
        </div>
        <div style={{ width: 'fit-content' }}>
          <button onClick={this.handleZoomIn} id='plusBtn' ></button>
        </div>
        <div style={{ width: 'fit-content' }}>
          <input id='zoomSlider' onChange={this.handleZoomSlider} type='range' min={this.state.minZoom}
            max={this.state.maxZoom} step={0.1} defaultValue={0.8}></input>
        </div>
        <div style={{ width: 'fit-content' }}>
          <button onClick={this.handleZoomOut} id='minusBtn' ></button>
        </div>
      </div>
      {this.renderViewContent()}
    </>
  }
}

export default OtherViews
