// import logo from './logo.svg';
// import './App.css';
import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {HashRouter, Route} from 'react-router-dom'
import OverlaysView from './Components/Common/OverlaysView'
import Tool from './Components/SAGE2/Tool'
import Overlay from './Components/SAGE2/Overlay'
import Info from './Components/SAGE2/Info'
import Search from './Components/SAGE2/Search'
import Graph from './Components/SAGE2/Graph'
import Map from './Components/SAGE2/Map'

function App() {
  return (
    <HashRouter>
      <Route exact path="/" component={OverlaysView}/>
      <Route path="/SAGE2_tool" component={Tool}/>
      <Route path="/SAGE2_overlays" component={Overlay}/>
      <Route path="/SAGE2_legend" component={Info}/>
      <Route path="/SAGE2_search" component={Search}/>
      <Route path="/SAGE2_graph" component={Graph}/>
      <Route path="/SAGE2_map" component={Map}/>
    </HashRouter>
  )
}

export default App
