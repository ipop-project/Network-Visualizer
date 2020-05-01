import React from 'react'
import ReactDOM from 'react-dom'
import RightPanel from './RightPanel'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
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
import Select from 'react-select'

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
      selectedElement: null,
      selectedElementLocation: null,
      elementDetails: null,
      selectedView: { value: 'Topology', label: 'Topology' }
    }
  }

  componentDidMount() {
    document.getElementById('rightPanel').remove(document.getElementById('rightPanel').childNodes)

    var perpareSearchElement = new Promise((resolve, reject) => {
      try {
        var searchElement = this.props.elementObj.getAllElementObj().map((element) => { return JSON.stringify(element) })
        resolve(searchElement)
      } catch (e) {
        reject(e)
      }
    })

    perpareSearchElement.then((searchElement) => {
      ReactDOM.render(<Typeahead
        id='searchOverlay'
        onChange={(selected) => {
          try {
            this.cy.elements().getElementById(JSON.parse(selected).data.id).trigger('click')
            this.cy.elements().getElementById(JSON.parse(selected).data.id).select()
          } catch (e) {
            console.log(e)
          }
        }}
        options={searchElement}
        selected={this.state.selected}
        selectHintOnEnter
        placeholder={'select a node or tunnel'}
        renderToken={(option) => { return JSON.parse(option).data.label }}
        renderMenuItemChildren={(option) => {
          return (
            <div className='searchResult'>
              <div className='resultLabel'>
                <b>{JSON.parse(option).data.label}</b>
              </div>
              <small className='resultLabel'>{`ID : ${JSON.parse(option).data.id}`}</small><br />
            </div>
          )
        }}
      >
      </Typeahead>, document.getElementById('searchBar'))
    })

  }

  renderViewSelector = () => {
    return <Select
      id='viewSelector'
      isSearchable={false}
      ref={ref => this.ref = ref}
      options={[
        { value: 'Topology', label: 'Topology' },
        { value: 'Subgraph', label: 'Subgraph' },
        { value: 'Map', label: 'Map' },
        { value: 'Network Flow', label: 'Network Flow' },
        { value: 'Tunnel Utilization', label: 'Tunnel Utilization' },
        { value: 'Log', label: 'Log' },
      ]}
      value={this.state.selectedView}
      onChange={(option) => { this.handleChangeView(option) }}
      defaultValue={{ value: 'Topology', label: 'Topology' }}
    />
  }

  handleChangeView = (option) => {
    switch (option.label) {
      case 'Topology': this.renderTopology(option); break;
      case 'Subgraph': this.renderSubgraph(option); break;
      case 'Map': ; this.renderMap(option); break;
      default: ;
    }
  }

  renderTopology = (option) => {
    try {
      this.cy.elements().forEach(element => {
        element.removeClass('subgraph')
      });
      this.setState({ selectedView: option })
    } catch (e) {
      console.log(e)
    }
  }

  renderSubgraph = (option) => {
    var selectedElement = this.state.selectedElement
    var notRelatedElement, relatedElement
    try {
      if (selectedElement.isNode()) {
        // relatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement)
        notRelatedElement = this.cy.elements().difference(selectedElement.outgoers().union(selectedElement.incomers())).not(selectedElement)
      } else if (selectedElement.isEdge()) {
        // relatedElement = selectedElement.connectedNodes().union(selectedElement)
        notRelatedElement = this.cy.elements().difference(selectedElement.connectedNodes()).not(selectedElement)
      }
      notRelatedElement.addClass('subgraph')
      this.setState({ selectedView: option })
    } catch (e) {
      alert('Please select node or tunnel.')
      console.log(this.ref.select.props.value)
    }
  }

  renderMap = (option) => {
    try {
      if (this.state.selectedElement.isNode()) {
        const nodeDetails = this.props.elementObj.getNodeDetails(this.state.selectedElement.data().id)
        const connectedNodes = this.cy.elements(this.state.selectedElement.incomers().union(this.state.selectedElement.outgoers())).filter((element) => {
          return element.isNode()
        })
        const coordinate = this.state.selectedElement.data().coordinate.split(',')
        console.log(coordinate)
      } else if (this.state.selectedElement.isEdge()) {

        var createMapFromEdge = new Promise((resolve, reject) => {
          try {
            var selectedElement = this.state.selectedElement

            const srcNode = selectedElement.connectedNodes().filter((element) => {
              return element.data().id == selectedElement.data().source
            })

            const tgtNode = selectedElement.connectedNodes().filter((element) => {
              return element.data().id == selectedElement.data().target
            })

            const srcCoordinate = srcNode.data().coordinate.split(',')
            const tgtCoordinate = tgtNode.data().coordinate.split(',')

            console.log(srcCoordinate)
            console.log(tgtCoordinate)
            console.log((srcCoordinate[0])+" "+parseFloat(srcCoordinate[1])+" "+parseFloat(tgtCoordinate[0])+" "+parseFloat(tgtCoordinate[1]))

            var centerPoint = this.midpoint(parseFloat(srcCoordinate[0]), parseFloat(srcCoordinate[1]), parseFloat(srcCoordinate[0]), parseFloat(srcCoordinate[1]))

            var map = <GoogleMapReact
              bootstrapURLKeys={{
                key: 'AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs',
                language: 'en'
              }}
              center={{ lat: centerPoint[0], lng: centerPoint[1] }}
              defaultZoom={10}
            >

              <button onClick={this.handleMakerClicked.bind(this, srcNode)} key={srcNode.data().id + 'Marker'} id={srcNode.data().id + 'Marker'} className="nodeMarker selected" lat={parseFloat(srcCoordinate[0])} lng={parseFloat(srcCoordinate[1])}>
                <label className="markerLabel">
                  {srcNode.data().label}
                </label>
              </button>

              <button onClick={this.handleMakerClicked.bind(this, tgtNode)} key={tgtNode.data().id + 'Marker'} id={tgtNode.data().id + 'Marker'} className="nodeMarker selected" lat={parseFloat(srcCoordinate[0])} lng={parseFloat(srcCoordinate[1])}>
                <label className="markerLabel">
                  {tgtNode.data().label}
                </label>
              </button>

            </GoogleMapReact>

            this.setState({ selectedView: option })

            resolve(map)
          } catch (e) {
            console.log(e)
            reject()
          }
        })

        createMapFromEdge.then((map) => {
          ReactDOM.render(map, document.getElementById('cytoscape'))
        })
      }
    } catch (e) {
      alert('Please select node or tunnel.')
    }
  }

  handleMakerClicked = (node) => {
    if (this.state.selectedElement.isNode()) {
      node.trigger('click')
      document.getElementById(node.data().id + 'Marker').classList.add('selected')
      this.setState({ selectedElement: node })
    }
  }

  midpoint = (lat1, lng1, lat2, lng2) => {
    lat1 = this.deg2rad(lat1)
    lng1 = this.deg2rad(lng1)
    lat2 = this.deg2rad(lat2)
    lng2 = this.deg2rad(lng2)

    var dlng = lng2 - lng1
    var Bx = Math.cos(lat2) * Math.cos(dlng)
    var By = Math.cos(lat2) * Math.sin(dlng)
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
      Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By))
    var lng3 = lng1 + Math.atan2(By, (Math.cos(lat1) + Bx))

    return [(lat3 * 180) / Math.PI, (lng3 * 180) / Math.PI]
  }

  deg2rad = (degrees) => {
    return degrees * Math.PI / 180
  };

  renderViewContent = () => {

    ReactDOM.render(this.renderViewSelector(), document.getElementById('viewBar'))

    return <div id='cytoscape'><Cytoscape id='cy'
      cy={(cy) => {

        this.cy = cy
        this.cy.userZoomingEnabled(false)

        this.cy.ready(() => {
          document.getElementById('cytoscape').onwheel = this.handleWheelZoom
        })

        this.cy.on('click', (e) => {
          var clickEvent = new Promise((resolve, reject) => {
            try {
              if (e.target[0] !== this.state.selectedElement) {
                console.log('clicked');

                this.setState({ selectedElement: (e.target[0]) })
                resolve()
              } else {
                reject()
              }
            } catch (e) {
              reject()
            }
          })

          clickEvent.then(() => {
            try {
              if (this.state.selectedElement !== undefined) {
                if (this.state.selectedElement.isNode()) {
                  this.renderNodeDetails()
                  document.getElementById('rightPanel').hidden = false;
                } else {
                  var sourceNodeDetails = this.props.elementObj.getNodeDetails(this.state.selectedElement.data().source)
                  var targetNodeDetails = this.props.elementObj.getNodeDetails(this.state.selectedElement.data().target)
                  var linkDetails = this.props.elementObj.getLinkDetails(sourceNodeDetails.id, this.state.selectedElement.data().id)
                  this.renderLinkDetails(sourceNodeDetails, targetNodeDetails, linkDetails)
                  document.getElementById('rightPanel').hidden = false;
                }
              } else {
                document.getElementById('rightPanel').hidden = true;
                this.setState({ elementDetails: '', selectedElement: null })
              }
            } catch (e) {
              console.log(e)
            }
          }).catch(() => { console.log(`don't do anything`) })

        })

      }}

      elements={this.props.elementObj.getAllElementObj()}

      stylesheet={cytoscapeStyle}

      style={{ width: window.innerWidth, height: window.innerHeight }}

      layout={{ name: 'circle' }}

    /></div>

  }

  renderNodeDetails = () => {
    const nodeDetails = this.props.elementObj.getNodeDetails(this.state.selectedElement.data().id)
    const connectedNodes = this.cy.elements(this.state.selectedElement.incomers().union(this.state.selectedElement.outgoers())).filter((element) => {
      return element.isNode()
    })
    const coordinate = this.state.selectedElement.data().coordinate.split(',')
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate[0]},${coordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
      .then(res => res.json()).then((location) => {
        try {
          this.setState({ selectedElementLocation: location.results[location.results.length - 1].formatted_address })
        } catch (e) {
          this.setState({ selectedElementLocation: '-' })
        }
      }).then(() => {
        var rightPanelElement = (<div id='nodeDetails' style={{ overflowY: 'auto' }}>
          <h5>{nodeDetails.name}</h5>

          <div className="DetailsLabel">Node ID</div>
          {nodeDetails.id}

          <div className="DetailsLabel">State</div>
          {nodeDetails.state}

          <div className="DetailsLabel">City/State/Country</div>
          {this.state.selectedElementLocation}
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
                  {/* {connectedNodeDetails.ICEConnectionType} */}
                -
                <div className="DetailsLabel">ICE Role</div>
                  {/* {connectedNodeDetails.ICERole} */}
                  {connectedNodeDetails.stats.IceProperties.role}
                  {/* <div className="DetailsLabel">Remote Address</div> */}
                  {/* {connectedNodeDetails.remoteAddress} */}
                  {/* {connectedNodeDetails.stats.IceProperties.remote_addr} */}
                  {/* <div className="DetailsLabel">Local Address</div> */}
                  {/* {connectedNodeDetails.localAddress} */}
                  {/* {connectedNodeDetails.stats.IceProperties.local_addr} */}
                  <div className="DetailsLabel">Latency</div>
                  {/* {connectedNodeDetails.latency} */}
                  {connectedNodeDetails.stats.IceProperties.latency}
                  <Card.Body className="transmissionCard">
                    Sent
                  <div className="DetailsLabel">Byte Sent</div>
                    {connectedNodeDetails.stats.byte_sent}
                    <div className="DetailsLabel">Total Byte Sent</div>
                    {/* {connectedNodeDetails.stats[0].sent_total_bytes} */}
                    {connectedNodeDetails.stats.total_byte_sent}
                  </Card.Body>

                  <Card.Body className="transmissionCard">
                    Received
                  <div className="DetailsLabel">Byte Received</div>
                    {connectedNodeDetails.stats.byte_receive}
                    <div className="DetailsLabel">Total Byte Received</div>
                    {/* {connectedNodeDetails.stats[0].recv_total_bytes} */}
                    {connectedNodeDetails.stats.total_byte_receive}
                  </Card.Body>
                </>
              </CollapsibleButton>
            })

            }
          </div>
        </div>)
        this.setState({ elementDetails: rightPanelElement })
      })
  }

  handleSwitch = (sourceNodeDetails, targetNodeDetails, linkDetails) => {
    const new_linkDetails = this.props.elementObj.getLinkDetails(targetNodeDetails.id, linkDetails.id)
    this.renderLinkDetails(targetNodeDetails, sourceNodeDetails, new_linkDetails)
  }

  renderLinkDetails = (sourceNodeDetails, targetNodeDetails, linkDetails) => {
    try {

      const srcNode = this.state.selectedElement.connectedNodes().filter((element) => {
        return element.data().id == sourceNodeDetails.id
      })

      const tgtNode = this.state.selectedElement.connectedNodes().filter((element) => {
        return element.data().id == targetNodeDetails.id
      })

      const srcCoordinate = srcNode.data().coordinate.split(',')
      const tgtCoordinate = tgtNode.data().coordinate.split(',')

      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${srcCoordinate[0]},${srcCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
        .then((res) => {
          return res.json()
        }).then((srcLocation) => {
          try {
            this.setState({ selectedElementLocation: srcLocation.results[srcLocation.results.length - 1].formatted_address })
          } catch (e) {
            this.setState({ selectedElementLocation: '-' })
          }
        }).then(() => {
          fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${tgtCoordinate[0]},${tgtCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
            .then((res) => {
              return res.json()
            }).then((tgtLocation) => {
              try {
                return [this.state.selectedElementLocation, tgtLocation.results[tgtLocation.results.length - 1].formatted_address]
              } catch (e) {
                return [this.state.selectedElementLocation, '-']
              }
            }).then((locations) => {
              this.setState({ selectedElementLocation: locations })
            }).then(() => {
              console.log(this.state.selectedElementLocation)
              var rightPanelElement = (<div id='linkDetails'>
                <h5>{linkDetails.name}</h5>

                <div className="row">

                  <div className="col-10" style={{ paddingRight: '0' }}>
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
                        {/* {sourceNodeDetails.location} */}
                        {this.state.selectedElementLocation[0]}
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
                        {/* {targetNodeDetails.location} */}
                        {this.state.selectedElementLocation[1]}
                      </>

                    </CollapsibleButton>

                  </div>

                  <div className="col" style={{ margin: 'auto', padding: '0', textAlign: 'center' }}>
                    <Button onClick={this.handleSwitch.bind(this, sourceNodeDetails, targetNodeDetails, linkDetails)} id="switchBtn" />
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
                {/* {linkDetails.ICEConnectionType} */}
          -
                <div className="DetailsLabel">ICE Role</div>
                {/* {linkDetails.ICERole} */}
                {linkDetails.stats.IceProperties.role}
                {/* <div className="DetailsLabel">Remote Address</div> */}
                {/* {linkDetails.remoteAddress} */}
                {/* {linkDetails.stats.IceProperties.remote_addr} */}
                {/* <div className="DetailsLabel">Local Address</div> */}
                {/* {linkDetails.localAddress} */}
                {/* {linkDetails.stats.IceProperties.local_addr} */}
                <div className="DetailsLabel">Latency</div>
                {/* {linkDetails.latency} */}
                {linkDetails.stats.IceProperties.latency}
                <br /><br />

                <Card.Body className="transmissionCard">
                  Sent
            <div className="DetailsLabel">Byte Sent</div>
                  {linkDetails.stats.byte_sent}
                  <div className="DetailsLabel">Total Byte Sent</div>
                  {/* {linkDetails.stats[0].sent_total_bytes} */}
                  {linkDetails.stats.total_byte_sent}
                </Card.Body>

                <Card.Body className="transmissionCard">
                  Received
            <div className="DetailsLabel">Byte Received</div>
                  {linkDetails.stats.byte_receive}
                  <div className="DetailsLabel">Total Byte Received</div>
                  {/* {linkDetails.stats[0].recv_total_bytes} */}
                  {linkDetails.stats.total_byte_receive}
                </Card.Body>

              </div >)
              this.setState({ elementDetails: rightPanelElement })

            })
        })

    } catch{

    }
  }

  handleZoomIn = () => {
    if (this.cy.zoom() <= this.state.maxZoom) {
      this.cy.zoom(this.cy.zoom() + 0.1)
      document.getElementById('zoomSlider').value = (this.cy.zoom())
    }
  }

  handleZoomOut = () => {
    if (this.cy.zoom() >= this.state.minZoom) {
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
    this.setState({ minZoom: parseFloat(e.target.value) })
  }

  handleSetMaxZoom = (e) => {
    if (parseFloat(e.target.value) < this.cy.zoom()) {
      this.cy.zoom(parseFloat(e.target.value))
      document.getElementById('zoomSlider').value = parseFloat(e.target.value)
    }
    this.setState({ maxZoom: parseFloat(e.target.value) })
  }

  handleBackToHome = () => {
    if (window.confirm('Your current process will be loss. Are you sure to go back ?') === true) {
      window.location.reload(true)
    }
  }

  renderRightPanel = () => {
    return this.state.elementDetails
  }

  render() {
    return <>
      <RightPanel rightPanelTopic='Details' >{this.renderRightPanel()}</RightPanel>
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
                    <select onChange={this.handleSetMinZoom} id='minZoomSelector' value={this.state.minZoom}>
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
                    <select onChange={this.handleSetMaxZoom} id='maxZoomSelector' value={this.state.maxZoom}>
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
      <div id="map" style={{position:"absolute"}}></div>
      {this.renderViewContent()}
    </>
  }
}

export default OtherViews
