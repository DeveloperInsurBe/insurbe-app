export function buildGetOrderXML(data: any) {
  const { tariffIds, vorname, name, geburtsdatum, geschlecht, anrede, beginn } =
    data;

  const germanDob = geburtsdatum.split("-").reverse().join(".");
  const germanBeginn = beginn.split("-").reverse().join(".");

  const tariffXML = tariffIds
    .map(
      (id: string) => `
            <a:CT_Elementarprodukt i:type="a:CT_Tarif">
              <a:erweiterungField i:nil="true"/>
              <a:ablaufField i:nil="true"/>
              <a:bedingungenField i:nil="true"/>
              <a:beginnField i:nil="true"/>
              <a:beitragField i:nil="true"/>
              <a:bezeichnungField i:nil="true"/>
              <a:bezugsrechtField i:nil="true"/>
              <a:dauerField i:nil="true"/>
              <a:gewuenschteZahlungsweiseField i:nil="true"/>
              <a:gewuenschteZahlungsweiseFieldSpecified>false</a:gewuenschteZahlungsweiseFieldSpecified>
              <a:konditionField i:nil="true"/>
              <a:kurzbeschreibungField i:nil="true"/>
              <a:tarifgenerationField i:nil="true"/>
              <a:varianteField i:nil="true"/>
              <a:versicherungsunternehmenField i:nil="true"/>
              <a:dynamikField i:nil="true"/>
              <a:fondsPortfolioField i:nil="true"/>
              <a:leistungsausschlussField i:nil="true"/>
              <a:versicherungssummeOderLeistungField i:nil="true"/>
              <a:anwartschaftIDField i:nil="true"/>
              <a:anwartschaftIDFieldSpecified>false</a:anwartschaftIDFieldSpecified>
              <a:berechnungsgrundlageField i:nil="true"/>
              <a:berechnungsgrundlageFieldSpecified>false</a:berechnungsgrundlageFieldSpecified>
              <a:einzeltarifField i:nil="true"/>
              <a:einzeltarifFieldSpecified>false</a:einzeltarifFieldSpecified>
              <a:prozentstufeField i:nil="true"/>
              <a:prozentstufeFieldSpecified>false</a:prozentstufeFieldSpecified>
              <a:tarifIDField>${id}</a:tarifIDField>
              <a:wartezeiterlassField i:nil="true"/>
              <a:wartezeiterlassFieldSpecified>false</a:wartezeiterlassFieldSpecified>
            </a:CT_Elementarprodukt>`,
    )
    .join("");

  return `
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <getOrder xmlns="GEWA.COMP.VVGService">
      <request
        xmlns:a="http://schemas.datacontract.org/2004/07/GEWA.COMP.BiProClassesDefinition2_1_1_1_0"
        xmlns:i="http://www.w3.org/2001/XMLSchema-instance">

        <a:erweiterungField i:nil="true"/>
        <a:biPROVersionField i:nil="true"/>
        <a:consumerIDField i:nil="true"/>

        <a:antragField>
          <a:erweiterungField i:nil="true"/>
          <a:artIDField i:nil="true"/>
          <a:artIDFieldSpecified>false</a:artIDFieldSpecified>
          <a:dateiField i:nil="true"/>

          <a:dokumentanforderungField>
            <a:CT_Dokumentanforderung>
              <a:erweiterungField i:nil="true"/>
              <a:artIDField>
<a:ST_DokumentartID>BesondereBedingungen</a:ST_DokumentartID>
              </a:artIDField>
              <a:dateiIDField i:nil="true"/>
              <a:empfaengerField i:nil="true"/>
              <a:referenzEmpfaengerField i:nil="true"/>
              <a:vermittlerSpezifischeDokumentenergaenzungField i:nil="true"/>
              <a:vermittleranschriftAufDokumentField i:nil="true"/>
              <a:vermittleranschriftAufDokumentFieldSpecified>false</a:vermittleranschriftAufDokumentFieldSpecified>
              <a:versandartField i:nil="true"/>
              <a:versandartFieldSpecified>false</a:versandartFieldSpecified>
            </a:CT_Dokumentanforderung>
          </a:dokumentanforderungField>

          <a:dokumentinformationField i:nil="true"/>
          <a:erstelldatumField i:nil="true"/>
          <a:freitextField i:nil="true"/>

          <a:vermittlerField>
            <a:CT_Vermittler>
              <a:erweiterungField i:nil="true"/>
              <a:artField i:nil="true"/>
              <a:artFieldSpecified>false</a:artFieldSpecified>
              <a:iHKRegistrierungsnummerField i:nil="true"/>
              <a:partnerIDField>VM</a:partnerIDField>
              <a:vermittlerField i:nil="true"/>
              <a:vermittlernummerVMField>315356</a:vermittlernummerVMField>
              <a:vermittlernummerVUField>4254</a:vermittlernummerVUField>
              <a:vermittlerrolleField i:nil="true"/>
            </a:CT_Vermittler>
          </a:vermittlerField>

          <a:vorgangsnummerVMField i:nil="true"/>
          <a:vorgangsnummerVUField i:nil="true"/>
          <a:aktivitaetField i:nil="true"/>
          <a:gegenstandField i:nil="true"/>

          <a:partnerField>

            <!-- VP1: Insured person -->
            <a:CT_Partner i:type="a:CT_Person">
              <a:erweiterungField i:nil="true"/>
              <a:anredeField>${anrede}</a:anredeField>
              <a:anredeFieldSpecified>true</a:anredeFieldSpecified>
              <a:anschriftField i:nil="true"/>
              <a:bankverbindungField i:nil="true"/>
              <a:gruppenvertragspartnerField i:nil="true"/>
              <a:handeltAufRechnungVonField i:nil="true"/>
              <a:kommunikationsverbindungField i:nil="true"/>
              <a:nameField>${name}</a:nameField>
              <a:namenszusatz1Field i:nil="true"/>
              <a:namenszusatz2Field i:nil="true"/>
              <a:partnerIDField>VP1</a:partnerIDField>
              <a:partnerbeziehungField i:nil="true"/>
              <a:partnernummerVMField i:nil="true"/>
              <a:partnernummerVUField i:nil="true"/>
              <a:vertrauenspersonField i:nil="true"/>
              <a:vorsteuerabzugsberechtigtField i:nil="true"/>
              <a:vorsteuerabzugsberechtigtFieldSpecified>false</a:vorsteuerabzugsberechtigtFieldSpecified>
              <a:zusaetzlichePartnerdatenField i:nil="true"/>
              <a:adelspraedikatField i:nil="true"/>
              <a:ausbildungField i:nil="true"/>
              <a:ausweisField i:nil="true"/>
              <a:berufstaetigkeitField i:nil="true"/>
              <a:einkommenField i:nil="true"/>
              <a:einkommenssteuerField i:nil="true"/>
              <a:familienstandField i:nil="true"/>
              <a:familienstandFieldSpecified>false</a:familienstandFieldSpecified>
              <a:geburtsdatumField>${germanDob}</a:geburtsdatumField>
              <a:geburtslandField i:nil="true"/>
              <a:geburtslandFieldSpecified>false</a:geburtslandFieldSpecified>
              <a:geburtsnameField i:nil="true"/>
              <a:geburtsortField i:nil="true"/>
              <a:geschlechtField>${geschlecht}</a:geschlechtField>
              <a:geschlechtFieldSpecified>true</a:geschlechtFieldSpecified>
              <a:gesetzlicheKrankenversicherungField i:nil="true"/>
              <a:gesundheitsdatenField i:nil="true"/>
              <a:haushaltField i:nil="true"/>
              <a:inDeutschlandAnsaessigSeitField i:nil="true"/>
              <a:staatsangehoerigkeitField i:nil="true"/>
              <a:staatsangehoerigkeitFieldSpecified>false</a:staatsangehoerigkeitFieldSpecified>
              <a:steueridentifikationsnummerField i:nil="true"/>
              <a:titelField i:nil="true"/>
              <a:vornameField>${vorname}</a:vornameField>
            </a:CT_Partner>

          </a:partnerField>

          <a:verkaufsproduktField>
            <a:CT_Verkaufsprodukt>
              <a:erweiterungField i:nil="true"/>
              <a:ablaufField i:nil="true"/>
              <a:bedingungenField i:nil="true"/>
              <a:beginnField>${germanBeginn}</a:beginnField>
              <a:beitragField i:nil="true"/>
              <a:bezeichnungField i:nil="true"/>
              <a:bezugsrechtField i:nil="true"/>
              <a:dauerField i:nil="true"/>
              <a:gewuenschteZahlungsweiseField i:nil="true"/>
              <a:gewuenschteZahlungsweiseFieldSpecified>false</a:gewuenschteZahlungsweiseFieldSpecified>
              <a:konditionField i:nil="true"/>
              <a:kurzbeschreibungField i:nil="true"/>
              <a:tarifgenerationField i:nil="true"/>
              <a:varianteField i:nil="true"/>
              <a:versicherungsunternehmenField i:nil="true"/>
              <a:produktField>
                <a:CT_Produkt i:type="a:CT_KrankenProdukt">
                  <a:erweiterungField i:nil="true"/>
                  <a:ablaufField i:nil="true"/>
                  <a:bedingungenField i:nil="true"/>
                  <a:beginnField i:nil="true"/>
                  <a:beitragField i:nil="true"/>
                  <a:bezeichnungField i:nil="true"/>
                  <a:bezugsrechtField i:nil="true"/>
                  <a:dauerField i:nil="true"/>
                  <a:gewuenschteZahlungsweiseField i:nil="true"/>
                  <a:gewuenschteZahlungsweiseFieldSpecified>false</a:gewuenschteZahlungsweiseFieldSpecified>
                  <a:konditionField i:nil="true"/>
                  <a:kurzbeschreibungField i:nil="true"/>
                  <a:tarifgenerationField i:nil="true"/>
                  <a:varianteField i:nil="true"/>
                  <a:versicherungsunternehmenField i:nil="true"/>
                  <a:dynamikField i:nil="true"/>
                  <a:elementarproduktField>
                    ${tariffXML}
                  </a:elementarproduktField>
                  <a:leistungsausschlussField i:nil="true"/>
                  <a:paketField i:nil="true"/>
                  <a:produktField i:nil="true"/>
                  <a:sparteField i:nil="true"/>
                  <a:sparteFieldSpecified>false</a:sparteFieldSpecified>
                  <a:versicherungssummeOderLeistungField i:nil="true"/>
                  <a:versichertePersonField i:nil="true"/>
                </a:CT_Produkt>
              </a:produktField>
              <a:verkaufsproduktField i:nil="true"/>
            </a:CT_Verkaufsprodukt>
          </a:verkaufsproduktField>

          <a:versicherungsnehmerField i:nil="true"/>
          <a:vorNebenVersicherungField i:nil="true"/>
          <a:zahlungsartField i:nil="true"/>
          <a:zahlungsartFieldSpecified>false</a:zahlungsartFieldSpecified>
          <a:abschlussmodellField i:nil="true"/>
          <a:abschlussmodellFieldSpecified>false</a:abschlussmodellFieldSpecified>
          <a:aktenzeichenVMField i:nil="true"/>
          <a:aktenzeichenVNField i:nil="true"/>
          <a:aktionskennzeichenField i:nil="true"/>
          <a:antragUnterschriebenField i:nil="true"/>
          <a:antragUnterschriebenFieldSpecified>false</a:antragUnterschriebenFieldSpecified>
          <a:antragsartField>Item01</a:antragsartField>
          <a:antragsdatumField i:nil="true"/>
          <a:artDerBeratungField i:nil="true"/>
          <a:artDerBeratungFieldSpecified>false</a:artDerBeratungFieldSpecified>
          <a:bedingungUebergabeformField i:nil="true"/>
          <a:bedingungUebergabeformFieldSpecified>false</a:bedingungUebergabeformFieldSpecified>
          <a:bedingungenZurKenntnisGenommenField i:nil="true"/>
          <a:bedingungenZurKenntnisGenommenFieldSpecified>false</a:bedingungenZurKenntnisGenommenFieldSpecified>
          <a:beitragszahlerField i:nil="true"/>
          <a:besondereVereinbarungenField i:nil="true"/>
          <a:datenschutzerklaerungKenntnisnahmeField i:nil="true"/>
          <a:datenschutzerklaerungKenntnisnahmeFieldSpecified>false</a:datenschutzerklaerungKenntnisnahmeFieldSpecified>
          <a:datenschutzerklaerungUnterschriebenField i:nil="true"/>
          <a:datenschutzerklaerungUnterschriebenFieldSpecified>false</a:datenschutzerklaerungUnterschriebenFieldSpecified>
          <a:einwilligungInformationsanfrageField i:nil="true"/>
          <a:einwilligungInformationsanfrageFieldSpecified>false</a:einwilligungInformationsanfrageFieldSpecified>
          <a:hauptfaelligkeitField i:nil="true"/>
          <a:mailwerbungErwuenschtField i:nil="true"/>
          <a:mailwerbungErwuenschtFieldSpecified>false</a:mailwerbungErwuenschtFieldSpecified>
          <a:telefonwerbungErwuenschtField i:nil="true"/>
          <a:telefonwerbungErwuenschtFieldSpecified>false</a:telefonwerbungErwuenschtFieldSpecified>
          <a:unterschriftsverfahrenField>Item00</a:unterschriftsverfahrenField>
          <a:vVGBeratungsverzichtField i:nil="true"/>
          <a:vVGBeratungsverzichtFieldSpecified>false</a:vVGBeratungsverzichtFieldSpecified>
          <a:vertragsnummerField i:nil="true"/>
          <a:zusaetzlicheAntragsdatenField i:nil="true"/>
          <a:zustimmungFinanzdienstleisterField i:nil="true"/>
          <a:zustimmungFinanzdienstleisterFieldSpecified>false</a:zustimmungFinanzdienstleisterFieldSpecified>
        </a:antragField>

      </request>
    </getOrder>
  </s:Body>
</s:Envelope>
`;
}
