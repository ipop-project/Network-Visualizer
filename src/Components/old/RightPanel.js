import React from 'react'

class RightPanel extends React.Component {
  render () {
    return (<div id="rightPanel">
      <h6>{this.props.rightPanelTopic}</h6>
      <div id="rightPanelContent">{this.props.children}</div>
    </div>)
  }
}

export default RightPanel
