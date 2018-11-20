import React, { Component } from 'react';
import { L2 as L, LP } from '../lib/localizer';
import { connect } from 'react-redux';
import { filterTimetables } from '../lib/datarenderer';
import FModal from './FModal';

function renderDate(date, lang) {
  if (!date) return "";
  var parts = date.split("-");
  return parts[2] + "." + parts[1] + ".";
}

function renderDates(fromD, toD, lang) {
  return renderDate(fromD, lang) + " - " + renderDate(toD, lang);
}

class Timetables extends Component {

  onClose(event) {
    window.history.back();
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  getHeader() {
    if (!this.props.timetableid || !this.props.routeid) return "";
    const route = this.props.data.routes[this.props.routeid];
    const timetable = this.props.data.timetables[this.props.timetableid];
    const name = timetable.name || route.name;
    const specifier = timetable.specifier || route.specifier;
    return specifier ?
      (<div className="infotitle">{name}: <span className="specifier">{specifier}</span></div>) :
      (<div className="infotitle">{name}</div>);
  }

  getBody() {
    if (!this.props.timetableid) return "";
    const timetable = { ...this.props.data.timetables[this.props.timetableid] };
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
    return (
      <div>
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
    );
  }

  render() {
    const show = (this.props.timetableid && this.props.routeid);
    return (
      <FModal id="timetables"
        show={show}
        onClose={window.history.back.bind(window.history)}
        header={show ? this.getHeader() : ""}
        body={show ? this.getBody() : ""}>
      </FModal>
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