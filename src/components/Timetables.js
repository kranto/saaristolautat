import React, { Component } from 'react';
import { L2 as L } from '../lib/localizer';
import { connect } from 'react-redux';
import { routeInfo } from '../lib/datarenderer';


class Timetables extends Component {

  onCloseClicked() {
    window.history.back();
  }

  render() {

    if (!this.props.timetableid || !this.props.routeid) return "";
    const route = this.props.data.routes[this.props.routeid];
    const routeData = routeInfo(route, this.props.locale);
    const timetable = routeData.timetables.filter(tt => tt.id === this.props.timetableid)[0];

    const data = timetable;
    if (!data) return "";

    const tabItems = data.tables.map(table =>
      <li key={table.tabid} className="nav-item">
        <a className={"nav-link " + table.active} data-toggle="tab" href={"#" + table.tabid} role="tab">
          {table.dates}
        </a>
      </li>
    );

    const tableItems = data.tables.map(table => {
      const images = table.images.map(image =>
        <div className="timetablelink" key={image}>
          <a href={"timetables_jpg/" + image} target="timetable">
            <div>
              <img alt="timetable" className="timetable" src={"timetables_jpg/" + image} />
            </div>
          </a>
        </div>
      );
      return (
        <div className={"tab-pane fade " + table.show + " " + table.active} id={table.tabid} role="tabpanel" key={table.tabid}>
          {images}
          <div className="alert alert-info center">
            {L('openzoomable')}
          </div>
        </div>);
    }
    );

    const titleLine = data.specifier ?
      (<div className="infotitle">{data.name}: <span className="specifier">{data.specifier}</span></div>) :
      (<div className="infotitle">{data.name}</div>);

    return (
      <div id="timetables" className="fmodal" style={{ display: "none" }} onClick={this.onCloseClicked}>
        <div className="fmodalcontent timetablescontent">
          <button type="button" className="btn btn-secondary closeInfoButton" onClick={this.onCloseClicked} id="closeTimetablesButton">
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
          <div className="fmodalheader">
            {titleLine}
          </div>
          <div className="fmodalbody">
            <div className="alert alert-warning">
              {L('unofficialcopy')}&nbsp;
            <a target="info" href={data.link}>{L('fromoriginal')}&nbsp;
            <i className="fa fa-external-link" aria-hidden="true"></i></a>.
          </div>
            <div className="navtabswrapper">
              <ul className="nav nav-tabs" role="tablist">
                {tabItems}
              </ul>
            </div>
            <div className="tab-content">
              {tableItems}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    timetableid: state.selection.timetables,
    routeid: state.selection.infoContent,
    data: state.data.data
  };
};

export default connect(mapStateToProps)(Timetables);