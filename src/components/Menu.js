import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import MenuItem from './MenuItem';
import { L2 } from '../lib/localizer';
import { menuItemClicked } from '../lib/navigation';

class Menu extends Component {

  menuItems = ["gettingthere", "alandferriesinfo", "finlandferriesinfo", "live", "linksinfo", "appinfo"];

  componentDidUpdate() {
    if (!this.props.open) ReactDOM.findDOMNode(this).scrollTop = 0;
  }

  render() {
    const items = this.menuItems.map(item => {
      return (<MenuItem key={item} name={L2("menu." + item)} onClick={() => menuItemClicked(item)} />);
    })
    return (
      <div id="menu" className={"slidedownmenu" + (this.props.open ? " open" : "")}>
        {items}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale
  };
};

export default connect(mapStateToProps)(Menu);