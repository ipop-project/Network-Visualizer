import React from "react";
import ipop_ic from "../../Images/Icons/ipop_ic.svg";

class Header extends React.Component {
    render() {
        return <header id="header" className="row">

            <div id="ipopTitle" className="col-3">
                <img src={ipop_ic} alt="ipop_ic" style={{ marginRight: "5%" }} /><label style={{ marginTop: "2%", marginBottom: "2%" }}>IPOP NETWORK VISUALIZER</label>
            </div>

            <div id="viewSelector" className="col-6">

            </div>

            <div id="searchBar" className="col-3">
                {this.props.children}
            </div>
        </header>
    }
}

export default Header;