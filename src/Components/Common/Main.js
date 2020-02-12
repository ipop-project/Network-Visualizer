import React from "react";
import "../../CSS/Main.css";
import Header from "./Header";
import Overlays from "../Common/Overlays";
import "react-tippy/dist/tippy.css";
import { Tooltip } from "react-tippy";
import RightPanel from "./RightPanel";
import GraphContent from "./GraphContent";
import "bootstrap/dist/css/bootstrap.min.css";
import overlay_ic from "../../Images/Icons/overlay_ic.svg";
import CollapseButton from "./CollapseButton";

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentView: "topology", overlays: [], overlaysObj: {}, selectedOverlay: false, selectedOverlayId: "",
            isToggle: true
        }
    }

    componentDidMount() {
        var intervalNo = new Date().toISOString().split(".")[0];
        var serverIP = '18.220.44.57:5000';
        var allowOrigin = 'https://cors-anywhere.herokuapp.com/';  /* you need to allow origin to get data from outside server*/
        var url = allowOrigin + 'http://' + serverIP + '/IPOP/overlays?interval=' + intervalNo + '&current_state=True'

        fetch(url).then(res => res.json())
            .then((overlays) => {
                this.setState({ overlaysObj: overlays });
                this.setState({ overlays: Object.keys(this.state.overlaysObj['current_state']) });
            })
            .catch(err => {
                alert(err);
            })
    }

    // toggle overlay right panel
    togglePanel = () => {
        this.setState(prevState => {
            return { isToggle: !prevState.isToggle };
        })
        if (this.state.isToggle) {
            document.getElementById("rightPanel").hidden = true;
        } else {
            document.getElementById("rightPanel").hidden = false;
        }
    }

    renderMainContent = () => {
        if (this.state.selectedOverlay) {
            return this.renderGraphContent(this.state.selectedOverlayId);
        } else {
            return this.renderOverlaysContent();
        }
    }

    renderGraphContent = (overlayId) => {
        return <GraphContent selectedOverlay={overlayId} />;
    }

    renderOverlaysContent = () => {
        let overlays = this.state.overlays.map((overlay) => {
            return <Tooltip className="overlayTooltips" sticky={true} key={overlay} duration="500" animation="scale" interactive distance={40} position="bottom" arrow={true} open={true}
                html={(<div>{overlay}</div>)}>
                <button onClick={this.selectOverlay.bind(this, overlay)} id={overlay} className="overlay">
                    <img src={overlay_ic} alt="overlay_ic" className="overlay_ic"></img>
                </button>
            </Tooltip>
        });

        return <>
            <Overlays>{overlays}</Overlays>
            <RightPanel rightPanelTopic="Overlays" >{this.renderRightPanel()}</RightPanel>
        </>;
    }

    renderRightPanel = () => {
        return this.renderOverlayBtn();

    }

    renderOverlayBtn = () => {
        let overlayBtn = this.state.overlays.map((overlay) => {
            return <CollapseButton key={overlay + "Btn"} id={overlay + "Btn"} name={overlay}>
                <div>Number of nodes : {this.state.overlaysObj['current_state'][overlay].NumNodes}<br />
                    Number of links : {this.state.overlaysObj['current_state'][overlay].NumLinks}</div>
            </CollapseButton>
        });
        return overlayBtn;
    }

    selectOverlay = (overlayId) => {
        this.setState({ selectedOverlay: true, selectedOverlayId: overlayId })
    }

    render() {
        return (<div id="container" className="container-fluid">

            <Header />
            <button onClick={this.togglePanel} id="overlayRightPanelBtn" />

            <div id="mainContent" className="row" style={{ backgroundColor: "#101B2B", color: "white"}}>
                {this.renderMainContent()}
            </div>

        </div>)
    }
}

export default Main;