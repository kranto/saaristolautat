import React, { Component } from 'react';

export default class Timetables extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  onCloseClicked() {
    window.history.back();
  }

  render() {

    const data = this.props.data;
    const L = this.props.l2;

    const tabItems = data.tables.map(table => 
      <li key={table.tabid} className="nav-item">
        <a className={"nav-link " + table.active} data-toggle="tab" href={ "#" + table.tabid} role="tab">
          {table.dates}
        </a>
      </li>
    );

    const tableItems = data.tables.map(table => {
      const images = table.images.map(image => 
        <div className="timetablelink" key={image}>
          <a href={"timetables_jpg/" + image} target="timetable">
            <div>
              <img alt="timetable" className="timetable" src={"timetables_jpg/" + image}/>
            </div>
          </a>
        </div>
      );
      return (
        <div className={"tab-pane fade " + table.show + " " + table.active} id={table.tabid} role="tabpanel" key={table.tabid}>
          {images}
          <div className="alert alert-info center">
            { L('openzoomable')}
          </div>
        </div>);
      }
    );

    const titleLine = data.specifier? 
      (<div className="infotitle">{ data.name }: <span className="specifier">{data.specifier}</span></div>):
      (<div className="infotitle">{ data.name }</div>);

    return (
      <div className="fmodalcontent timetablescontent">
        <button type="button" className="btn btn-secondary closeInfoButton" onClick={this.onCloseClicked} id="closeTimetablesButton">
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <div className="fmodalheader">
          {titleLine}
        </div>
        <div className="fmodalbody">
          <div className="alert alert-warning">
            { L('unofficialcopy') }&nbsp;
            <a target="info" href={ data.link }>{ L('fromoriginal') }&nbsp;
            <i className="fa fa-external-link" aria-hidden="true"></i></a>.
          </div>
          <div className="navtabswrapper">
            <ul className="nav nav-tabs" role="tablist">
              { tabItems }
            </ul>
          </div>
          <div className="tab-content">
            {tableItems}
          </div>
        </div>
      </div>
    );
  }
}
