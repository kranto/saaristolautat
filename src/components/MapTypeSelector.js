import React, { Component } from 'react';

export default class MapTypeSelector extends Component {

  mapTypes = [
    { value: "roadmap", name: { fi: "Google tiekartta", sv: "Google vägkarta", en: "Google Roadmap"}},
    { value: "satellite", name: { fi: "Google satelliitti", sv: "Google satellit", en: "Google Satellite"}},
    { value: "hybrid", name: { fi: "Google hybridi", sv: "Google hybrid", en: "Google Hybrid"}},
    { value: "terrain", name: { fi: "Google maasto", sv: "Google terräng", en: "Google Terrain"}},
    { value: "OSM", name: { fi: "OpenStreetMap", sv: "OpenStreetMap", en: "OpenStreetMap"}},
    { value: "MMLTAUSTA", name: { fi: "MML taustakartta", sv: "LMV bakgrundskarta", en: "NLS Background Map"}},
    { value: "MMLMAASTO", name: { fi: "MML maastokartta", sv: "LMV terrängkarta", en: "NLS Terrain Map"}},
  ];

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const selects = Object.keys(this.mapTypes[0].name).map(lang => {
      const options = this.mapTypes.map(mapType =>
        <option key={mapType.value} value={mapType.value}>{mapType.name[lang]}</option>
      );
      return (<select key={lang} className="mapTypeSelect" lang={lang}>{options}</select>);
    });

    return (
        <div className="MapTypeSelector">
          {selects}
        </div>
    );
  }
}
