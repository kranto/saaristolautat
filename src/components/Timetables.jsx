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
  if (fromD && fromD === toD) return renderDate(fromD, lang);
  return renderDate(fromD, lang) + " - " + renderDate(toD, lang);
}

class Timetables extends Component {

  constructor(props) {
    super(props);
    this.state = { activeTab: 0 };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.timetableid !== this.props.timetableid ||
        previousProps.routeid !== this.props.routeid ||
        previousProps.locale !== this.props.locale) {
      this.setState({ activeTab: 0 });
    }
  }

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
    const name = LP(timetable, "name") || LP(route, "name");
    const specifier = LP(timetable, "specifier") || LP(route, "specifier");
    return specifier ?
      (<div className="infotitle">{name}: <span className="specifier">{specifier}</span></div>) :
      (<div className="infotitle">{name}</div>);
  }

  getBody() {
    if (!this.props.timetableid) return "";
    const timetable = { ...this.props.data.timetables[this.props.timetableid] };
    const filteredTables = filterTimetables(LP(timetable, "tables"));
    if (!filteredTables) return "";

    const activeTab = this.state.activeTab < filteredTables.length ? this.state.activeTab : 0;
    const tables = filteredTables.map((table, index) => {
      return {
        ...table,
        active: index === activeTab,
        dates: renderDates(table.validFrom, table.validTo),
        tabid: "timetable-tab-" + index,
        panelid: "timetable-panel-" + index,
      }
    });

    const tabItems = tables.map((table, index) =>
      <li key={table.tabid} className="nav-item">
        <button
          type="button"
          id={table.tabid}
          className={"nav-link" + (table.active ? " active" : "")}
          role="tab"
          aria-controls={table.panelid}
          aria-selected={table.active}
          onClick={() => this.setState({ activeTab: index })}
        >
          {renderDates(table.validFrom, table.validTo)}
        </button>
      </li>
    );

    const tableItems = tables.map(table => {
      const images = LP(table, "images").map(image =>
        <div className="timetablelink" key={image}>
          <a href={"timetable.php?t=" + image} target="timetable">
            <div>
              <img alt="timetable" className="timetable" src={"data/timetables_jpg/" + image} />
            </div>
          </a>
        </div>
      );
      return (
        <div
          className={"tab-pane fade" + (table.active ? " show active" : "")}
          id={table.panelid}
          role="tabpanel"
          aria-labelledby={table.tabid}
          key={table.panelid}
        >
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
