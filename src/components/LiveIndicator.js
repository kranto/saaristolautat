import React, { Component } from 'react'

const $ = window.$;

export default class LiveIndicator extends Component {

  constructor() {
    super();
    this.state = { text: ""};
  }

  setText(text) {
    if (text.length > 0) {
      this.setState({ text: text });
      $("#liveind").show();
      $("#liveind").animate({left: '0px'});
    } else {
      const that = this;
      $("#liveind").animate({left: '-100px'}, function() { 
        $("#liveind").hide();
        that.setState({ text: "" });
      });
    }
  }

  render() {
    return (
      <div id="liveind">
        <span id="liveindtxt">{this.state.text}</span>
      </div>
    );
  }
}
