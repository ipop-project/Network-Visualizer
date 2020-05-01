import React from 'react'
import Card from 'react-bootstrap/Card'
import Accordion from 'react-bootstrap/Accordion'

class CollapsibleButton extends React.Component {
  render () {
    return (
      <Accordion id={this.props.id} className="overlayBtn" style={{ marginBottom: '2.5%', border: '2px solid #101B2B' }}>
        <Accordion.Toggle as={Card.Header} style={{ color: 'white', backgroundColor: '#101B2B', border: 'transparent', outline: 'none' }} eventKey={this.props.name}>
          {this.props.name}
        </Accordion.Toggle>
        <Accordion.Collapse as={Card.Body} eventKey={this.props.name} style={{ backgroundColor: '#213758', padding: '1%' }}>
          <div className="collapseContent">{this.props.children}</div>
        </Accordion.Collapse>
      </Accordion>
    )
  }
}

export default CollapsibleButton