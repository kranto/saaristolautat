import React, { Component } from 'react';
import MenuItem from './MenuItem';
import { L2 } from '../lib/localizer';
import { connect } from 'react-redux';

class Menu extends Component {

    menuItems = ["gettingthere", "alandferriesinfo", "finlandferriesinfo", "live", "linksinfo", "appinfo"];

    render() {
        const items = this.menuItems.map(item => {
            return (<MenuItem key={item} target={item} name={L2("menu." + item)} />);
        })
        return (
            <div id="menu">
                <div className="menucontainer" id="menucontent">
                    {items}
                </div>
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