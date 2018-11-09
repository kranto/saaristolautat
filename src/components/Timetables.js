import React, { Component } from 'react';
import { L2 as L, LP } from '../lib/localizer';
import { connect } from 'react-redux';
import { filterTimetables } from '../lib/datarenderer';

function renderDate(date, lang) {
  if (!date) return "";
  var parts = date.split("-");
  return parts[2] + "." + parts[1] + ".";
}

function renderDates(fromD, toD, lang) {
  return renderDate(fromD, lang) + " - " + renderDate(toD, lang);
}

class Timetables extends Component {

  onCloseClicked(event) {
    event.stopPropagation();
    window.history.back();
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  renderContents() {

    if (!this.props.timetableid || !this.props.routeid) return "";
    const route = this.props.data.routes[this.props.routeid];
    const timetable = { ...this.props.data.timetables[this.props.timetableid] };
    const name = timetable.name || route.name;
    const specifier = timetable.specifier || route.specifier;
    const tables = filterTimetables(timetable.tables).map((table, index) => {
      return {
        ...table,
        active: "",
        show: "",
        dates: renderDates(table.validFrom, table.validTo),
        tabid: "tab" + index
      }
    });
    if (!tables.length) return "";
    tables[0] = { ...tables[0], active: "active", show: "show" };

    const tabItems = tables.map(table =>
      <li key={table.tabid} className="nav-item">
        <a className={"nav-link " + table.active} data-toggle="tab" href={"#" + table.tabid} role="tab">
          {renderDates(table.validFrom, table.validTo)}
        </a>
      </li>
    );

    const tableItems = tables.map(table => {
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

    const titleLine = specifier ?
      (<div className="infotitle">{name}: <span className="specifier">{specifier}</span></div>) :
      (<div className="infotitle">{name}</div>);

    return (
      <div className="fmodalcontent timetablescontent" onClick={this.stopPropagation}>
        <button type="button" className="btn btn-secondary closeInfoButton" onClick={this.onCloseClicked} id="closeTimetablesButton">
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <div className="fmodalheader">
          {titleLine}
        </div>
        <div className="fmodalbody">
          <div className="alert alert-warning">
            {L('unofficialcopy')}&nbsp;
            <a target="info" href={LP(timetable, "link")}>{L('fromoriginal')}&nbsp;
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
    );
  }
  
  render() {
    return (
      <div id="timetables" className="fmodal" onClick={this.onCloseClicked} style={{ display: "none" }}>
        {this.renderContents()}
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