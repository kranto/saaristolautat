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

    return (
      <div>
        {page === "gettingthere" ?
          <div className="infosection">
            <h2>{L2("menu.gettingthere")}</h2>
            <h3>{getItem(["Autolla ja moottoripyörällä", "Med bil och motorcykel", "By car and motorcycle"], lang)}</h3>
            <p>{getItem([
              "Autolla ja moottoripyörällä on helppo seurata Saariston rengastietä Turusta Naantalin kautta Taivassaloon ja Kustaviin tai Paraisten kautta Nauvoon. Kustavista ja Korppoosta voi jatkaa matkaa Iniöön ja Houtskariin tai Ahvenanmaalle.",
              "Med bil eller motorcykel är det lätt att följa Skärgårdens ringväg från Åbo via Nådendal till Tövsala och Gustavs eller via Pargas till Nagu. Från Gustavs och Korpo kan man fortsätta till Iniö och Houtskär eller till Åland.",
              "By car or motorcycle, you can follow the Archipelago Trail from Turku via Naantali to Taivassalo and Kustavi, or via Pargas to Nagu. From Kustavi and Korpo you can continue to Iniö and Houtskär or to Åland."
            ], lang)}</p>
            <p>{getItem([
              "Ahvenanmaalle voi matkustaa myös suoraan autolautalla Helsingistä, Turusta ja Naantalista.",
              "Man kan också resa direkt till Åland med bilfärja från Helsingfors, Åbo och Nådendal.",
              "You can also travel directly to Åland by car ferry from Helsinki, Turku and Naantali."
            ], lang)}</p>
            <h3>{getItem(["Julkisilla", "Med kollektivtrafik", "By public transport"], lang)}</h3>
            <p><strong>{getItem(["Junalla", "Med tåg", "By train"], lang)}</strong> {getItem([
              "pääsee Turkuun, Saloon, Tammisaareen ja Hankoon. Tarkista aikataulut",
              "kommer man till Åbo, Salo, Ekenäs och Hangö. Kontrollera tidtabellerna hos",
              "you can reach Turku, Salo, Ekenäs and Hanko. Check the timetables on"
            ], lang)} <a href="http://www.vr.fi" rel="noopener noreferrer" target="_blank">VR</a>{getItem([":n palvelusta.", ".", "."], lang)}</p>
            <p>{getItem(["Turusta on", "Från Åbo finns", "From Turku there are"], lang)} <strong>{getItem(["linja-autoyhteyksiä", "bussförbindelser", "bus connections"], lang)}</strong> {getItem([
              "Kemiönsaaren Taalintehtaalle, Paraisille, Nauvoon, Korppooseen ja Houtskariin sekä Taivassalon kautta Kustaviin. Aikataulut löydät ",
              "till Dalsbruk på Kimitoön, Pargas, Nagu, Korpo och Houtskär samt via Tövsala till Gustavs. Tidtabellerna finns i ",
              "to Dalsbruk in Kimitoön, Pargas, Nagu, Korpo and Houtskär, and via Taivassalo to Kustavi. Timetables are available from "
            ], lang)}<a href="http://www.matkahuolto.fi" rel="noopener noreferrer" target="_blank">Matkahuolto</a>{getItem(["n palvelusta.", "s tjänst.", "."], lang)}</p>
            <p>{getItem([
              "Maarianhaminasta on linja-autoyhteyksiä ympäri Ahvenanmannerta, muun muassa kaikkiin satamiin. Reitit ja aikataulut näet",
              "Från Mariehamn finns bussförbindelser runt fasta Åland, bland annat till alla hamnar. Rutter och tidtabeller finns på",
              "Mariehamn has bus connections around the Åland mainland, including all ports. Routes and timetables are available on"
            ], lang)} <a href="https://www.alandstrafiken.ax/busstrafik" rel="noopener noreferrer" target="_blank">Ålandstrafiken</a>{getItem(["in sivuilta.", "s webbplats.", "."], lang)}</p>
            <p>{getItem(["Maarianhaminaan voi myös", "Man kan också", "You can also"], lang)} <strong>{getItem(["lentää", "flyga", "fly"], lang)}</strong> {getItem(["Turusta ja Helsingistä.", "till Mariehamn från Åbo och Helsingfors.", "to Mariehamn from Turku and Helsinki."], lang)}</p>
            <h3>{getItem(["Polkupyörällä", "Med cykel", "By bicycle"], lang)}</h3>
            <p>{getItem(["Turusta pääsee", "Från Åbo kan man följa", "From Turku you can follow"], lang)} <a href="https://visitparainen.fi/saariston-rengastie/" rel="noopener noreferrer" target="_blank">{getItem(["Saariston rengastietä", "Skärgårdens ringväg", "the Archipelago Trail"], lang)}</a> {getItem([
              "Kaarinan kautta Paraisille ja siitä edelleen Nauvoon ja Korppooseen. Vastapäivään voi polkea vaikkapa Naantalin kautta Velkuan Teersaloon ja jatkaa lautalla Taivassalon Hakkenpäähän.",
              "via S:t Karins till Pargas och vidare till Nagu och Korpo. I motsatt riktning kan man cykla via Nådendal till Teersalo i Velkua och fortsätta med färja till Hakkenpää i Tövsala.",
              "via Kaarina to Pargas and onwards to Nagu and Korpo. In the opposite direction, you can cycle via Naantali to Teersalo in Velkua and continue by ferry to Hakkenpää in Taivassalo."
            ], lang)}</p>
            <p>{getItem(["Turusta pääsee Nauvoon myös", "Från Åbo kommer man också till Nagu längs", "You can also travel from Turku to Nagu along"], lang)} <a href="https://visitparainen.fi/pieni-rengastie/" rel="noopener noreferrer" target="_blank">{getItem(["Pientä Rengastietä", "Lilla ringvägen", "the Small Archipelago Trail"], lang)}</a> {getItem(["Naantalin ja Rymättylän kautta tai suoraan", "via Nådendal och Rimito eller direkt med", "via Naantali and Rymättylä, or directly by"], lang)} <a href="https://vitharun.fi/fi/aikataulut/turku-seili-nauvo/" rel="noopener noreferrer" target="_blank">{getItem(["risteilyaluksella Aurajoen rannasta", "kryssningsfartyg från Aura å", "cruise vessel from the River Aura"], lang)}</a>. {getItem(["Myös linja-autot kuljettavat pyöriä, jos tilaa on.", "Även bussarna tar med cyklar om det finns plats.", "Buses also carry bicycles when space is available."], lang)}</p>
            <p>{getItem([
              "Korppoosta ja Kustavista on helppo siirtyä Ahvenanmaan lautoille ja jatkaa matkaa Brändöhön tai eteläisellä linjalla vaikkapa Kökariin ja Föglöhön. Ahvenanmaan matkan voi taittaa myös suoraan autolautalla Turusta, Helsingistä tai Naantalista. Ahvenanmaalta voi myös piipahtaa Ruotsin puolella Grisslehamnissa tai Kapellskärissä.",
              "Från Korpo och Gustavs är det lätt att fortsätta med Ålands färjor till Brändö eller längs södra linjen till exempelvis Kökar och Föglö. Man kan också resa direkt till Åland med bilfärja från Åbo, Helsingfors eller Nådendal. Från Åland kan man även göra en avstickare till Grisslehamn eller Kapellskär i Sverige.",
              "From Korpo and Kustavi it is easy to continue on the Åland ferries to Brändö or, along the Southern line, to Kökar and Föglö. You can also travel directly to Åland by car ferry from Turku, Helsinki or Naantali. From Åland you can make a side trip to Grisslehamn or Kapellskär in Sweden."
            ], lang)}</p>
            <p>{getItem(["Toinen suosittu reitistö on Salon, Kemiönsaaren ja Hangon kautta kulkeva", "En annan populär cykelled är", "Another popular cycling route is"], lang)} <a href="https://www.bikeland.fi/rannikkoreitti" rel="noopener noreferrer" target="_blank">{getItem(["Rannikkoreitti", "Kustrutten", "the Coastal Route"], lang)}</a>{getItem([".", " via Salo, Kimitoön och Hangö.", " via Salo, Kimitoön and Hanko."], lang)}</p>
            <p>{getItem([
              "Pyöräilijälle on vaihtoehtoja saaristossa lähes loputtomasti. Lähes kaikki saariston alukset ottavat polkupyörän kyytiin. Varmista tarvittaessa suoraan alukselta.",
              "För cyklister är alternativen i skärgården nästan obegränsade. Nästan alla fartyg i skärgården tar med cyklar. Kontrollera vid behov direkt med fartyget.",
              "Cyclists have almost endless options in the archipelago. Nearly all vessels carry bicycles. Check directly with the vessel when necessary."
            ], lang)}</p>
          </div>
          : ""}

        {page === "alandferriesinfo" ?
          <div className="infosection">
            <h2>{L2("menu.alandferriesinfo")} <img src="data/img/alandstrafiken.png" width="120px" alt="Ålandstrafiken" /></h2>
            <h3>{getItem(["Lauttareitit", "Färjelinjer", "Ferry routes"], lang)}</h3>
            <ul className="ferrieslist">
              <li><div className="infopageroute" style={{ borderColor: "#7a2736" }}></div><strong>{getItem(["Pohjoinen linja", "Norra linjen", "Northern line"], lang)}</strong> {getItem([
                "yhdistää Manner-Suomen Kustavin Brändön kautta Ahvenanmantereen Vårdöhön.",
                "förbinder Gustavs på fastlandet med Vårdö på fasta Åland via Brändö.",
                "connects Kustavi in mainland Finland with Vårdö on the Åland mainland via Brändö."
              ], lang)}</li>
              <li><div className="infopageroute" style={{ borderColor: "#3c854a" }}></div><strong>{getItem(["Eteläinen linja", "Södra linjen", "Southern line"], lang)}</strong> {getItem([
                "yhdistää Manner-Suomen Korppoon Ahvenanmantereen Lumparlandiin.",
                "förbinder Korpo på fastlandet med Lumparland på fasta Åland.",
                "connects Korpo in mainland Finland with Lumparland on the Åland mainland."
              ], lang)}</li>
              <li><div className="infopageroute" style={{ borderColor: "#34509f" }}></div> <strong>{getItem(["Föglön linja", "Föglölinjen", "Föglö line"], lang)}</strong> {getItem([
                "yhdistää Föglön saaristokunnan Ahvenanmantereen Lumparlandiin.",
                "förbinder skärgårdskommunen Föglö med Lumparland på fasta Åland.",
                "connects the archipelago municipality of Föglö with Lumparland on the Åland mainland."
              ], lang)}</li>
              <li><div className="infopageroute" style={{ borderColor: "#00a000", borderTopWidth: "5px", borderTopStyle: "dotted" }}></div> <strong>{getItem(["Vaijerilossit", "Vajerfärjor", "Cable ferries"], lang)}</strong> {getItem([
                "kulkevat lyhyitä etappeja pääsääntöisesti ilman aikataulua.",
                "trafikerar korta sträckor, i regel utan tidtabell.",
                "operate on short crossings, usually without a timetable."
              ], lang)}</li>
            </ul >
            <h3>{getItem(["Hinnat", "Priser", "Fares"], lang)}</h3>
            <p>
              {getItem([
                "Ajoneuvojen kuljettaminen Ålandstrafikenin lautoilla on maksullista, mutta vaijerilossit ovat maksuttomia. Maksu peritään saaristoon saavuttaessa Hummelvikistä, Långnäsistä, Svinöstä, Vuosnaisista tai Galtbystä. Välisatamien väliset matkat ja saaristosta poistuminen ovat maksuttomia. Hinta kattaa meno-paluun tai jatkomatkan saaristossa yöpymisen jälkeen. Matkustajista ei peritä erillistä maksua.",
                "Fordonstrafiken på Ålandstrafikens färjor är avgiftsbelagd, medan vajerfärjorna är avgiftsfria. Avgiften tas ut när man reser in i skärgården från Hummelvik, Långnäs, Svinö, Osnäs eller Galtby. Resor mellan mellanhamnar och ut ur skärgården är avgiftsfria. Priset omfattar tur och retur eller fortsatt resa efter övernattning i skärgården. Ingen separat avgift tas ut för passagerare.",
                "Vehicles are charged on Ålandstrafiken ferries, while cable ferries are free. The fare is charged when entering the archipelago from Hummelvik, Långnäs, Svinö, Osnäs or Galtby. Travel between intermediate ports and out of the archipelago is free. The fare includes a return journey or onward travel after an overnight stay in the archipelago. Passengers are not charged separately."
              ], lang)}
            </p>
            <p>
              {getItem([
                "Hinta määräytyy ajoneuvotyypin mukaan ja on sama reitistä, matkan pituudesta ja vuodenajasta riippumatta. Manner-Suomen ja Ahvenanmantereen välinen matka ilman pysähdystä tai yöpymistä saaristossa hinnoitellaan huomattavasti kalliimpana kauttakulkuna. Kevyt ajoneuvo saa 20 % alennuksen, kun matka varataan ja maksetaan etukäteen verkossa. Föglön linjaa ei voi varata, mutta Svinöstä lähtevät kevyet ajoneuvot saavat saman alennuksen.",
                "Priset bestäms av fordonstypen och är detsamma oavsett linje, resans längd och årstid. En resa mellan fasta Finland och fasta Åland utan stopp eller övernattning i skärgården prissätts som en betydligt dyrare genomfartsresa. Lätta fordon får 20 % rabatt när resan bokas och betalas online i förväg. Föglölinjen kan inte bokas, men lätta fordon från Svinö får samma rabatt.",
                "The fare is based on the vehicle type and is the same regardless of route, distance and season. Travel between mainland Finland and the Åland mainland without a stop or overnight stay in the archipelago is charged at a considerably higher transit fare. Light vehicles receive a 20% discount when the journey is booked and paid online in advance. The Föglö line cannot be booked, but light vehicles departing from Svinö receive the same discount."
              ], lang)}
            </p>
            <p>
              {getItem(["Esimerkkejä normaalihinnoista vuonna 2026:", "Exempel på ordinarie priser 2026:", "Examples of standard fares in 2026:"], lang)}
            </p>
            <table>
              <tbody>
                <tr><th colSpan="2">{getItem(["Yhteys", "Förbindelse", "Journey"], lang)}</th><th><i className="fa fa-bicycle" aria-hidden="true"></i></th><th><i className="fa fa-motorcycle" aria-hidden="true"></i></th><th><i className="fa fa-car" aria-hidden="true"></i></th></tr>
                <tr><td><i className="fa fa-exchange" aria-hidden="true"></i></td><td>{getItem(["Manner-Suomi – saaristo – Manner-Suomi", "Fasta Finland – skärgården – fasta Finland", "Mainland Finland – archipelago – mainland Finland"], lang)}</td><td>6 €</td><td>21 €</td><td>40 €</td></tr>
                <tr><td><i className="fa fa-long-arrow-right" aria-hidden="true"></i></td><td>{getItem(["Manner-Suomi – Ahvenanmanner", "Fasta Finland – fasta Åland", "Mainland Finland – Åland mainland"], lang)}<br />{getItem(["(yöpyminen saaristossa)", "(övernattning i skärgården)", "(overnight stay in the archipelago)"], lang)}</td><td>6 €</td><td>21 €</td><td>40 €</td></tr>
                <tr><td><i className="fa fa-long-arrow-right" aria-hidden="true"></i></td><td>{getItem(["Manner-Suomi – Ahvenanmanner", "Fasta Finland – fasta Åland", "Mainland Finland – Åland mainland"], lang)}<br />{getItem(["(saman vuorokauden aikana)", "(inom samma dygn)", "(within the same day)"], lang)}</td><td>28 €</td><td>87 €</td><td>143 €</td></tr>
              </tbody>
            </table>
            <p>
              {getItem([
                "Ålandstrafiken myy myös 60 euron turistikorttia, joka kattaa henkilöauton matkat saaristoon yhdeksän päivän ajan ostohetkestä.",
                "Ålandstrafiken säljer också ett turistkort för 60 euro som täcker resor med personbil till skärgården i nio dagar från köpet.",
                "Ålandstrafiken also sells a tourist card for 60 € that covers journeys to the archipelago by passenger car for nine days from purchase."
              ], lang)}
            </p>
            <p>
              {getItem(["Koko hinnasto löytyy", "Hela prislistan finns på", "The complete fare list is available on"], lang)} <a href="https://www.alandstrafiken.ax/farjetrafik/farjepriser" rel="noopener noreferrer" target="other">{getItem(["Ålandstrafikenin sivuilta", "Ålandstrafikens webbplats", "the Ålandstrafiken website"], lang)}</a>.
            </p>
            <p>
              {getItem([
                "Useimmille lautoille voi varata paikan moottoriajoneuvolle, ja suosituimpina aikoina se on ehdottomasti suositeltavaa. Varauksen voi tehdä",
                "På de flesta färjor kan man boka plats för motorfordon, vilket rekommenderas starkt under populära restider. Boka",
                "Space for a motor vehicle can be booked on most ferries and is strongly recommended at popular travel times. Book"
              ], lang)} <a href="https://www.alandstrafiken.ax/" rel="noopener noreferrer" target="other">{getItem(["verkossa", "online", "online"], lang)}</a> {getItem(["tai", "eller per telefon", "or by phone"], lang)}<br /><i className="fa fa-phone" aria-hidden="true"></i>&nbsp;<a className="tel" href="tel:+3581825600">+358&nbsp;18&nbsp;25&nbsp;600</a>.
          </p>
          </div >
          : ""}

        {page === "finlandferriesinfo" ?
          <div className="infosection">
            <h2>{L2("menu.finlandferriesinfo")}</h2>
            <h3>{getItem(["Lauttareitit", "Färjelinjer", "Ferry routes"], lang)}</h3>
            <ul className="ferrieslist">
              <li><div className="infopageroute" style={{ height: "20px", position: "relative", top: "12px", borderTopColor: "#005dd8", borderBottomColor: "#00a000", borderBottomWidth: "5px", borderBottomStyle: "dotted" }}></div><strong>{getItem(["Maantielautat ja lossit", "Landsvägsfärjor och vajerfärjor", "Road ferries and cable ferries"], lang)}</strong> {getItem([
                "kuljettavat ajoneuvoja ja matkustajia joko tarvittaessa tai aikataulun mukaan useita kertoja päivässä. Maantielautat ovat maksuttomia.",
                "transporterar fordon och passagerare antingen vid behov eller enligt tidtabell flera gånger om dagen. Landsvägsfärjorna är avgiftsfria.",
                "carry vehicles and passengers either on demand or several times a day according to a timetable. Road ferries are free of charge."
              ], lang)}</li>
              <li><div className="infopageroute" style={{ borderColor: "#7fb3e8", borderTopWidth: "3px" }}></div><strong>{getItem(["Yhteysalukset", "Förbindelsefartyg", "Commuter ferries"], lang)}</strong> {getItem([
                "kulkevat aikataulun mukaan useisiin saariin, mutta osin vain tilauksesta. Yhteysalukset ovat maksuttomia.",
                "trafikerar flera öar enligt tidtabell, men vissa anlöp sker endast på beställning. Förbindelsefartygen är avgiftsfria.",
                "serve several islands according to a timetable, but some calls operate only on request. Commuter ferries are free of charge."
              ], lang)}</li>
              <li><div className="infopageroute" style={{ borderColor: "#ff7c0a" }}></div> <strong>{getItem(["Rengasreitit", "Ringrutter", "Circular routes"], lang)}</strong> {getItem([
                "yhdistävät rengastiet kesäkaudella. Rengasreitit ovat maksullisia.",
                "förbinder ringvägarna under sommarsäsongen. Ringrutterna är avgiftsbelagda.",
                "connect the circular roads during the summer season. These routes charge a fare."
              ], lang)}</li>
              <li><div className="infopageroute" style={{ borderColor: "#ff7c0a", borderTopWidth: "3px", borderTopStyle: "dashed" }}></div> <strong>{getItem(["Risteilyalukset", "Kryssningsfartyg", "Cruise vessels"], lang)}</strong> {getItem([
                "kuljettavat vain matkustajia ja mahdollisesti polkupyöriä. Ne ovat maksullisia.",
                "transporterar endast passagerare och eventuellt cyklar. De är avgiftsbelagda.",
                "carry passengers and sometimes bicycles, but not vehicles. They charge a fare."
              ], lang)}</li>
            </ul>
            <p>
              {getItem([
                "Manner-Suomen lautat ovat pääsääntöisesti maksuttomia. Vain oranssilla merkityillä rengasreiteillä ja risteilyaluksilla peritään maksu.",
                "Färjorna på det finländska fastlandet är i regel avgiftsfria. Avgift tas endast ut på ringrutter och kryssningsfartyg som är markerade med orange.",
                "Ferries in mainland Finland are generally free of charge. Fares are charged only on circular routes and cruise vessels marked in orange."
              ], lang)}
          </p>
            <p>
              {getItem([
                "Maantielautat ja lossit liikennöivät enimmäkseen ilman tilausta, eikä niille voi varata paikkaa. Monet yhteysalusvuorot sen sijaan vaativat tilauksen etukäteen. Tarkista tilauksen tarve aikataulusta.",
                "Landsvägsfärjorna och vajerfärjorna trafikerar oftast utan beställning och kan inte bokas. Många turer med förbindelsefartyg måste däremot beställas i förväg. Kontrollera behovet av beställning i tidtabellen.",
                "Road ferries and cable ferries generally operate without advance notice and cannot be booked. Many commuter ferry departures, however, must be ordered in advance. Check the timetable for ordering requirements."
              ], lang)}
          </p>
            <p>
              {getItem([
                "Maantie- ja yhteysalusliikenteen järjestäjä on Lounais-Suomen elinvoimakeskus. Useimpia maantielauttoja ja losseja operoi Finferries. Yhteysaluksilla on useita eri operaattoreita. Risteilyreitit ovat yksityisten yritysten järjestämiä. Kunkin linjan operaattorin näet linjan tiedoista.",
                "Livskraftscentralen i Sydvästra Finland ordnar landsvägsfärje- och förbindelsefartygstrafiken. Finferries trafikerar de flesta landsvägs- och vajerfärjorna. Förbindelsefartygen har flera olika operatörer, medan kryssningsrutterna ordnas av privata företag. Operatören framgår av informationen för respektive linje.",
                "The Economic Development Centre for Southwest Finland organises road ferry and commuter ferry traffic. Finferries operates most road ferries and cable ferries. Commuter ferries have several different operators, while cruise routes are run by private companies. Each route's operator is shown in the route information."
              ], lang)}
          </p>
          </div>
          : ""}

        {page === "live" ?
          <div className="infosection">
            <h2>{L2("menu.live")}</h2>
            <p>{getItem([
              "Live-karttatasolla esitetään Saaristomeren alueella sijaintinsa ilmoittavat matkustaja-alukset. Sijaintitiedot esitetään lähes reaaliajassa, mutta ajoittain viivettä voi esiintyä muutamia minuutteja. Aluksen sijainnin ja suunnan lisäksi näytetään sen reitti viimeisen kolmen tunnin ajalta.",
              "Live-kartlagret visar passagerarfartyg som rapporterar sin position i Skärgårdshavet. Positionerna visas nästan i realtid, men ibland kan fördröjningen vara några minuter. Förutom fartygets position och riktning visas dess rutt under de senaste tre timmarna.",
              "The live map layer shows passenger vessels reporting their position in the Archipelago Sea. Positions are shown almost in real time, although delays of a few minutes may occur. In addition to a vessel's position and direction, its route over the past three hours is shown."
            ], lang)}</p>
            <p>{getItem([
              "Voit ottaa live-karttatason käyttöön tästä tai asetusvalikosta.",
              "Du kan aktivera live-kartlagret här eller i inställningsmenyn.",
              "You can enable the live map layer here or in the Settings menu."
            ], lang)}</p>
            <div className="layer">
              <input type="checkbox" id="infolivelayercb" checked={this.props.layers.live} onChange={this.onChange.bind(this)}/>
              <label className="layerselector" htmlFor="infolivelayercb">{getItem(["Live-karttataso", "Live-kartlager", "Live map layer"], lang)}</label>
            </div>
            <p>{getItem(["Liikennetietojen lähde", "Trafikuppgifternas källa", "Source of live data"], lang)} <a href="https://www.digitraffic.fi/meriliikenne/">Digitraffic</a>, {getItem(["lisenssi", "licens", "license"], lang)} <a href="http://creativecommons.org/licenses/by/4.0/">CC 4.0 BY</a></p>
            <hr/>
            <h3>MarineTraffic</h3>
            <p>{getItem([
              "Kattavamman näkymän Saaristomeren ja koko maailman meriliikenteeseen saa MarineTraffic.com-palvelusta.",
              "En mer omfattande vy över sjötrafiken i Skärgårdshavet och resten av världen finns på MarineTraffic.com.",
              "A more comprehensive view of marine traffic in the Archipelago Sea and worldwide is available on MarineTraffic.com."
            ], lang)}</p>
            <button type="button" className="btn btn-secondary linkbutton external showLive" id="marinetrafficbutton" onClick={showLivePage}>{getItem(["Live-näkymä MarineTraffic.comissa", "Live-vy på MarineTraffic.com", "Live view on MarineTraffic.com"], lang)}</button>
          </div >
          : ""}

        {page === "linksinfo" ?
          <div className="infosection">
            <h2>{L2("menu.linksinfo")}</h2>

            <h3>{L2("infopage.ferries")}</h3>
            {link(["https://elinvoimakeskus.fi/maantielautta-ja-yhteysalusliikenne", "https://elinvoimakeskus.fi/sv/maantielautta-ja-yhteysalusliikenne", "https://elinvoimakeskus.fi/maantielautta-ja-yhteysalusliikenne"],
              "elinvoimakeskus",
              ["Lounais-Suomen elinvoimakeskus", "Livskraftscentralen i Sydvästra Finland", "Economic Development Centre for Southwest Finland"],
              ["Manner-Suomen maantielautta- ja yhteysalusliikenteen järjestäjä",
                "Organisatör av landsvägsfärje- och förbindelsefartygstrafiken i Fastlandsfinland",
                "Authority responsible for road ferry and commuter ferry traffic in mainland Finland (page in Finnish)"
              ], lang)}
            {link(["https://yhteysalus.fi/", "https://xn--frbindelsebt-3cb1u.fi/", "https://commuterferry.fi/"],
              "ely",
              ["Saariston yhteysalusliikenne", "Förbindelsebåtstrafiken i skärgården", "Commuter ferry traffic in the archipelago"],
              ["Elinvoimakeskuksen ylläpitämä yhteysalusliikenteen pääsivu",
                "Livskraftscentralens huvudsida för förbindelsefartygstrafiken",
                "The Economic Development Centre's main commuter ferry website"
              ], lang)}
            {link(["https://www.finferries.fi/", "https://www.finferries.fi/sv/", "https://www.finferries.fi/en/"],
              "finferries",
              "Finferries.fi",
              ["Manner-Suomen tärkein maantielauttaoperaattori",
                "Fastlands-Finlands viktigaste landvägsfärjoperatör",
                "The main operator of ferries in Mainland Finland"
              ], lang)}
            {link("https://www.alandstrafiken.ax/",
              "alandstrafiken",
              ["Ålandstrafiken.ax (ruotsiksi)", "Ålandstrafiken.ax", "Ålandstrafiken.ax (in Swedish)"],
              ["Ahvenanmaan lauttojen ja muun julkisen liikenteen järjestäjä. Aikataulut, varaukset, tiedotteet ym.",
                "Organisatör av Ålands färje- och övriga kollektivtrafik. Tidtabeller, bokning och trafikmeddelanden.",
                "Organiser of ferries and other public transport in Åland. Timetables, bookings and traffic announcements."
              ], lang)}

            <h3>{L2("infopage.touristinfo")}</h3>

            {link(["https://visitparainen.fi/saariston-rengastie/", "https://visitparainen.fi/skargardens-ringvag/", "https://visitparainen.fi/archipelago-trail/"],
              "rengastie",
              ["Saariston rengastie", "Skärgårdens ringväg", "The Archipelago Trail"],
              ["Saariston rengastien virallinen reitti- ja matkailusivu",
              "Skärgårdens ringvägs officiella rutt- och turistsida",
              "The official route and visitor information for the Archipelago Trail"], lang)}
            {link(["https://visitaland.com/fi/", "https://visitaland.com/", "https://visitaland.com/en/"],
              "visitaland",
              "Visit Åland",
              ["Ahvenanmaan matkailuneuvonta",
                "Ålands turistinformation",
                "Official tourist information for Åland"
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
              <li>{linkSpan(["https://visitparainen.fi/", "https://visitparainen.fi/sv/", "https://visitparainen.fi/en/"], "pargas", ["Visit Pargas: Parainen - Nauvo - Korppoo - Houtskari - Iniö", "Visit Pargas: Pargas - Nagu - Korpo - Houtskär - Iniö", "Visit Pargas: Pargas - Nagu - Korpo - Houtskär - Iniö"], lang) }</li>
              <li>{linkSpan(["https://visitnaantali.com/", "https://visitnaantali.com/sv/", "https://visitnaantali.com/en/"], "naantali", ["Visit Naantali: Naantali - Rymättylä - Velkua", "Visit Naantali: Nådendal - Rimito - Velkua", "Visit Naantali: Naantali - Rymättylä - Velkua"], lang) }</li>
              <li>{linkSpan(["https://visitturku.fi/", "https://se.visitturku.fi/", "https://en.visitturku.fi/"], "turku", ["Visit Turku", "Visit Turku / Åbo", "Visit Turku"], lang) }</li>
              <li>{linkSpan(["https://www.visitkimitoon.fi/fi/", "https://www.visitkimitoon.fi/", "https://www.visitkimitoon.fi/en/"], "kemiö", ["Visit Kemiönsaari", "Visit Kimitoön", "Visit Kimitoön"], lang) }</li>
              <li>{linkSpan(["https://visithanko.fi/", "https://visithanko.fi/sv/hango/", "https://visithanko.fi/en/"], "hanko", ["Visit Hanko", "Visit Hangö", "Visit Hanko"], lang) }</li>
              <li>{linkSpan(["https://visitkustavi.fi/", "https://visitkustavi.fi/", "https://visitkustavi.fi/en/"], "kustavi", ["Visit Kustavi", "Visit Kustavi (på finska)", "Visit Kustavi"], lang) }</li>
              <li>{linkSpan(["https://www.brando.ax/suomi/", "https://www.brando.ax/", "https://www.brando.ax/english/"], "brändö", "Brändö", lang) }</li>
              <li>{linkSpan(["https://www.kumlinge.ax/fi/tule-ja-tutustu", "https://www.kumlinge.ax/bo-besoka", "https://www.kumlinge.ax/en/stay-visit"], "kumlinge", "Kumlinge", lang) }</li>
              <li>{linkSpan(["https://www.kokar.ax/?lang=fi", "https://www.kokar.ax/", "https://www.kokar.ax/?lang=en"], "kökar", "Kökar", lang) }</li>
              <li>{linkSpan(["https://www.aland.travel/sottunga-fi", "https://www.aland.travel/sottunga", "https://www.aland.travel/sottunga-en"], "sottunga", "Sottunga", lang) }</li>
              <li>{linkSpan("https://visitfoglo.ax/", "föglö", ["Visit Föglö (ruotsiksi)", "Visit Föglö", "Visit Föglö (in Swedish)"], lang) }</li>
              <li>{linkSpan(["https://www.aland.travel/vardo-fi", "https://www.aland.travel/vardo", "https://www.aland.travel/vardo-en"], "vårdö", "Vårdö", lang) }</li>
            </ul>

          </div>
          : ""}

        {page === "appinfo" ?
          <div className="infosection">
            <h2>{L2("menu.appinfo")}</h2>
            <p>
              <img src="/mstile-70x70.png" alt="logo" style={{ width: "40px", height: "40px", verticalAlign: "baseline", marginBottom: "-7px" }} />
              <strong>Saaristolautat.fi</strong> {getItem([
                "on harrastuspohjalta tehty karttasovellus, jonka tiedot on koottu varsinaisten palveluntarjoajien verkkosivuilta. Sovelluksen tarkoitus on auttaa saaristoon suuntaavien matkojen suunnittelussa.",
                "är en kartapplikation som har skapats som ett hobbyprojekt. Uppgifterna har sammanställts från de egentliga tjänsteleverantörernas webbplatser. Applikationen är avsedd att hjälpa till med planeringen av resor i skärgården.",
                "is a map application created as a hobby project. Its information has been compiled from the actual service providers' websites. The application is intended to help plan trips to the archipelago."
              ], lang)}
            </p>
            <div className="alert alert-danger" role="alert" style={{ marginTop: "30px" }}>
              {getItem([
                "Tarkista aina reitit ja aikataulut palveluntarjoajien palveluista!",
                "Kontrollera alltid rutter och tidtabeller hos tjänsteleverantörerna!",
                "Always check routes and timetables with the service providers!"
              ], lang)}
            </div>
            <div id="followbox">
              <h5>{getItem(["Seuraa Saaristolauttoja ja anna palautetta", "Följ Saaristolautat och ge respons", "Follow Saaristolautat and send feedback"], lang)}</h5>
              <ul>
                <li><a href="https://www.facebook.com/saaristolautat/" rel="noopener noreferrer" target="facebook"><i className="fa fa-facebook-official fbcolor" aria-hidden="true"></i><span>@saaristolautat</span></a></li>
                <li><a href="https://www.instagram.com/saaristolautat.fi/" rel="noopener noreferrer" target="instagram"><i className="fa fa-instagram instagramcolor" aria-hidden="true"></i><span>@saaristolautat.fi</span></a></li>
                <li><a href={`mailto:feedback@saaristolautat.fi?subject=${encodeURIComponent(getItem(["Palautetta Saaristolautat-sovelluksesta", "Respons om Saaristolautat", "Feedback on Saaristolautat"], lang))}`}><i className="fa fa-envelope-o" aria-hidden="true" style={{ color: "#000" }}></i><span>feedback@saaristolautat.fi</span></a></li>
              </ul>
            </div>
            <div id="licensebox">
              <p>
                Saaristolautat.fi © Kyösti Ranto 2018&mdash;2026
              </p>

              <div style={{ marginTop: "10px" }}></div>
              {L2("infopage.mapdata")} © <a href="https://openfreemap.org/" rel="noopener noreferrer" target="_blank">OpenFreeMap</a>, <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer" target="_blank">OpenStreetMap</a> contributors, <a href="https://www.maanmittauslaitos.fi/" rel="noopener noreferrer" target="_blank">Maanmittauslaitos</a>.
              <br />
              {L2("infopage.icons")} Font Awesome, <a href="http://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="license">CC 4.0 BY</a>
              <br />
              {L2("infopage.appicon")} {getItem(["tekijä", "av", "by"], lang)} Freepik, <a href="https://www.flaticon.com" rel="noopener noreferrer" target="flaticon">www.flaticon.com</a>
              <br />
              {L2("infopage.trafficinfo")} <a href="https://www.digitraffic.fi/meriliikenne/" rel="noopener noreferrer" target="digitraffic">Digitraffic</a>, {getItem(["lisenssi", "licens", "license"], lang)} <a href="http://creativecommons.org/licenses/by/4.0/" rel="noopener noreferrer" target="license">CC 4.0 BY</a>
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
