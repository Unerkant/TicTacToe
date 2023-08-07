/**
* den 10.06.2023
*/

    // mouse effect anzeigen/aussetzen
    var mouseAktiv = true;
    // treffen sie ihre wahl, kreuz oder kreis
    var kreuzOderKreis = false;
    // wenn Spiel beginnt
    var spielAktiv = false;
    // Kreuz oder Kreis Click
    var kreuz = true;

    // Information Ausgabe
    var infoText = "";
    var infoOk = true;


    /*
     *  nur den kreuz oder kreis wellen + hover effekt,
     *  wenn ersten SpielStein gesetzt ist dann wahl + hover effekt aussetzen
     */
    $('.zeichenwahl').on({ click: function() {

            // wenn ersten Stein gesetzt ist, Wahl & Hover effect aussetzen, Zeile: 104
            if(spielAktiv){
                event.preventDefault();
                return;
            }

            // Kreuz oder Kreis wellen
            var ids = this.id;
            if(ids == 'KREUZWAHL'){

                kreuzGewellt();

            } else {

                kreisGewellt();

            }

        // nur hover effect anzeigen
        }, mouseenter: function() {

            if(mouseAktiv == true){
                $( this ).addClass( "wahlHover" );
            }

            // hover effect Löschen
        }, mouseleave: function() {

            if(mouseAktiv == true){
                $( this ).removeClass( "wahlHover" );
            }
        }
    });

    // Gewellte Stein anzeigen
    function kreuzGewellt(){
          $('#KREUZWAHL').addClass( "wahlHover" );
          $('#RUNDWAHL').removeClass( "wahlHover" );
          kreuz = true;
          mouseAktiv = false;
          kreuzOderKreis = true;

          // kurze info,
          spielSteinWellen("Sie haben Kreuz gewellt");
    }
    function kreisGewellt(){
         $('#RUNDWAHL').addClass( "wahlHover" );
         $('#KREUZWAHL').removeClass( "wahlHover" );
         kreuz = false;
         mouseAktiv = false;
         kreuzOderKreis = true;

         // kurze info
         spielSteinWellen("Sie Haben Kreis gewellt");
    }


    /*
     * nur Information Anzeige, von Zeile: 68 + 78
     * Spielstein wellen und Nachricht anzeigen, start(hier) Zeile: 38 & 46
     */
    function spielSteinWellen(gewelltestein){

        infoOk = true;
        //infoAnzeige(infoOk, stein);
        var steinGewellt = {"infook" : infoOk, "infotext" : gewelltestein};
        spielNachrichtSenden(steinGewellt);
    }


    /*
     *  kreuz oder kreis in den Spiel Feld setzen, mysocket.js Zeile: 53
     */
    var newObj = null;
    $( ".spielfeld" ).on( "click", function() {

        var id = this.id;
        if (istEinsDerBilderSichtbar(id) || kreuzOderKreis == false) {
            if(kreuzOderKreis == false){

                // nur Nachricht anzeigen, noch kein Spiel Stein gewellt
                infoText = "treffen sie ihre Wahl, kreuz oder kreis"
                infoOk = false;
                var ihreWahl = {"infook" : infoOk, "infotext" : infoText};
                spielNachrichtSenden(ihreWahl);

            } else {

                // einen click auf der Besetzten Feld, nachricht an allen anzeigen
                infoText = "bereits getätigt"
                infoOk = false;
                var feldBesetzt = {"infook" : infoOk, "infotext" : infoText};
                spielNachrichtSenden(feldBesetzt);

            }

            // mache nichts, wenn spielfeld schon gesetzt ist
            return;
        }

        // nach dem wellen des Steines, spiel aktivieren(wahl & hover wird ausgesetzt, Zeile: 26)
        spielAktiv = true;

        if (kreuz) {

            newObj = {"feldId" : id, "spielStein" : "kreuz"};
            // von angeklickte Feld, Daten weiter senden... mysocket.js Zeile: 121
            spielStandSenden(newObj);

        } else {

            newObj = {"feldId" : id, "spielStein" : "kreis"};
            // von angeklickte Feld, Daten weiter senden... mysocket.js Zeile: 121
            spielStandSenden(newObj);

        }

    });
    /*
     *  Benutzt nur von oberer  function '.spielfeld',
     *  prüfen ob angeklickte feld schon besetzt ist...
     */
    function istEinsDerBilderSichtbar(id) {
       return $("#"+id+"K").is(":visible") || $("#"+id+"R").is(":visible");
    }



    /*
     *  Spiel Stein(kreuz oder kreis) in richtigen Feld setzen,
     *  Beschreibung: die zugesendeten array hatte immer 9 size,
     *  Daten zugesendet von mysocket.js Zeile: 53
     *
     *  ACHTUNG: Original Daten kommen von hier oben, die function
     *   $( ".spielfeld" ).on( "click", function(){...}
     *   Zeile: 132 & 138 (hier oben), den array sieht so aus:
     *   {"feldId" : id, "spielStein" : "kreis"}
     */
    function spielFeldSetzen(feldData){

        for(var i = 0; i < 9; i++){

            if(feldData[i] == null){
                $("#" + (i+1) + "K").hide();
                $("#" + (i+1) + "R").hide();

                continue;
            }

            var steinAktiv = feldData[i] == "kreuz" ? "K" : "R";
            var steinNichtAktiv = feldData[i] == "kreis" ? "K" : "R";

            $("#" + (i+1) + steinAktiv).show();
            $("#" + (i+1) + steinNichtAktiv).hide();

        }
        //console.log('Push: ' + feldData);

    }



    /*
     *  Neues Spiel Starten,
     *
     *  Start: spielfragments.html Zeile: 88(a, onClick)
     *  Weitersenden: mysocket.js Zeile: 157
     */
    function neuesSpiel(){

        neuesSpielSenden();

        // Nachricht an alle Senden
        infoOk = true;
        infoText = "Ein neues Spiel beginnt!"
        var spielneustarten = {"infook" : infoOk, "infotext" : infoText};
        spielNachrichtSenden(spielneustarten);
    }


   /*
    *   Neues Spiel Starten
    *
    *   Start: mysocket.js Zeile: 77, 'stompClient.subscribe("/neuspielstarten/empfangen/alle"...'
    *   Aller variable in spielfeld.js auf start einstellung setzen
    */
    function spielVariableReset(){

        $('#RUNDWAHL').removeClass( "wahlHover" );
        $('#KREUZWAHL').removeClass( "wahlHover" );

        // mouse effect anzeigen/aussetzen
        mouseAktiv = true;
        // treffen sie ihre wahl, kreuz oder kreis
        kreuzOderKreis = false;
        // wenn Spiel beginnt
        spielAktiv = false;
        // Kreuz oder Kreis Click
        kreuz = true;

        // Information Ausgabe
        infoText = "";
        infoOk = true;

    }


    /*
     *  zugesendet von masocket.js Zeile: 78
     */
    function clientSessionAnzeigen(session){

        //alert("Session" + session.clientId);
        $("#clientsIdsAnzeige").text( session.clientsSessions );
    }

    /*
     *  Informationen Anzeigen,
     *  Zeile: (hier) 77, 81, 114, 150
     *  spielfragments.html     Zeile: 37
     */
    function infoAnzeige(ok, text){

        ok == "true" ? $("#spielInfo").css("color","black") : $("#spielInfo").css("color","red");
        $("#spielInfo").html("<p>"+text+"<p>");
        $("#spielInfo p").delay(2000).fadeOut(600);
        //setTimeout(function() {sleep(loschen)}, 2000);
    }
