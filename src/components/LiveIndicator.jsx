import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { L } from '../lib/localizer';
import { phases } from '../lib/constants';

function LiveIndicator({ live, phase, locale, offline, mapOffline, mapFallbackAvailable, loadFailed, dispatch }) {
  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    let disconnectTimer;
    const onOffline = () => {
      window.clearTimeout(disconnectTimer);
      disconnectTimer = window.setTimeout(() => setDisconnected(!navigator.onLine), 3000);
    };
    const onOnline = () => {
      window.clearTimeout(disconnectTimer);
      setDisconnected(false);
    };
    if (!navigator.onLine) onOffline();
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.clearTimeout(disconnectTimer);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  const offlineMessage = phase >= phases.LOADER_CLOSED && (offline || mapOffline || loadFailed || disconnected)
    ? L(locale, 'offline.noConnection')
    : '';
  const liveMessage = live.msg && phase >= phases.NORMAL_USE ? L(locale, live.msg) : '';
  const showFallback = mapFallbackAvailable && phase >= phases.LOADER_CLOSED && !mapOffline;
  const message = showFallback
    ? offlineMessage || L(locale, 'offline.mapLoadFailed')
    : offlineMessage || liveMessage;

  return (
    <div id="liveind" className={message ? 'visible' : 'hidden'} role="status">
      <span id="liveindtxt">{message}</span>
      {showFallback && <div className="map-fallback-actions">
        <button type="button" onClick={() => dispatch({ type: 'MAP_OFFLINE_CHANGED', payload: true })}>
          {L(locale, 'offline.switchMap')}
        </button>
        <button type="button" onClick={() => dispatch({ type: 'MAP_FALLBACK_DISMISSED' })}>
          {L(locale, 'offline.keepMap')}
        </button>
      </div>}
    </div>
  );
}

const mapStateToProps = state => ({
  locale: state.settings.locale,
  live: state.live,
  phase: state.uiState.phase,
  offline: state.data.offline,
  mapOffline: state.uiState.mapOffline,
  mapFallbackAvailable: state.uiState.mapFallbackAvailable,
  loadFailed: state.data.loadFailed
});

export default connect(mapStateToProps)(LiveIndicator);
