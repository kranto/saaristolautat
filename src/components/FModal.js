import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class FModal extends Component {

  onCloseClicked(event) {
    event.stopPropagation();
    this.props.onClose(event);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  contents() {
    return (
      <div className="fmodal" onClick={this.onCloseClicked.bind(this)} key="1">
        <div className="fmodalcontent" onClick={this.stopPropagation}>
          <button type="button" className="btn btn-secondary closeInfoButton" onClick={this.onCloseClicked.bind(this)}>
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
          <div className="fmodalheader">
            {this.props.header}
          </div>
          <div className="fmodalbody">
            {this.props.body}
          </div>
        </div>
      </div>
      );  
  }

  render() {
    return (
      <ReactCSSTransitionGroup transitionName="fmodal"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}>
        {this.props.show ? this.contents() : "" }
      </ReactCSSTransitionGroup>
    );
  }
}
