import React from "react";
import "react-tippy/dist/tippy.css";
import { Tooltip } from "react-tippy";
import "bootstrap/dist/css/bootstrap.min.css";
import overlay_ic from "../../Images/Icons/overlay_ic.svg";
import Config from "../../Config/config";
import OverlayObj from '../Common/OverlaysObj';

class Overlay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            overlays: null, overlaysObj: {}, selectedOverlayId: '',
        }
        window.overlayComponent = this;
    }

    componentDidMount() {
        var intervalNo = new Date().toISOString().split('.')[0];
        var serverIP = `${Config.IPOP.ip}:${Config.IPOP.port}`;
        var allowOrigin = 'https://cors-anywhere.herokuapp.com/';  /* you need to allow origin to get data from outside server*/
        var url = `${allowOrigin}http://${serverIP}/IPOP/overlays?interval=${intervalNo}&current_state=True`
        console.log(`url:${url}`);
        fetch(url).then(res => res.json())
            .then((overlays) => {
                console.log(overlays)
                this.setState({ overlaysObj: overlays });
                this.setState({ overlays: new OverlayObj(overlays.current_state) });
            })
            .catch(err => {
                console.log(err);
            })
    }

    renderOverlays = () => {
        let overlays = this.state.overlays.getOverlayName().map((overlay) => {
            return <Tooltip className="overlayTooltips" key={overlay} duration="500" animation="scale" interactive distance={40} position="bottom" arrow={true} open={true}
                html={(<div>{overlay}</div>)}>
                <button onClick={this.selectOverlay.bind(this, overlay)} id={overlay} className="overlay">
                    <img src={overlay_ic} alt="overlay_ic" className="overlay_ic"></img>
                </button>
            </Tooltip>
        });
        return overlays;
    }

    selectOverlay = (overlayId) => {
        this.setState({selectedOverlayId: overlayId})
        let packet = {
            type: `mainGraph`,
            //url: `http://150.29.149.79:3000/graph`,/** IP for React client server */
            url: `${Config.React.perfix}${Config.React.ip}:${Config.React.port}/#/SAGE2_graph`,
            overlayId: overlayId,
        }
        window.SAGE2_AppState.callFunctionInContainer('requestMainGraph',packet);
    }

    render() {
        return (
            <>
                <div id="container" className="container-fluid">
                    <div id="mainContent" className="row" style={{ backgroundColor: "#101B2B", color: "white" }}>
                        <section id="midArea" className="col-10">
                            {this.state.overlays ? this.renderOverlays() : (<div className="loader">Loading...</div>)}
                        </section>
                    </div>

                </div>
            </>
        )
    }

}

export default Overlay;