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
    selectRoute(item.routeRef, true);
    if (item.pierRef) showPierTooltip(item.pierRef, false);
    hideMenuAndSettings();
  }

  render() {
    return (
      <div id="searchpanel" className={"slidedownmenu" + (this.props.open ? " open" : "")}>
        <input type="search" name="slsearchbox" className="searchbox" placeholder={L2("search.placeholder")} maxLength="30"
        value={this.state.searchPhrase}
        onChange={event => this.onSearchPhraseEdited(event)}></input>
        <div id="searchresults">
          {this.props.searchResults.map(r => (<div className="searchhit" key={r.key} onClick={() => this.onResultClicked(r)}>{r.title} {r.specifier || ''}</div>))}        
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    searchPhrase: state.search.phrase,
    searchResults: state.search.results
  };
};

export default connect(mapStateToProps)(SearchPanel);

