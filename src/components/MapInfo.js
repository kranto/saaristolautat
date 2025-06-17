import React, { Component } from 'react';
import { connect } from 'react-redux';
import { LP } from '../lib/localizer';
import { objectIndex } from '../lib/objects';
import { hideMenuAndSettings } from '../lib/uicontrol';
import { selectRoute } from '../lib/navigation';

class MapInfo extends Component {

    onResultClicked(id) {
        hideMenuAndSettings();
        selectRoute(id, true);
    }

    routeStyle(id) {
        const routeStyle = objectIndex[id]?.style;
        return routeStyle ?
            {
                borderBottomWidth: routeStyle.weight + "px ",
                borderBottomStyle: routeStyle.style,
                borderBottomColor: routeStyle.color
            } :
            {
                borderBottom: "none"
            };
    }

    renderRoutes() {
        if (!this.props.data.routes) return <></>
        return Object.entries(this.props.data.routes)
            .filter(([_id, route]) => !route.obsolete)
            .map(([id, route]) => {
            return (
                    <div className={`searchhit route`} key={id}
                        onClick={() => this.onResultClicked(id)}
                        onKeyDown={(event) => {if (event.key === "Enter") this.onResultClicked(id)}}>
                        <div className="hitroutelineouter">
                            <div className="hitrouteline" style={this.routeStyle(id)}></div>
                        </div>
                        <div className="hitrouteinfo">
                            <div className="hittitle">{LP(route, "name")}</div>
                            <div className="hitspecifier">{LP(route, "specifier") || ''}</div>
                        </div>
                    </div>
                )
            }
        )
    }

    render() {
        const { locale: lang } = this.props;
        return (
            <div id="mapcontainer">
                <div id="mapInfo" className="mapInfo">
                    {lang === "fi" &&
                    <p className="mapInfoText">
                        Googlen karttapalvelun hinnoittelu on muuttunut, eikä sitä voida näyttää.
                        <br/>Voit etsiä Saaristomeren reittejä, aluksia ja laitureita käyttäen yläpalkin
                        <span> <i>hakutoimintoa</i> <i className="fa fa-search" aria-hidden="true"></i> </span>
                        tai valita haluamasi reitin alla olevasta listasta.
                    </p>}
                    {lang === "sv" &&
                    <p className="mapInfoText">
                        Prissättningen för Google Maps har ändrats och kartan kan inte visas här.
                        <br/>Du kan söka efter rutter, fartyg och hamnar i Skärgårdshavet med hjälp av 
                        <span> <i>sökfunktionen</i> <i className="fa fa-search" aria-hidden="true"></i> </span>
                        i den övre fältet eller välja önskad rutt från listan nedan.                    
                    </p>}
                    {lang === "en" && 
                    <p className="mapInfoText">
                        Pricing of Google Maps has changed and the map cannot be displayed here.
                        <br/>You can search for routes, vessels, and docks in the Archipelago Sea using 
                        <span> <i>the search function</i> <i className="fa fa-search" aria-hidden="true"></i> </span>
                        in the top bar or select the desired route from the list below.
                    </p>}
                    <div>
                        {this.renderRoutes()}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    data: state.data.data,
    phase: state.uiState.phase,
  };
};

export default connect(mapStateToProps)(MapInfo);
