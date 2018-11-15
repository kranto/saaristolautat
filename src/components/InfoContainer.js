import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import InfoContent from './InfoContent';
import InfoContent2 from './InfoContent2';
import { toggleScrollIndicator } from '../lib/uicontrol';

class InfoContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { hidden: false }

    window.$("body").mouseup(() => {
      this.setState({ hidden: false });
    });
  }

  componentDidUpdate() {
    toggleScrollIndicator();
  }

  setHidden(hidden) {
    this.setState({ hidden: hidden });
  }

  render() {
    const infoContent2key = this.props.targets === null ? null : 
    this.props.targets.map(r=>r.id).join("-");
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
          <InfoContent2 locale={this.props.locale} targets={this.props.targets} key={infoContent2key}/>
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
    data: state.data.data
  };
};

export default connect(mapStateToProps)(InfoContainer);