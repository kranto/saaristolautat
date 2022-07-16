import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { L2 } from '../lib/localizer';
import { selectRoute } from '../lib/navigation';
import { showPierTooltip } from '../lib/objects';
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
    selectRoute(item.routeRef, true);
    if (item.pierRef) setTimeout(() => {showPierTooltip(item.pierRef, false);}, 500);
  }

  showSearchResults() {
    if (this.props.searchResults.length === 0) return (<></>);
    return (
      <div id="searchresults">
      {this.props.searchResults.map((r, index) => (<div className="searchhit" key={r.key} 
      onClick={() => this.onResultClicked(r)} tabIndex={(10+index).toString()}
      onKeyDown={(event) => {if (event.key === "Enter") this.onResultClicked(r)}}>{r.title} {r.specifier || ''}</div>))}        
      </div>
    )
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

