import React, { Component } from 'react';
import MenuItem from './MenuItem';

export default class Menu extends Component {

  menuItems = [
    { target:"gettingthere", name: { fi: "Miten sinne pääsee", sv: "Hur går man dit", en: "Getting there"}},
    { target:"alandferriesinfo", name: { fi: "Ahvenanmaan lautat", sv: "Ålands färjor", en: "Ferries in Åland"}},
    { target:"finlandferriesinfo", name: { fi: "Manner-Suomen lautat", sv: "Fasta-Finlands färjor", en: "Ferries in Finland"}},
    { target:"live", name: { fi: "Live-näkymä", sv: "Live-vy", en: "Live view"}},
    { target:"linksinfo", name: { fi: "Linkkejä", sv: "Länkar", en: "Links"}},
    { target:"appinfo", name: { fi: "Tietoja sovelluksesta", sv: "Info om appen", en: "About the Application"}}
  ];

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const items = this.menuItems.map(item => {
      return ( <MenuItem key={item.target} target={item.target} name={item.name}/>);
    })
    return (
      <div className="menucontainer" id="menucontent">
        {items}
      </div>
    );
  }
}
