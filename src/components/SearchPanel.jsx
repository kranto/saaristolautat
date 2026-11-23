import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { L2, LP } from '../lib/localizer';
import { selectRoute } from '../lib/navigation';
import { getRecentRoutes } from '../lib/recentRoutes';
import { panToMapObject } from '../lib/mapnavigation';
import { getRouteStyle } from '../lib/routestyle';
import { hideMenuAndSettings } from '../lib/uicontrol';
import store from '../store';

class SearchPanel extends Component {

  constructor(props) {
    super(props);
    this.state = { searchPhrase: props.searchPhrase || '' }
  }

  componentDidUpdate() {
    if (!this.props.open) ReactDOM.findDOMNode(this).scrollTop = 0;
    if (this.state.searchPhrase !== this.props.searchPhrase) {
      this.setState({searchPhrase: this.props.searchPhrase});
    }
  }

  onSearchPhraseEdited(event) {
    this.setState({searchPhrase: event.target.value})
    store.dispatch({type: "SEARCH_PHRASE_EDITED", payload: event.target.value})
  }

  onResultClicked(item) {
    hideMenuAndSettings();
    selectRoute(item.route.id, true, 'search');
    if (item.pier) panToMapObject(item.pier.id);
  }

  onRecentRouteClicked(item) {
    hideMenuAndSettings();
    selectRoute(item.type === 'longdistance' ? [item.route.id] : item.route.id, true, 'latest');
  }

  routeStyle(route) {
    const routeStyle = getRouteStyle(this.props.geojson, route.id);
    return routeStyle ?
      {
        borderBottomWidth: routeStyle.weight + "px ",
        borderBottomStyle: routeStyle.style,
        borderBottomColor: routeStyle.color
      } :
      {
        borderBottom: "none"
      };
  }

  renderHit(hit, tabIndex, onClick) {
    return (
      <div className={`searchhit ${hit.type}`} key={hit.key}
        onClick={onClick} tabIndex={tabIndex}
        onKeyDown={event => { if (event.key === 'Enter') onClick(); }}>
        <div className="hitroutelineouter"><div className="hitrouteline" style={this.routeStyle(hit.route)}></div></div>
        <div className="hitrouteinfo"><div className="hittitle">{hit.routetitle}</div><div className="hitspecifier">{hit.routespecifier || ''}</div></div>
      </div>
    );
  }

  showRecentRoutes() {
    const { routes, lauttaRoutes } = this.props.data;
    const recentRoutes = getRecentRoutes().map(item => {
      const route = item.type === 'longdistance'
        ? lauttaRoutes?.find(route => route.id === Number(item.id))
        : routes?.[item.id];
      if (!route || route.obsolete) return null;
      return {
        ...item,
        route,
        key: `${item.type}:${item.id}`,
        routetitle: LP(route, item.type === 'longdistance' ? 'sname' : 'name'),
        routespecifier: item.type === 'longdistance'
          ? route.operators?.join(', ')
          : LP(route, 'specifier')
      };
    }).filter(Boolean);

    if (recentRoutes.length === 0) return null;

    return (
      <div id="recentroutes">
        <div className="recentroutesheading">{L2('search.recentRoutes')}</div>
        <div className="searchhitgroup route">
          <div className="searchhitgroupcontent">
            {recentRoutes.map((hit, index) => this.renderHit(hit, (10 + index).toString(), () => this.onRecentRouteClicked(hit)))}
          </div>
        </div>
      </div>
    );
  }

  showSearchResults() {
    if (this.props.searchResults.length === 0) return (<></>);
    return (
      <div id="searchresults">
        {this.props.searchResults.map((group, gIndex) => (
        <div className={`searchhitgroup ${group[0].type}`} key={group[0].key}>
          {(group[0].type !== 'route') ? (<span><span className="searchhitgrouptitle">{group[0].title}</span><span className="searchhitgroupspecifier">{group[0].specifier}</span></span>): (<div/>)}
          
          <div className="searchhitgroupcontent">
          {group.map((hit, index) => this.renderHit(hit, (10+gIndex*100+index).toString(), () => this.onResultClicked(hit)))}
          </div>
        </div>))}
      </div>)
  }

  render() {
    if (!this.props.uiState.searchOpen) return (<div/>);
    return (
      <div id="searchpanel" className={"slidedownmenu" + (this.props.open ? " open" : "")}>
        <input type="search" name="slsearchbox" className="searchbox" placeholder={L2("search.placeholder")} maxLength="30"
        autoComplete="off" autoCorrect="off" spellCheck="false" 
        value={this.state.searchPhrase} autoFocus={true} tabIndex="9"
        onChange={event => this.onSearchPhraseEdited(event)}></input>
        {this.state.searchPhrase.length === 0 ? this.showRecentRoutes() : this.showSearchResults()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    searchPhrase: state.search.phrase,
    searchResults: state.search.results,
    data: state.data.data,
    geojson: state.data.geojson,
    uiState: state.uiState
  };
};

export default connect(mapStateToProps)(SearchPanel);
