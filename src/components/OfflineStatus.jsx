import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { L, L2 } from '../lib/localizer';

function OfflineStatus({ offline, savedAt, loadFailed, locale }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!offline) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, [offline]);
  const days = savedAt ? Math.floor(Math.max(0, now - savedAt) / 86400000) : 0;
  if (!loadFailed && (!offline || days < 1)) return null;
  const message = loadFailed
    ? L2('offline.unavailable')
    : L(locale, [days === 1 ? 'offline.oneDay' : 'offline.days', days]);
  return <div className="offline-status" role="status" key={locale}>{message}</div>;
}

export default connect(state => ({
  locale: state.settings.locale,
  offline: state.data.offline,
  savedAt: state.data.savedAt,
  loadFailed: state.data.loadFailed
}))(OfflineStatus);
