import React from 'react'

class Overlays extends React.Component {
  render () {
    return <section id='midArea'>
      {this.props.children}
    </section>
  }
}

export default Overlays
