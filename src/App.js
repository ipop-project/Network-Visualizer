// import logo from './logo.svg';
// import './App.css';
import React from 'react'
import './CSS/Global.css'
import './CSS/Component.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import Header from './Components/Common/Header'
import ipop_ic from './Images/Icons/ipop_ic.svg'
import SystemContent from './Components/Common/SystemContent'

function App () {
  return (
    <>
      <Header src={ipop_ic} alt="ipop_ic">IPOP NETWORK VISUALIZER</Header>
      <SystemContent />
    </>
  )
}

export default App
