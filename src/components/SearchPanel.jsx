import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { L2 } from '../lib/localizer';
import { selectRoute } from '../lib/navigation';
import { objectIndex, showPierTooltip } from '../lib/objects';
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
    selectRoute(item.route.id, true);
    if (item.pier) setTimeout(() => {showPierTooltip(item.pier.id, false);}, 500);
  }

  routeStyle(route) {
    const routeStyle = objectIndex[route.id].style;
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

  showSearchResults() {
    if (this.props.searchResults.length === 0) return (<></>);
    return (
      <div id="searchresults">
        {this.props.searchResults.map((group, gIndex) => (
        <div className={`searchhitgroup ${group[0].type}`} key={group[0].key}>
          {(group[0].type !== 'route') ? (<span><span className="searchhitgrouptitle">{group[0].title}</span><span className="searchhitgroupspecifier">{group[0].specifier}</span></span>): (<div/>)}
          
          <div className="searchhitgroupcontent">
          {group.map((hit, index) => (
            <div className={`searchhit ${hit.type}`} key={hit.key}
              onClick={() => this.onResultClicked(hit)} tabIndex={(10+gIndex*100+index).toString()}
              onKeyDown={(event) => {if (event.key === "Enter") this.onResultClicked(hit)}}>
              <div className="hitroutelineouter"><div className="hitrouteline" style={this.routeStyle(hit.route)}></div></div><div className="hitrouteinfo"><div className="hittitle">{hit.routetitle}</div><div className="hitspecifier">{hit.routespecifier || ''}</div></div>
            </div>))
          }
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
        {this.showSearchResults()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    searchPhrase: state.search.phrase,
    searchResults: state.search.results,
    uiState: state.uiState
  };
};

export default connect(mapStateToProps)(SearchPanel);

