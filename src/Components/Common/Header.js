import React from "react";
import ipop_ic from "../../Images/Icons/ipop_ic.svg";

class Header extends React.Component {
    render() {
        return <header className="row">
            <img src={ipop_ic} alt="ipop_ic" />

            <div id="ipopTitle" className="col-3">
                <h6>IPOP NETWORK VISUALIZER</h6>
            </div>

            <div id="viewSelector" className="col-6" style={{ textAlign: "center" }}>
                
            </div>

            <div className="col">
                
            </div>
        </header>
    }
}

export default Header;