import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Collapse from 'react-bootstrap/lib/Collapse'
import Button from 'react-bootstrap/lib/Button'
import Well from 'react-bootstrap/lib/Well'

// Calling nodedata webservice on HTML window load
window.onload = function() {
        callWebservice();
    }

// Variable to store retrieved state of nodes (either current or history)
var nodedetaillist = [];

// Invokes nodedata webservice and builds the network topology
function callWebservice(){
  $.getJSON("http://"+serverip+"/nodedata", function(data,status) {
  if (status == "error") throw error;

  nodedetaillist = data["response"]["runningnodes"];

  // Invokes function in common javascript module to build complete network topology
  //buildnetworktopology(nodedetaillist);
  buildOverlays(nodedetaillist);

  });
}

$('#config-toggle').on('click', function(){ $('body').toggleClass('config-closed'); });

$('#toolsTab').append('<div id="refreshbtn"></div>');
class RefreshLayout extends React.Component {
	constructor(props) {
    	super(props);
    	this.handleClick = this.handleClick.bind(this);
  	}

	handleClick() {
    $('.NodeDetails').remove();
		cy.remove(cy.edges());
		cy.remove(cy.nodes());
		callWebservice();
	}

	render() {
	    return (
	      <button onClick={this.handleClick} className='btn btn-primary fa fa-refresh'/>
	    );
  	}
}
ReactDOM.render(<RefreshLayout />, document.getElementById('refreshbtn'));

$('#refreshbtn').qtip({
  content: 'Reset',
  style: {
      classes: 'qtip-bootstrap',  
      }
  });

$('#toolsTab').append('<div id="LayoutZoom"></div>');
class LayoutZoom extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handlePlus = this.handlePlus.bind(this);
    this.handleMinus = this.handleMinus.bind(this);
  }

  handleChange(newValue) {
    cy.zoom(newValue['target']['value']/1);
    cy.center();
  }

  handlePlus(){
    var value = parseFloat($('#zoomslide').val());
    value = value + (cy.maxZoom()-cy.minZoom())/8;
    $('#zoomslide').val(value).trigger('change');
    cy.zoom($("#zoomslide").val()/1);
    cy.center();
  }

  handleMinus(){
    var value = parseFloat($('#zoomslide').val());
    value = value - (cy.maxZoom()-cy.minZoom())/8;
    $('#zoomslide').val(value).trigger('change');
    cy.zoom($("#zoomslide").val()/1);
    cy.center();
  }

  render() {
      return (
        <div>
        <button onClick={this.handlePlus} className='btn btn-success fa fa-search-plus' id='plusbtn' />
        <input id="zoomslide" type="range" min={cy.minZoom()} max={cy.maxZoom()} step={(cy.maxZoom()-cy.minZoom())/8} defaultValue={(cy.minZoom()+cy.maxZoom())/2} onChange={this.handleChange}/>
        <button onClick={this.handleMinus} className='btn btn-danger fa fa-search-minus' id='minusbtn' />
        </div>
      );
    }
}
ReactDOM.render(<LayoutZoom />, document.getElementById('LayoutZoom'));

class LabelSizeSlider extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(newValue) {
    cy.style()
     .selector('node')
     .style({'font-size':newValue['target']['value']+'em'})
     .update();
  }

  render() {
      return (
        <input type="range" min="0.5" max="8.5" step="0.5" defaultValue="2" onChange={this.handleChange}/>
      );
    }
}

class LayoutZoomLimits extends React.Component {
  constructor(props) {
    super(props);
    this.handleMax = this.handleMax.bind(this);
    this.handleMin = this.handleMin.bind(this);
  }

  handleMax(newValue) {
    cy.maxZoom(newValue['target']['value']/1);
  }

  handleMin(newValue){
    cy.minZoom(newValue['target']['value']/1);
  }

  render() {
      return (
          <div>
          <div>
            <h5 className="section-heading">minZoom</h5>
            <select className="form-control" defaultValue="0.1" onChange={this.handleMin}>
                  <option>0.1</option>
                  <option>0.2</option>
                  <option>0.3</option>
                  <option>0.4</option>
                  <option>0.5</option>
                  <option>0.6</option>
                  <option>0.7</option>
            </select>
          </div>
          <div>
            <h5 className="section-heading">maxZoom</h5>
            <select className="form-control" defaultValue="2" onChange={this.handleMax}>
                  <option>2</option>
                  <option>2.5</option>
                  <option>3</option>
                  <option>3.5</option>
                  <option>4</option>
                  <option>4.5</option>
                  <option>5</option>
            </select>
          </div>
          </div>
      );
  }
}


$('#toolsTab').append('<div id="LayoutControls"></div>');

class LayoutControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <Button className = "btn btn-primary" onClick={() => this.setState({ open: !this.state.open })}>
        <span className = "fa fa-wrench"></span>
        </Button>
        <Collapse in={this.state.open} id='ControlsCollapse'>
          <div>
            <Well id="Controlwell">
              <h4 className = "section-heading">Node Label Sizing</h4>
              <LabelSizeSlider />
              <h4 className = "section-heading">Layout Zoom Limits</h4>
              <LayoutZoomLimits />
            </Well>
          </div>
        </Collapse>
      </div>
    );
  }
}

ReactDOM.render(<LayoutControls />, document.getElementById('LayoutControls'));

$('#config').append('<br><h4 class = "section-heading">Overlay Network</h4><div id="OverlayList"></div>');

class OverlayList extends React.Component {
  constructor(props) {
      super(props);
      this.handleClick = this.handleClick.bind(this);
    }

  handleClick(newValue) {
    var network = newValue['target']['value'];
    if(network != "Select Overlay"){
      cy.remove(cy.nodes());
      buildnetworktopology(OverlayDetails[network]);
    }
  }

  render() {
      return (
        <div>
            <select className="form-control" id="overlay-form-control" defaultValue="Select Overlay" onChange={this.handleClick}>
                  <option>Select Overlay</option>
                  <option>Network1</option>
                  <option>Network2</option>
                  <option>Network3</option>
            </select>
        </div>
      );
    }
}
ReactDOM.render(<OverlayList />, document.getElementById('OverlayList'));

//setInterval(callWebservice,7500);