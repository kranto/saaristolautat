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
        if (this.props.data.routes) console.log('data', JSON.stringify(this.props.data.routes, null, 2))
        if (!this.props.data.routes) return <></>
        return Object.entries(this.props.data.routes)
            .filter(([_id, route]) => !route.obsolete)
            .map(([id, route]) => {
            return (<p>
                    {/* <a href={`#${id}`}><span>{LP(route, "name") }</span>  <span>{LP(route, "specifier")}</span></a> */}
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
                </p>
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
                    <p>
                        Googlen karttapalvelun hinnoittelu on muuttunut, eikä karttaa voida näyttää.
                        <br/>Voit kuitenkin etsiä Saaristomeren reittejä, aluksia ja laitureita käyttäen yläpalkin hakutoimintoa tai valita haluamasi reitin alla olevasta listasta.
                    </p>}
                    {lang === "sv" &&
                    <p>
                        Prissättningen för Google Maps har ändrats och kartan kan inte visas här.
                        <br/>Du kan dock söka efter rutter, fartyg och hamnar i Skärgårdshavet med hjälp av sökfunktionen i den övre fältet eller välja önskad rutt från listan nedan.                    
                    </p>}
                    {lang === "en" && 
                    <p>
                        Pricing of Google Maps has changed and the map cannot be displayed here.
                        <br/>However, you can search for routes, vessels, and docks in the Archipelago Sea using the search function in the top bar or select the desired route from the list below.
                    </p>}

                    <p>
                        {this.renderRoutes()}
                    </p>
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
