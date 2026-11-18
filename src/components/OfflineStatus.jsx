import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { L, L2 } from '../lib/localizer';

function OfflineStatus({ offline, savedAt, loadFailed, locale }) {
  const [now, setNow] = useState(Date.now());
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
  useEffect(() => {
    if (!offline) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [offline]);
  const days = savedAt ? Math.floor(Math.max(0, now - savedAt) / 86400000) : 0;
  if (!offline && !loadFailed && !disconnected) return null;
  const message = loadFailed
    ? L2('offline.unavailable')
    : days < 1 ? L2('offline.active')
      : L(locale, [days === 1 ? 'offline.oneDay' : 'offline.days', days]);
  return (
    <div className="offline-status" role="status" aria-label={message} title={message} key={locale}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path d="M2.5 9a14.5 14.5 0 0 1 16.2-2.8M5.5 12a10 10 0 0 1 9.5-2.5M8.5 15a5.5 5.5 0 0 1 3.5-1.2M12 19h.01M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {!loadFailed && days >= 1 && <span className="offline-status__age">{L(locale, ['offline.shortDays', days])}</span>}
    </div>
  );
}

export default connect(state => ({
  locale: state.settings.locale,
  offline: state.data.offline,
  savedAt: state.data.savedAt,
  loadFailed: state.data.loadFailed
}))(OfflineStatus);
