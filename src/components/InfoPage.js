import React, { Component } from 'react';
import { connect } from 'react-redux';
import { L2 } from '../lib/localizer';
import { showLivePage, closeInfoPage } from '../lib/navigation';
import FModal from './FModal';
import { setLayer } from '../actions/settingsActions';

const locales = ["fi", "sv", "en"];

const getItem = (arrayOrString, locale) => {
  if (typeof arrayOrString === 'string') return arrayOrString;
  const index = Math.min(arrayOrString.length - 1, locales.indexOf(locale));
  return arrayOrString[index];
}

const linkSpan = (urls, target, linkTexts, locale) => (
  <a href={getItem(urls, locale)} rel="noopener noreferrer" target={target}>{getItem(linkTexts, locale)}</a>
);

const link = (urls, target, linkTexts, descriptions, locale) => (
  <div>{linkSpan(urls, target, linkTexts, locale)}
    <p>{getItem(descriptions, locale)}</p>
  </div>
);

class InfoPage extends Component {
  constructor(props) {
    super(props);
    this.state={page: null, scrollTop: false};
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {page: nextProps.page, scrollTop: prevState && nextProps.page !== prevState.page};
  }

  onChange(event) {
    this.props.dispatch(setLayer('live', event.target.checked));
    closeInfoPage();
  }
  
  renderContents(page) {
    const { locale: lang } = this.props;
    const onlyInFinnish = lang === "fi" ? "" : lang === "sv" ? (<span>Bara på finska...</span>) : (<span>Only in Finnish...</span>);

    return (
      <div>
        {page === "gettingthere" ?
          <div className="infosection">
            <h2>{L2("menu.gettingthere")}</h2>
            {onlyInFinnish}
            <h3>Autolla ja moottoripyörällä</h3>
            <p>Autolla ja moottoripyörällä on helppo seurata Saariston rengastietä Turusta Naantalin kautta Taivassaloon ja Kustaviin tai Paraisten kautta Nauvoon. Kustavista ja Korpposta voi jatkaa matkaa Iniöön ja Houtskariin tai Ahvenanmaalle.</p>
            <p>Ahvenanmaalle voi matkustaa myös suoraan autolautalla Helsingistä, Turusta ja Naantalista</p>
            <h3>Julkisilla</h3>
            <p><strong>Junalla</strong> pääsee Turkuun, Saloon, Tammisaareen ja Hankoon. Tarkista aikataulut <a href="http://www.vr.fi" rel="noopener noreferrer" target="_blank">VR</a>:n palvelusta.</p>
            <p>Turusta on <strong>linja-autoyhteyksiä</strong> Kemiönsaaren Taalintehtaalle, Paraisille, Nauvoon, Korppooseen ja Houtskariin sekä Taivassalon kautta Kustaviin. Aikataulut löydät <a href="http://www.matkahuolto.fi" rel="noopener noreferrer" target="_blank">Matkahuollon</a> palvelusta.</p>
            <p>Maarianhaminasta on linja-autoyhteyksiä ympäri Ahvenanmannerta, mm. kaikkiin satamiin. Reitit ja aikataulut näet <a href="http://www.alandstrafiken.ax/fi/aikataulut/bussien-aikatalut" rel="noopener noreferrer" target="_blank">Ålandstrafikenin</a> sivuilta.</p>
            <p>Maarianhaminaan voi myös <strong>lentää</strong> Turusta ja Helsingistä.</p>
            <h3>Polkupyörällä</h3>
            <p>Turusta pääsee Saariston rengastietä Kaarinan kautta Paraisille ja siitä edelleen Nauvoon ja Korppooseen. Vastapäivään voi polkea vaikkapa Naantalin kautta Velkuan Teersaloon ja jatkaa lautalla Taivassalon Hakkenpäähän.</p>
            <p>Turusta pääsee Nauvoon myös Pientä Rengastietä Naantalin ja Rymättylän kautta tai suoraan risteilyaluksella Aurajoen rannasta. Ja kannattaa muistaa, että myös linja-autot kuljettavat pyöriä, jos tilaa on.</p>
            <p>Korppoosta ja Kustavista on helppo siirtyä Ahvenanmaan lautoille ja jatkaa matkaa Brändöhön tai eteläisellä linjalla vaikkapa Kökariin ja Föglöhön. Ahvenanmaan matkan voi taittaa myös suoraan autolautalla Turusta, Helsingistä tai Naantalista. Ahvenanmaalta voi myös piipahtaa Ruotsin puolella Grisslehamnissa tai Kapellskärissä.</p>
            <p>Pyöräilijälle on vaihtoehtoja saaristossa lähes loputtomasti. Kesän 2018 uutuus on yhteys Hangon ja Kemiönsaaren Kasnäsin välillä. Lähes kaikki alukset ottavat polkupyörän kyytiin. Varmista tarvittaessa suoraan alukselta.</p>
          </div>
          : ""}

        {page === "alandferriesinfo" ?
          <div className="infosection">
            <h2>{L2("menu.alandferriesinfo")} <img src="data/img/alandstrafiken.png" width="120px" alt="Ålandstrafiken" /></h2>
            {onlyInFinnish}
            <h3>Lauttareitit</h3>
            <ul className="ferrieslist">
              <li><div className="infopageroute" style={{ borderColor: "#7a2736" }}></div><strong>Pohjoinen linja</strong> yhdistää Manner-Suomen Kustavin Brändön kautta Ahvenanmantereen Vårdöhön.</li>
              <li><div className="infopageroute" style={{ borderColor: "#3c854a" }}></div><strong>Eteläinen linja</strong> yhdistää Manner-Suomen Korppoon Ahvenanmantereen Lumparlandiin.</li>
              <li><div className="infopageroute" style={{ borderColor: "#c85534" }}></div><strong>Poikittainen linja</strong> yhdistää Eteläisen ja Pohjoisen linjan Lumparlandista Kumlingeen.</li>
              <li><div className="infopageroute" style={{ borderColor: "#34509f" }}></div> <strong>Föglön linja</strong> yhdistää Föglön saaristokunnan Ahvenanmantereen Lumparlandiin.</li >
              <li><div className="infopageroute" style={{ borderColor: "#00a000", borderTopWidth: "5px", borderTopStyle: "dotted" }}></div> <strong>Vaijerilossit</strong> kulkevat lyhyitä etappeja pääsääntöisesti ilman aikataulua.</li >
            </ul >
            <h3>Hinnat</h3>
            <p>
              Ajoneuvojen kuljettaminen Ålandstrafikenin lautoilla on maksullista paitsi vaijerilosseilla. Hinnoittelusta johtuen käytännössä maksullista on ainoastaan lähtö saaristoon Ahvenanmantereelta tai Manner-Suomesta eli Hummelvikistä, Långnäsistä, Svinöstä, Vuonaisista ja Galtbystä. Saarten välillä kulkeminen sekä saaristosta poistuminen on maksutonta. Matkustajista ei peritä erikseen maksua.
            </p>
            <p>
              Maksu määräytyy ajoneuvotyypin mukaan. Jos matkustaa saman vuorokauden aikana koko matkan Suomesta Ahvenanmantereelle tai päinvastoin, on maksu huomattavasti korkeampi kuin saaristossa yövyttäessä. Verkosta etukäteen ostettuna maksuista saa 20 % alennuksen.
            </p>
            <p>
              Esimerkkihintoja vuonna 2025:
            </p>
            <table>
              <tbody>
                <tr><th colSpan="2">Yhteys</th><th><i className="fa fa-bicycle" aria-hidden="true"></i></th><th><i className="fa fa-motorcycle" aria-hidden="true"></i></th><th><i className="fa fa-car" aria-hidden="true"></i></th></tr>
                <tr><td><i className="fa fa-exchange" aria-hidden="true"></i></td><td>Manner-Suomi - saaristo - Manner-Suomi</td><td>6 €</td><td>21 €</td><td>40 €</td></tr>
                <tr><td><i className="fa fa-long-arrow-right" aria-hidden="true"></i></td><td>Manner-Suomi - Ahvenanmanner<br />(yöpyminen saaristossa)</td><td>6 €</td><td>21 €</td><td>21 €</td></tr>
                <tr><td><i className="fa fa-long-arrow-right" aria-hidden="true"></i></td><td>Manner-Suomi - Ahvenanmanner<br />(saman vuorokauden aikana)</td><td>28 €</td><td>87 €</td><td>143 €</td></tr>
              </tbody>
            </table>
            <p>
              Koko hinnasto löytyy <a href="https://www.alandstrafiken.ax/farjetrafik/farjepriser" rel="noopener noreferrer" target="other">Ålandstrafikenin sivuilta</a>.
            </p>
            <p>
              Useimmille lautoille voi varata paikan moottoriajoneuvolle ja suosituimpiin aikoihin se on ehdottomasti suositeltavaa. Varauksen voi tehdä <a href="https://www.alandstrafiken.ax/" rel="noopener noreferrer" target="other">verkossa</a> tai<br />puhelimitse <i className="fa fa-phone" aria-hidden="true"></i>&nbsp;<a className="tel" href="tel:+3581825600">+358&nbsp;18&nbsp;25&nbsp;600</a>.
          </p>
          </div >
          : ""}

        {page === "finlandferriesinfo" ?
          <div className="infosection">
            <h2>{L2("menu.finlandferriesinfo")}</h2>
            {onlyInFinnish}
            <h3>Lauttareitit</h3>
            <ul className="ferrieslist">
              <li><div className="infopageroute" style={{ height: "20px", position: "relative", top: "12px", borderTopColor: "#005dd8", borderBottomColor: "#00a000", borderBottomWidth: "5px", borderBottomStyle: "dotted" }}></div><strong>Maantielautat ja lossit</strong> kuljettavat ajoneuvoja ja matkustajia joko aina tarvittaessa tai aikataulun mukaan useita kertoja päivässä. Maantielautat ovat maksuttomia.</li>
              <li><div className="infopageroute" style={{ borderColor: "#7fb3e8", borderTopWidth: "3px" }}></div><strong>Yhteysalukset</strong> kulkevat aikataulun mukaan useisiin saariin, mutta osin vain tilauksesta. Yhteysalukset ovat maksuttomia.</li>
              <li>< div className="infopageroute" style={{ borderColor: "#ff7c0a" }}></div> <strong>Rengasreitit</strong> yhdistävät rengastiet kesäkaudella.Rengasreitit ovat maksullisia.</li >
              <li><div className="infopageroute" style={{ borderColor: "#ff7c0a", borderTopWidth: "3px", borderTopStyle: "dashed" }}></div> <strong>Risteilyalukset</strong> kuljettavat vain matkustajia ja mahdollisesti polkupyöriä.Ne ovat maksullisia.</li >
            </ul>
            <p>
              Manner-Suomen lautat ovat pääsääntöisesti maksuttomia. Vain oranssilla värillä merkityillä rengasreiteillä ja risteilyaluksilla peritään maksu.
          </p>
            <p>
              Maantielautat ja lossit liikennöivät enimmäkseen ilman tilausta. Lautalle ei voi varata paikkaa. Monet yhteysalusvuorot sen sijaan vaativat tilauksen etukäteen. Tarkista tilauksen tarve aikataulusta.
          </p>
            <p>
              Maantie- ja yhteysalusliikenteen järjestäjä on Varsinais-Suomen ELY-keskus. Useimpia maantielauttoja ja losseja operoi Finferries. Yhteysaluksilla on useita eri operaattoreita. Risteilyreitit ovat yksityisten yritysten järjestämiä. Kunkin linjan operaattorin näet linjan tiedoista.
          </p>
          </div>
          : ""}

        {page === "live" ?
          <div className="infosection">
            <h2>{L2("menu.live")}</h2>
            {lang === "fi" && (
              <div>
                <p>Live-karttatasolla esitetään Saaristomeren alueella sijaintinsa ilmoittavat matkustaja-alukset. Sijaintitiedot esitetään lähes reaaliajassa, mutta ajoittain viivettä voi kuitenkin esiintyä muutamia minuutteja. Aluksen sijainnin ja suunnan lisäksi näytetään aluksen reitti viimeisen kolmen tunnin ajalta </p>
                <p>Live-karttatason saat käyttöön tästä tai asetusvalikosta.</p>
                <div className="layer">
                  <input type="checkbox" id="infolivelayercb" checked={this.props.layers.live} onChange={this.onChange.bind(this)}/>
                  <label className="layerselector" htmlFor="infolivelayercb">Live-karttataso</label>
                </div>
                <p>Liikennetietojen lähde <a href="http://www.liikennevirasto.fi">Liikennevirasto</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/">meri.digitraffic.fi</a>, lisenssi <a href="http://creativecommons.org/licenses/by/4.0/">CC 4.0 BY</a></p>
                <hr/>
                <h3>Marinetraffic</h3>
                <p>Kattavamman näkymän Saaristomeren ja koko maailman meriliikenteeseen saa mm. Marinetraffic.com-palvelusta</p>
              </div>
            )}
            {lang === "sv" && (
              <div>
                <span>Bara på engelska...</span>
              </div>
            )}
            {lang !== "fi" && (
              <div>
                <p>Live layer shows passanger vessels in the Finnish Archipelago. Location is shown almost in real time. However, from time to time there is a delay of up to a few minutes. In addition to location and direction, also the route from the last three hours is shown.</p>
                <p>You can switch Live layer on here or in the Settings menu.</p>
                <div className="layer">
                  <input type="checkbox" id="infolivelayercb" checked={this.props.layers.live} onChange={this.onChange.bind(this)}/>
                  <label className="layerselector" htmlFor="infolivelayercb">Live layer</label>
                </div>
                <p>Source of live data <a href="http://www.liikennevirasto.fi">Liikennevirasto</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/">meri.digitraffic.fi</a>, license <a href="http://creativecommons.org/licenses/by/4.0/">CC 4.0 BY</a></p>
                <hr/>
                <h3>Marinetraffic</h3>
                <p>A more comprehensive view to marine traffic is available e.g. in  Marinetraffic.com service.</p>
              </div>
            )}

            <button type="button" className="btn btn-secondary linkbutton external showLive" id="marinetrafficbutton" onClick={showLivePage}>Live by Marinetraffic.com</button>
          </div >
          : ""}

        {page === "linksinfo" ?
          <div className="infosection">
            <h2>{L2("menu.linksinfo")}</h2>

            <h3>{L2("infopage.ferries")}</h3>
            {link(["https://www.ely-keskus.fi/saaristoliikenne", "https://www.ely-keskus.fi/sv/saaristoliikenne", "https://www.ely-keskus.fi/en/web/ely-en/transport"],
              "ely",
              ["Varsinais-Suomen ELY-keskus", "NTM-centralen i Egentliga Finland", "ELY Centre in Southwest Finland"],
              ["Manner-Suomen maantielautta- ja yhteysalusliikenteen järjestäjä",
                "Fastlands-Finlands landsvägs- och förbindelsefartygstrafikens organisatör",
                "Authority responsible for organizing ferry routes in Mainland Finland"
              ], lang)}
            {link(["https://yhteysalus.fi/", "https://xn--frbindelsebt-3cb1u.fi/", "https://commuterferry.fi/"],
              "ely",
              ["Saariston yhteysalusliikenne", "Förbindelsebåtstrafiken i skärgården", "Commuter ferry traffic in the archipelago"],
              ["ELY-keskuksen ylläpitämä yhteysalusliikenteen pääsivu",
                "NTM-centralens huvudsidan för förbindelsebåtstrafiken",
                "The main page of commuter ferry traffic by ELY Centre"
              ], lang)}
            {link(["http://www.finferries.fi/", "http://www.finferries.fi/sv/", "http://www.finferries.fi/en/"],
              "finferries",
              "FinFerries.fi",
              ["Manner-Suomen tärkein maantielauttaoperaattori",
                "Fastlands-Finlands viktigaste landvägsfärjoperatör",
                "The main operator of ferries in Mainland Finland"
              ], lang)}
            {link("http://www.alandstrafiken.ax/",
              "alandstrafiken",
              "Alandstrafiken.ax",
              ["Ahvenanmaan lauttojen ja muun julkisen liikenteen järjestäjä. Aikataulut, varaukset, tiedotteet ym.",
                "Ålands färj- och andra offentlig trafiks organisatör. Tidtabeller, bokning, meddelanden osv.",
                "Organiser of ferries and other public transport in Åland. Timetables, bookings, announcements etc."
              ], lang)}

            <h3>{L2("infopage.touristinfo")}</h3>

            {link(["https://visitparainen.fi/saariston-rengastie/", "https://visitparainen.fi/sv/skargardens-ringvag/", "https://visitparainen.fi/en/archipelago-trail/"],
              "rengastie",
              ["Saarison rengastie", "Skärgårdens ringväg", "Saariston rengastie - The Archipelago Trail"],
              ["Turun saariston matkailuneuvonta",
              "Åbo skärgårdens turistinformation",
              "Turku Archipelago Tourist Information Center"], lang)}
            {link(["https://www.visitaland.com/fi/", "https://www.visitaland.com/", "https://www.visitaland.com/en/"],
              "visitaland",
              "Visit Åland",
              ["Ahvenanmaan matkailuneuvonta",
                "Ålands turistinformation",
                "Åland Tourist information Center"
              ], lang)}
            {link(["https://www.aland.travel/fi", "https://www.aland.travel/", "https://www.aland.travel/en"],
              "alandtravel",
              "Åland.travel",
              ["Ahvenanmaan saaristokuntien matkailutietoa. Föglö, Sottunga, Kumlinge, Vårdö, Brändö, Kökar.",
                "Ålands skärgårdkommunernas turistinformation. Föglö, Sottunga, Kumlinge, Vårdö, Brändö, Kökar.",
                "Tourist information of the archipelago municipalities in Åland. Föglö, Sottunga, Kumlinge, Vårdö, Brändö, Kökar."
              ], lang)}
              <h3>{L2("infopage.localinfo")}</h3>
              <ul>
              <li>{linkSpan(["https://visitparainen.fi/fi/", "https://visitparainen.fi/sv/", "https://visitparainen.fi/en/"], "pargas", ["Visit Pargas: Parainen - Nauvo - Korppoo - Houtskari - Iniö", "Visit Pargas: Pargas - Nagu - Korpo - Houtskär - Iniö", "Visit Pargas: Pargas - Nagu - Korpo - Houtskär - Iniö"], lang) }</li>
              <li>{linkSpan(["https://www.visitnaantali.com/", "https://www.visitnaantali.com/sv", "https://www.visitnaantali.com/en"], "naantali", ["Visit Naantali: Naantali - Rymättylä - Velkua", "Visit Naantali: Nådendal - Rimito - Velkua", "Visit Naantali: Naantali - Rymättylä - Velkua"], lang) }</li>
              <li>{linkSpan(["https://visitturku.fi/", "https://se.visitturku.fi/", "https://en.visitturku.fi/"], "turku", ["Visit Turku", "Visit Turku / Åbo", "Visit Turku"], lang) }</li>
              <li>{linkSpan(["https://www.visitkimitoon.fi/fi/", "https://www.visitkimitoon.fi/", "https://www.visitkimitoon.fi/en/"], "kemiö", ["Visit Kemiönsaari", "Visit Kimitoön", "Visit Kimitoön"], lang) }</li>
              <li>{linkSpan(["https://tourism.hanko.fi/", "https://tourism.hanko.fi/sv/", "https://tourism.hanko.fi/en/"], "hanko", ["Hanko", "Hangö", "Hanko"], lang) }</li>
              <li>{linkSpan(["https://kustavi.fi/", "https://kustavi.fi/sv", "https://kustavi.fi/en/"], "kustavi", ["Kustavi", "Gustavs", "Kustavi"], lang) }</li>
              <li>{linkSpan(["http://www.brando.ax/suomi/", "http://www.brando.ax/", "http://www.brando.ax/english/"], "brändö", "Brändö", lang) }</li>
              <li>{linkSpan(["https://www.kumlinge.ax/fi/tule-ja-tutustu", "https://www.kumlinge.ax/bo-besoka", "https://www.kumlinge.ax/en/stay-visit"], "kumlinge", "Kumlinge", lang) }</li>
              <li>{linkSpan(["https://www.kokar.ax/?lang=fi", "https://www.kokar.ax/", "https://www.kokar.ax/?lang=en"], "kökar", "Kökar", lang) }</li>
              <li>{linkSpan("http://www.sottunga.ax/turism", "sottunga", "Sottunga", lang) }</li>
              <li>{linkSpan("https://www.foglo.ax/se-och-gora", "föglö", "Föglö", lang) }</li>
            </ul>

          </div>
          : ""}

        {page === "appinfo" ?
          <div className="infosection">
            <h2>{L2("menu.appinfo")}</h2>
            {onlyInFinnish}
            <p>
              <img src="/mstile-70x70.png" alt="logo" style={{ width: "40px", height: "40px", verticalAlign: "baseline", marginBottom: "-7px" }} />
              <strong>Saaristolautat.fi</strong> on harrastuspohjalta tehty karttasovellus, jonka tiedot on koottu varsinaisten palveluntarjoajien nettisivuilta. Sovelluksen tarkoitus on auttaa saaristoon suuntaavien matkojen suunnittelussa.
            </p>
            <div className="alert alert-danger" role="alert" style={{ marginTop: "30px" }}>
              Tarkista aina reitit ja aikataulut palveluntarjoajien palveluista!
            </div>
            <div id="followbox">
              <h5>Seuraa Saaristolauttoja ja anna palautetta</h5>
              <ul>
                <li><a href="https://www.facebook.com/saaristolautat/" rel="noopener noreferrer" target="facebook"><i className="fa fa-facebook-official fbcolor" aria-hidden="true"></i><span>@saaristolautat</span></a></li>
                <li><a href="https://www.instagram.com/saaristolautat.fi/" rel="noopener noreferrer" target="instagram"><i className="fa fa-instagram instagramcolor" aria-hidden="true"></i><span>@saaristolautat.fi</span></a></li>
                <li><a href="mailto:feedback@saaristolautat.fi?subject=Palautetta Saaristolautat-sovelluksesta"><i className="fa fa-envelope-o" aria-hidden="true" style={{ color: "#000" }}></i><span>feedback@saaristolautat.fi</span></a></li>
              </ul>
            </div>
            <div id="licensebox">
              <p>
                Saaristolautat.fi © Kyösti Ranto 2018&mdash;2025
              </p>

              <div style={{ marginTop: "10px" }}></div>
              {L2("infopage.mapdata")} © <a href="http://www.google.com/">Google</a>,  <a href="http://www.openstreetmap.org/copyright" rel="noopener noreferrer" target="_blank">OpenStreetMap</a> contributors, <a href="http://www.maanmittauslaitos.fi/" rel="noopener noreferrer" target="_blank">Maanmittauslaitos</a>.
              <br />
              {L2("infopage.icons")} Font Awesome, <a href="http://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="license">CC 4.0 BY</a>
              <br />
              {L2("infopage.appicon")} by Freepik from <a href="https://www.flaticon.com" rel="noopener noreferrer" target="flaticon">www.flaticon.com</a>
              <br />
              {L2("infopage.trafficinfo")} <a href="http://www.liikennevirasto.fi" rel="noopener noreferrer" target="livi">Finnish Transport Agency</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/" rel="noopener noreferrer" target="digitraffic">meri.digitraffic.fi</a>, license <a href="http://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="license">CC 4.0 BY</a>
            </div>
          </div>
          : ""}
      </div>
    );
  }

  render() {
    return (
      <FModal id="infopage" style={{ display: "none" }} scrollTop={this.state.scrollTop} show={this.state.page} onClose={closeInfoPage} header="" body={this.renderContents(this.props.page)}>
      </FModal>
    );

  }
}

const mapStateToProps = (state) => {
  return {
    locale: state.settings.locale,
    layers: state.settings.layers,
    page: state.selection.infoPage
  };
};

export default connect(mapStateToProps)(InfoPage);
