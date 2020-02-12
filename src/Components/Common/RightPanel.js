import React from "react";

class RightPanel extends React.Component {

    handleSearch = (e) =>{
        if(e.keyCode===13){
            alert(document.getElementById("search").value)
        }
    }

    render() {
        return <section id="rightPanel">
            <h6>{this.props.rightPanelTopic}</h6>
            <input onKeyDown={this.handleSearch} id="search" type="search" placeholder="search"></input>
            <div id="rightPanelContent">{this.props.children}</div>
        </section>
    }
}

export default RightPanel;