import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import InfoContent from './InfoContent';
import InfoContent2 from './InfoContent2';

class InfoContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { hidden: false }
  }

  componentDidMount() {
    window.$("body").mouseup(() => this.setHidden(false));
  }

  componentWillUnmount() {
    window.$("body").off("mouseup");
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
      <div id="infoholder" className={"info" + (this.state.hidden ? " hidden" : "")}>
        <TransitionGroup component={null}>
          <CSSTransition key={`route-${this.props.routeid || 'none'}`} classNames="infocontent" timeout={500}>
            <InfoContent isHidden={this.state.hidden} setHidden={this.setHidden.bind(this)}
              locale={this.props.locale} routeid={this.props.routeid} data={this.props.data} geojson={this.props.geojson} />
          </CSSTransition>
          <CSSTransition key={`targets-${this.props.infoContent2key || 'none'}`} classNames="infocontent" timeout={500}>
            <InfoContent2 locale={this.props.locale} targets={this.props.targets} />
          </CSSTransition>
        </TransitionGroup>
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
    data: state.data.data,
    geojson: state.data.geojson
  };
};

export default connect(mapStateToProps)(InfoContainer);
