import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import InfoContent from './InfoContent';
import InfoContent2 from './InfoContent2';

class InfoContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { hidden: false }

    window.$("body").mouseup(() => {
      this.setState({ hidden: false });
    });
  }

  setHidden(hidden) {
    this.setState({ hidden: hidden });
  }

  componentDidUpdate(prevProps) {
    if (this.props.routeid !== prevProps.routeid ||
      this.props.infoContent2key !== prevProps.infoContent2key) {
        ReactDOM.findDOMNode(this).scrollTop = 0;
      }
  }

  render() {
    return (
      <div id="infoholder" className={"info" + (this.state.hidden ? " hidden" : "")}
        onMouseLeave={this.props.onMouseLeave}
        onMouseEnter={this.props.onMouseEnter}
        onMouseDown={this.props.onMouseEnter}
        onTouchStart={this.props.onMouseEnter}>
        <ReactCSSTransitionGroup transitionName="infocontent"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}>

          <InfoContent isHidden={this.state.hidden} setHidden={this.setHidden.bind(this)}
            locale={this.props.locale} routeid={this.props.routeid} data={this.props.data} key={this.props.routeid} />
          <InfoContent2 locale={this.props.locale} targets={this.props.targets} key={this.props.infoContent2key}/>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    routeid: state.selection.infoContent,
    targets: state.selection.infoContent2,
    infoContent2key: state.selection.infoContent2 === null ? null : state.selection.infoContent2.map(r=>r.id).join("-"),
    data: state.data.data
  };
};

export default connect(mapStateToProps)(InfoContainer);