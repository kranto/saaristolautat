import React, { Component } from 'react';
import InfoContent from './InfoContent';
import InfoContent2 from './InfoContent2';

export default class MapContainer extends Component {
  render() {
    return (
      <div id="infoholder" className="info">
        <InfoContent /><InfoContent2 />
      </div>
    );
  }
}
