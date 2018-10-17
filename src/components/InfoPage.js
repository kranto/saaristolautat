import React, { Component } from 'react';

export default class InfoPage extends Component {

  componentDidMount() {
    if (this.props.callback) this.props.callback();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="infopage" className="fmodal" style={{ display: "none" }}>

        <div id="infopagecontent">
          <button type="button" className="btn btn-secondary closeInfoButton" id="closeInfoPageButton"><i className="fa fa-times" aria-hidden="true"></i></button>

          <div id="gettingthere" className="infosection">
            <span lang="sv">Bara på finska...</span>
            <span lang="en">Only in Finnish...</span>
            <h2>Miten sinne pääsee</h2>
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

          <div id="alandferriesinfo" className="infosection">
            <span lang="sv">Bara på finska...</span>
            <span lang="en">Only in Finnish...</span>
            <h2>Ahvenanmaan lautat <img src="img/alandstrafiken.png" width="120px" alt="Ålandstrafiken" /></h2>
            <h3>Lauttareitit</h3>
            <ul className="ferrieslist">
              <li><div className="infopageroute" style={{ borderColor: "#db0a00" }}></div><strong>Pohjoinen linja</strong> yhdistää Manner-Suomen Kustavin Brändön kautta Ahvenanmantereen Vårdöhön.</li>
              <li><div className="infopageroute" style={{ borderColor: "#00a000" }}></div><strong>Eteläinen linja</strong> yhdistää Manner-Suomen Korppoon Ahvenanmantereen Lumparlandiin.</li>
              <li><div className="infopageroute" style={{ borderColor: "#f7c71a" }}></div><strong>Poikittainen linja</strong> yhdistää Eteläisen ja Pohjoisen linjan Lumparlandista Kumlingeen.</li>
              <li><div className="infopageroute" style={{ borderColor: "#004d9d" }}></div> <strong>Föglön linja</strong> yhdistää Föglön saaristokunnan Ahvenanmantereen Lumparlandiin.</li >
              <li><div className="infopageroute" style={{ borderColor: "#00a000", borderTopWidth: "5px", borderTopStyle: "dotted" }}></div> <strong>Vaijerilossit</strong> kulkevat lyhyitä etappeja pääsääntöisesti ilman aikataulua.</li >
            </ul >
            <h3>Hinnat</h3>
            <p>
              Ajoneuvojen kuljettaminen Ålandstrafikenin lautoilla on maksullista paitsi vaijerilosseilla. Hinnoittelusta johtuen käytännössä maksullista on ainoastaan lähtö saaristoon Ahvenanmantereelta tai Manner-Suomesta eli Hummelvikistä, Långnäsistä, Svinöstä, Vuonaisista ja Galtbystä. Saarten välillä kulkeminen sekä saaristosta poistuminen on maksutonta. Matkustajista ei peritä erikseen maksua.
          </p>
            <p>
              Maksu määräytyy vuodenajan, ajoneuvon sekä matkan pituuden ja keston mukaan. Jos matkustaa saman vuorokauden aikana koko matkan Suomesta Ahvenanmantereelle, on maksu huomattavasti korkeampi kuin saaristossa yövyttäessä. Verkosta etukäteen ostettuna maksuista saa 10 % alennuksen.
          </p>
            <p>
              Esimerkkihintoja kesällä 2018:
            </p>
            <table>
              <tbody>
                <tr><th colSpan="2">Yhteys</th><th><i className="fa fa-bicycle" aria-hidden="true"></i></th><th><i className="fa fa-motorcycle" aria-hidden="true"></i></th><th><i className="fa fa-car" aria-hidden="true"></i></th></tr>
                <tr><td><i className="fa fa-exchange" aria-hidden="true"></i></td><td>Manner-Suomi - saaristo - Manner-Suomi</td><td>6 €</td><td>21 €</td><td>34 €</td></tr>
                <tr><td><i className="fa fa-exchange" aria-hidden="true"></i></td><td>Vuosnainen - Brändö - Vuosnainen<br />(poikkeus edelliseen)</td><td>6 €</td><td>16 €</td><td>22 €</td></tr>
                <tr><td><i className="fa fa-long-arrow-right" aria-hidden="true"></i></td><td>Manner-Suomi - Ahvenanmanner<br />(yöpyminen saaristossa)</td><td>6 €</td><td>21 €</td><td>34 €</td></tr>
                <tr><td><i className="fa fa-long-arrow-right" aria-hidden="true"></i></td><td>Manner-Suomi - Ahvenanmanner<br />(saman vuorokauden aikana)</td><td>24 €</td><td>74 €</td><td>122 €</td></tr>
              </tbody>
            </table>
            <p>
              Useimmille lautoille voi varata paikan moottoriajoneuvolle ja suosituimpiin aikoihin se on ehdottomasti suositeltavaa. Varauksen voi tehdä <a href="http://online.alandstrafiken.ax/Login/Customer.aspx" rel="noopener noreferrer" target="other">verkossa</a> tai<br />puhelimitse <i className="fa fa-phone" aria-hidden="true"></i>&nbsp;<a className="tel" href="tel:+3581825600">+358&nbsp;18&nbsp;25&nbsp;600</a>.
          </p>
          </div >

          <div id="finlandferriesinfo" className="infosection">
            <span lang="sv">Bara på finska...</span>
            <span lang="en">Only in Finnish...</span>
            <h2>Manner-Suomen lautat</h2>
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
          </div >

          <div id="live" className="infosection">
            <h2 lang="fi">Live-näkymä</h2>
            <h2 lang="sv">Live-vy</h2>
            <h2 lang="en">Live view</h2>

            <div lang="fi">
              <p>Live-karttatasolla esitetään Saaristomeren alueella sijaintinsa ilmoittavat matkustaja-alukset. Sijaintitiedot esitetään lähes reaaliajassa, mutta ajoittain viivettä voi kuitenkin esiintyä muutamia minuutteja. Aluksen sijainnin ja suunnan lisäksi näytetään aluksen reitti viimeisen kolmen tunnin ajalta </p>
              <p>Liikennetietojen lähde <a href="http://www.liikennevirasto.fi">Liikennevirasto</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/">meri.digitraffic.fi</a>, lisenssi <a href="http://creativecommons.org/licenses/by/4.0/">CC 4.0 BY</a></p>
              <h3>Marinetraffic</h3>
              <p>Kattavamman näkymän Saaristomeren ja koko maailman meriliikenteeseen saa mm. Marinetraffic.com-palvelusta</p>
              <button type="button" className="btn btn-secondary linkbutton external showLive" style={{ width: "100%" }}>Live by Marinetraffic.com</button>
            </div>

            <div lang="sv">
              <span lang="sv">Bara på engelska...</span>
              <p>Live layer shows passanger vessels in the Finnish Archipelago. Location is shown almost in real time. However, from time to time there is a delay of up to a few minutes. In addition to location and direction, also the route from the last three hours is shown.</p>
              <p>Source of live data <a href="http://www.liikennevirasto.fi">Liikennevirasto</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/">meri.digitraffic.fi</a>, license <a href="http://creativecommons.org/licenses/by/4.0/">CC 4.0 BY</a></p>
              <h3>Marinetraffic</h3>
              <p>A more comprehensive view to marine traffic is available e.g. in  Marinetraffic.com service.</p>
              <button type="button" className="btn btn-secondary linkbutton external showLive" style={{ width: "100%" }}>Live by Marinetraffic.com</button>
            </div >

            <div lang="en">
              <p>Live layer shows passanger vessels in the Finnish Archipelago. Location is shown almost in real time. However, from time to time there is a delay of up to a few minutes. In addition to location and direction, also the route from the last three hours is shown.</p>
              <p>Source of live data <a href="http://www.liikennevirasto.fi">Liikennevirasto</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/">meri.digitraffic.fi</a>, license <a href="http://creativecommons.org/licenses/by/4.0/">CC 4.0 BY</a></p>
              <h3>Marinetraffic</h3>
              <p>A more comprehensive view to marine traffic is available e.g. in  Marinetraffic.com service.</p>
              <button type="button" className="btn btn-secondary linkbutton external showLive" style={{ width: "100%" }}>Live by Marinetraffic.com</button>
            </div >
          </div >

          <div id="linksinfo" className="infosection">
            <h2 lang="fi">Linkkejä</h2>
            <h2 lang="sv">Länkar</h2>
            <h2 lang="en">Links</h2>

            <h3 lang="fi">Lautat</h3>
            <h3 lang="sv">Färjorna</h3>
            <h3 lang="en">Ferries</h3>

            <div lang="fi"><a href="http://lautta.net/?lang=fi" rel="noopener noreferrer" target="lauttanet">Lautta.net</a>
              <p>Kaikkien Manner-Suomen lauttojen portaali. Aikataulut, reittihaku, tiedotteet ym. </p>
            </div>
            <div lang="sv"><a href="http://lautta.net/?lang=sv" rel="noopener noreferrer" target="lauttanet">Lautta.net</a>
              <p>Portal till alla Fastlands-Finlands färjor. Tidtabeller, ruttsökning, meddelanden osv.</p>
            </div>
            <div lang="en"><a href="http://lautta.net/?lang=en" rel="noopener noreferrer" target="lauttanet">Lautta.net</a>
              <p>Portal to all road ferries in Mainland Finland. Timetables, route finder, announcements etc.</p>
            </div>

            <div lang="fi"><a href="http://www.ely-keskus.fi/web/ely/saaristoliikenne" rel="noopener noreferrer" target="ely">Varsinais-Suomen ELY-keskus</a>
              <p>Manner-Suomen maantielautta- ja yhteysalusliikenteen järjestäjä</p>
            </div>
            <div lang="sv"><a href="http://www.ely-keskus.fi/sv/web/ely/saaristoliikenne" rel="noopener noreferrer" target="ely">NTM-centralen i Egentliga Finland</a>
              <p>Fastlands-Finlands landsvägs- och förbindelsefartygstrafikens organisatör</p>
            </div>
            <div lang="en"><a href="http://www.ely-keskus.fi/en/web/ely-en/transport" rel="noopener noreferrer" target="ely">ELY Centre in Southwest Finland</a>
              <p>Authority responsible for organizing ferry routes in Mainland Finland</p>
            </div>

            <div lang="fi"><a href="http://www.finferries.fi/" rel="noopener noreferrer" target="finferries">FinFerries.fi</a>
              <p>Manner-Suomen tärkein maantielauttaoperaattori</p>
            </div>
            <div lang="sv"><a href="http://www.finferries.fi/sv/" rel="noopener noreferrer" target="finferries">FinFerries.fi</a>
              <p>Fastlands-Finlands viktigaste landvägsfärjoperatör</p>
            </div>
            <div lang="en"><a href="http://www.finferries.fi/en/" rel="noopener noreferrer" target="finferries">FinFerries.fi</a>
              <p>The main operator of ferries in Mainland Finland</p>
            </div>

            <div lang="fi"><a href="http://www.alandstrafiken.ax/fi" rel="noopener noreferrer" target="alandstrafiken">Alandstrafiken.ax</a>
              <p>Ahvenanmaan lauttojen ja muun julkisen liikenteen järjestäjä. Aikataulut, varaukset, tiedotteet ym.</p>
            </div>
            <div lang="sv"><a href="http://www.alandstrafiken.ax/sv" rel="noopener noreferrer" target="alandstrafiken">Alandstrafiken.ax</a>
              <p>Ålands färj- och andra offentlig trafiks organisatör. Tidtabeller, bokning, meddelanden osv.</p>
            </div>
            <div lang="en"><a href="http://www.alandstrafiken.ax/en" rel="noopener noreferrer" target="alandstrafiken">Alandstrafiken.ax</a>
              <p>Organiser of ferries and other public transport in Åland. Timetables, bookings, announcements etc.</p>
            </div>

            <h3 lang="fi">Matkailutietoa</h3>
            <h3 lang="sv">Turistinformation</h3>
            <h3 lang="en">Tourist Information</h3>

            <div lang="fi"><a href="http://saaristo.org/index.php?page=101&lang=1" rel="noopener noreferrer" target="saaristoorg">Saaristo.org</a>
              <p>Turun saariston matkailuneuvonta</p>
            </div>
            <div lang="sv"><a href="http://saaristo.org/index.php?page=101&lang=3" rel="noopener noreferrer" target="saaristoorg">Saaristo.org</a>
              <p>Åbo skärgårdens turistinformation</p>
            </div>
            <div lang="en"><a href="http://saaristo.org/index.php?page=101&lang=2" rel="noopener noreferrer" target="saaristoorg">Saaristo.org</a>
              <p>Turku Archipelago Tourist Information Center</p>
            </div>

            <div lang="fi"><a href="http://www.visitaland.com/fi/" rel="noopener noreferrer" target="visitaland">Visit Åland</a>
              <p>Ahvenanmaan matkailuneuvonta</p>
            </div>
            <div lang="sv"><a href="http://www.visitaland.com/" rel="noopener noreferrer" target="visitaland">Visit Åland</a>
              <p>Ålands turistinformation</p>
            </div>
            <div lang="en"><a href="http://www.visitaland.com/en/" rel="noopener noreferrer" target="visitaland">Visit Åland</a>
              <p>Åland Tourist information Center</p>
            </div>

            <div lang="fi"><a href="http://www.aland.travel/index-fi.html" rel="noopener noreferrer" target="alandtravel">Åland.travel</a>
              <p>Ahvenanmaan saaristokuntien matkailutietoa. Föglö, Sottunga, Kumlinge, Vårdö, Brändö, Kökar.</p>
            </div>
            <div lang="sv"><a href="http://www.aland.travel/index.html" rel="noopener noreferrer" target="alandtravel">Åland.travel</a>
              <p>Ålands skärgårdkommunernas turistinformation. Föglö, Sottunga, Kumlinge, Vårdö, Brändö, Kökar.</p>
            </div>
            <div lang="en"><a href="http://www.aland.travel/index-en.html" rel="noopener noreferrer" target="alandtravel">Åland.travel</a>
              <p>Tourist information of the archipelago municipalities in Åland. Föglö, Sottunga, Kumlinge, Vårdö, Brändö, Kökar.</p>
            </div>
          </div>

          <div id="appinfo" className="infosection">
            <h2 lang="fi">Tietoja sovelluksesta</h2>
            <h2 lang="sv">Info om appen</h2>
            <h2 lang="en">About the Application</h2>

            <span lang="sv">Bara på finska...</span>
            <span lang="en">Only in Finnish...</span>
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
                <li><a href="https://www.facebook.com/saaristolautat/" rel="noopener noreferrer" target="facebook"><i className="fa fa-facebook-official fbcolor" aria-hidden="true"></i> @saaristolautat</a></li>
                <li><a href="https://twitter.com/saaristolautat/" rel="noopener noreferrer" target="twitter"><i className="fa fa-twitter twittercolor" aria-hidden="true"></i> @saaristolautat</a></li>
                <li><a href="mailto:feedback@saaristolautat.fi?subject=Palautetta Saaristolautat-sovelluksesta"><i className="fa fa-envelope-o" aria-hidden="true" style={{ color: "#000" }}></i> feedback@saaristolautat.fi</a></li>
              </ul>
            </div>
            <div id="licensebox">
              <p>
                Saaristolautat.fi © Kyösti Ranto 2018
            </p>

              <div style={{ marginTop: "10px" }} />
              <span lang="fi">Karttatiedot</span>
              <span lang="sv">Karta data</span>
              <span lang="en">Map data</span> © <a href="http://www.google.com/">Google</a>,  <a href="http://www.openstreetmap.org/copyright" rel="noopener noreferrer" target="_blank">OpenStreetMap</a> contributors, <a href="http://www.maanmittauslaitos.fi/" rel="noopener noreferrer" target="_blank">Maanmittauslaitos</a>.
            <br />
              <span lang="fi">Ikonit</span>
              <span lang="sv">Ikoner</span>
              <span lang="en">Icons by</span> Font Awesome, <a href="http://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="license">CC 4.0 BY</a>
              <br />
              <span lang="fi">Sovellusikoni</span>
              <span lang="sv">App ikon</span>
              <span lang="en">Application icon made</span>
              by Freepik from <a href="https://www.flaticon.com" rel="noopener noreferrer" target="flaticon">www.flaticon.com</a>
              <br />
              <span lang="fi">
                Liikennetietojen lähde <a href="http://www.liikennevirasto.fi" rel="noopener noreferrer" target="livi">Liikennevirasto</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/" rel="noopener noreferrer" target="digitraffic">meri.digitraffic.fi</a>, lisenssi <a href="http://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="license">CC 4.0 BY</a>
              </span>
              <span lang="sv">
                Trafikuppgifternas källa <a href="http://www.liikennevirasto.fi" rel="noopener noreferrer" target="livi">Trafikverket</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/" rel="noopener noreferrer" target="digitraffic">meri.digitraffic.fi</a>, licens <a href="http://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="license">CC 4.0 BY</a>
              </span>
              <span lang="en">
                Source of traffic information <a href="http://www.liikennevirasto.fi" rel="noopener noreferrer" target="livi">Finnish Transport Agency</a> / <a href="http://digitraffic.liikennevirasto.fi/meriliikenne/" rel="noopener noreferrer" target="digitraffic">meri.digitraffic.fi</a>, license <a href="http://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="license">CC 4.0 BY</a>
              </span>
            </div>
          </div >
        </div >
      </div>
    );
  }
}
