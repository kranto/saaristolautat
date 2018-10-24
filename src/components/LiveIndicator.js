import React, { Component } from 'react'
import { connect } from 'react-redux';
import { L2 } from '../lib/localizer';

const $ = window.$;

class LiveIndicator extends Component {

  componentDidUpdate() {
    if (this.props.live.msg) {
      $("#liveind").show();
      $("#liveind").animate({left: '0px'});
    } else {
      $("#liveind").animate({left: '-100px'}, function() { 
        $("#liveind").hide();
      });
    }    
  }

  render() {
    return (
      <div id="liveind">
        <span id="liveindtxt">{L2(this.props.live.msg)}</span>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    live: state.live
  };
};

export default connect(mapStateToProps)(LiveIndicator);