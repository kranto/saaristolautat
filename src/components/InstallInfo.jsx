import React, { Component } from 'react';
import { getInstallState, showInstallPrompt, subscribeToInstallState } from '../lib/installPrompt';

const locales = ['fi', 'sv', 'en'];

function message(text, locale) {
  return text[Math.max(0, locales.indexOf(locale))];
}

export default class InstallInfo extends Component {
  constructor(props) {
    super(props);
    this.state = getInstallState();
  }

  componentDidMount() {
    this.unsubscribe = subscribeToInstallState(() => this.setState(getInstallState()));
    this.setState(getInstallState());
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { locale } = this.props;
    const { installPrompt, installed } = this.state;
    return (
      <div className="infosection install-info">
        <h2>{message(['Asenna Saaristolautat', 'Installera Saaristolautat', 'Install Saaristolautat'], locale)}</h2>
        <p>{message([
          'Lisää Saaristolautat puhelimen aloitusnäyttöön, niin voit avata kartan suoraan sovelluskuvakkeesta.',
          'Lägg till Saaristolautat på telefonens hemskärm så kan du öppna kartan direkt från appikonen.',
          'Add Saaristolautat to your phone’s home screen to open the map directly from its app icon.'
        ], locale)}</p>
        {installed ? (
          <p className="install-info__status">{message([
            'Sovellus on avattu aloitusnäytöltä.',
            'Appen har öppnats från hemskärmen.',
            'The app was opened from your home screen.'
          ], locale)}</p>
        ) : installPrompt ? (
          <button type="button" className="btn btn-primary install-info__button" onClick={showInstallPrompt}>
            {message(['Asenna sovellus', 'Installera appen', 'Install the app'], locale)}
          </button>
        ) : null}
        {!installed && (
          <>
            <h3>iPhone / iPad</h3>
            <p>{message([
              'Avaa sivu selaimessa, napauta Jaa-painiketta ja valitse Lisää Koti-valikkoon.',
              'Öppna sidan i webbläsaren, tryck på Dela och välj Lägg till på hemskärmen.',
              'Open the page in your browser, tap Share, then choose Add to Home Screen.'
            ], locale)}</p>
            <h3>Android</h3>
            <p>{message([
              'Avaa sivu selaimessa, avaa selaimen valikko ja valitse Asenna sovellus tai Lisää aloitusnäyttöön.',
              'Öppna sidan i webbläsaren, öppna webbläsarens meny och välj Installera appen eller Lägg till på startskärmen.',
              'Open the page in your browser, open its menu, then choose Install app or Add to Home screen.'
            ], locale)}</p>
          </>
        )}
        <p>{message([
          'Kartta ja ajantasaiset tiedot tarvitsevat edelleen internetyhteyden.',
          'Kartan och aktuella uppgifter kräver fortfarande internetanslutning.',
          'The map and current information still require an internet connection.'
        ], locale)}</p>
      </div>
    );
  }
}
