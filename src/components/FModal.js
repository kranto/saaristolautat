import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class FModal extends Component {
  constructor(props) {
    super(props);
    this.fmodalRef = React.createRef();
  }

  onCloseClicked(event) {
    event.stopPropagation();
    this.props.onClose(event);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  contents() {
    return (
      <div id={this.props.id} className="fmodal" onClick={this.onCloseClicked.bind(this)} key="1" ref={this.fmodalRef}>
      <div className="closeInfoButtonHolder">
      <button type="button" className="btn btn-secondary closeInfoButton" onClick={this.onCloseClicked.bind(this)}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      </div>
        <div className="fmodalcontent" onClick={this.stopPropagation}>
          <div className="fmodalheader" style={{ position: "relative" }}>
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
    if (this.fmodalRef.current && this.props.scrollTop) {
      this.fmodalRef.current.scrollTop = 0;
    }
    return (
      <ReactCSSTransitionGroup transitionName="fmodal"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}>
        {this.props.show ? this.contents() : ""}
      </ReactCSSTransitionGroup>
    );
  }
}
