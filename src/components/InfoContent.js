import React, { Component } from 'react';

export default class InfoContent extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {

    const data = this.props.data;
    const lang = this.props.lang;
    const L = val => window.L(lang, val);

    const titleLine = data.specifier? 
      (<div className="infotitle">{ data.name }: <span className="specifier">{data.specifier}</span></div>):
      (<div className="infotitle">{ data.name }</div>);

    const vesselItems = data.vessels.map( vessel => {
      const features = vessel.features.map( feature => 
        <span key={feature.icon}><i className={"fa fa-" + feature.icon } aria-hidden="true"></i> { feature.value } </span>
      );
      return (
        <div key={vessel.name} className="col-12 col-sm-6 col-md-12">
          <div className="vesselbox">
            <div className="vesselname">{vessel.name}</div>
            <div className="vesselfeatures">{features}</div>
          </div>
        </div>
      );
    });

    const featureItems = data.features.map( feature => 
      <div key={feature.value} className={"col-12 col-sm-4 col-md-11 routefeature " + feature.class } dangerouslySetInnerHTML={{__html: feature.value}}></div>
    );

    const timetableItems = data.timetables.map( timetable =>
      <div key={timetable.id} className="col-12 col-sm-12 col-md-12">
        <button type="button" linktype={timetable.exttimetables.toString()} data-target={timetable.id} className={"btn btn-info btn-md timetablebutton " + timetable.exttimetables} href={timetable.link}>
          &nbsp;{L('timetables')} {timetable.buttonspecifier? "-": ""} {timetable.buttonspecifier}
        </button>
      </div>
    );

    const pierItems = data.piers.map( pier => 
      <div key={pier.id} data-target={ pier.id } className={"pierlink " + pier.class}><span className="pier">{pier.name}{pier.name_local?"/":""}{pier.name_local}</span><span className="pierspecifier"> {pier.specifier}</span></div>
    );

    const noteItems = data.notes? data.notes.map( note => 
      <div key={note.content} dangerouslySetInnerHTML={{__html: note.content}}></div>
    ): [];

    const contactItems = data.contacts.map( contact => {
      const items = contact.items.map( item =>
        <a key={item.uri} href={item.uri} target={item.target}>
          <button type="button" className={"btn btn-outline-info contactbutton " + item.class}>{item.text}{item.specifier}</button>
        </a>
      );
      return (
        <div key={contact.name}>
          <div className="contactformheader">{contact.name}</div>
          {items}
        </div>
      );
    });

    return (
      <div className="infocontent">

        <button type="button" className="btn btn-secondary closeInfoButton"><i className="fa fa-times" aria-hidden="true"></i></button>

        <div className="row"><div className="col-11 col-sm-11">{titleLine}</div></div>

        <div className="row vesselrow spaceabove">{vesselItems}</div>

        <div className="row spaceabove">{featureItems}</div>

        <div className="row spaceabove">{timetableItems}</div>

        <div className="spaceabove pierrow">{pierItems}</div>

        <div className="spaceabove">{noteItems}</div>

        <div className="spaceabove"><h4>{L('contactinfo')}</h4></div>

        <div id="contactslist" className="">
          <div className="contactsbox">{contactItems}</div>
        </div>

      </div>
    );
  }
}
