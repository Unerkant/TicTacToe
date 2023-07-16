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
                // kurze info,
                spielSteinWellen("Sie haben Kreuz gewellt");

            } else {

                kreisGewellt();
                // kurze info
                spielSteinWellen("Sie Haben Kreis gewellt");

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
    }
    function kreisGewellt(){
         $('#RUNDWAHL').addClass( "wahlHover" );
         $('#KREUZWAHL').removeClass( "wahlHover" );
         kreuz = false;
         mouseAktiv = false;
         kreuzOderKreis = true;
    }


    /*
     * nur Information Anzeige
     * Spielstein wellen und Nachricht anzeigen, start(hier) Zeile: 38 & 46
     */
    function spielSteinWellen(gewelltestein){

        infoOk = true;
        //infoAnzeige(infoOk, stein);
        var steinGewellt = {"infook" : infoOk, "infotext" : gewelltestein};
        spielNachrichtSenden(steinGewellt);
    }


    /*
     *  kreuz oder kreis in den Spiel Feld setzen, mysocket.js Zeile: 67
     */
    var newObj = null;

    $( ".spielfeld" ).on( "click", function() {

        var id = this.id;
        if (istEinsDerBilderSichtbar(id) || kreuzOderKreis == false) {
            if(kreuzOderKreis == false){

                infoText = "treffen sie ihre Wahl, kreuz oder kreis"
                infoOk = false;
                //infoAnzeige(infoOk, infoText);

                var ihreWahl = {"infook" : infoOk, "infotext" : infoText};
                spielNachrichtSenden(ihreWahl);

            } else {

                infoText = "bereits getätigt"
                infoOk = false;
                //infoAnzeige(infoOk, infoText);

                // einen click auf der Besetzten Feld, nachricht an allen anzeigen
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
            // von angeklickte Feld, Daten weiter senden... mysocket.js Zeile: 104
            spielStandSenden(newObj);

        } else {

            newObj = {"feldId" : id, "spielStein" : "kreis"};
            // von angeklickte Feld, Daten weiter senden... mysocket.js Zeile: 104
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
     *  Daten zugesendet von mysocket.js Zeile: 52
     *
     *
     *
     *  ACHTUNG: Original Daten kommen von hier oben, die function
     *   $( ".spielfeld" ).on( "click", function(){...}
     *   Zeile: 129 & 135 (hier oben), den array sieht so aus:
     *   [null,null,null,"kreuz","kreis","kreuz",null,null,"kreis"]
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
     *  Informationen Anzeigen,
     *  Zeile: (hier) 77, 81, 114, 150
     *  spielfragments.html     Zeile: 37
     */
    function infoAnzeige(ok, text){

        ok == true ? $("#textInfo").css("color","black") : $("#textInfo").css("color","red");
        $("#textInfo").html("<p>"+text+"<p>");
        $("#textInfo p").delay(2000).fadeOut(600);
        //setTimeout(function() {sleep(loschen)}, 2000);
    }
