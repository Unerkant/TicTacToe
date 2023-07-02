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
    var aktivStein = "";

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
    function kreuzGewellt(){
          $('#KREUZWAHL').addClass( "wahlHover" );
          $('#RUNDWAHL').removeClass( "wahlHover" );
          kreuz = true;
          mouseAktiv = false;
          kreuzOderKreis = true;
          aktivStein = "kreuz";
    }
    function kreisGewellt(){
         $('#RUNDWAHL').addClass( "wahlHover" );
         $('#KREUZWAHL').removeClass( "wahlHover" );
         kreuz = false;
         mouseAktiv = false;
         kreuzOderKreis = true;
         aktivStein = "kreis";
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
    var feldId = null;
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
            feldId = "#"+id+"K";
            newObj = {"spielFeld" : feldId, "spielStein" : "kreuz", "spielActiv" : true, "aktiveStein" : aktivStein};

            // von angeklickte Feld, Daten weiten senden... mysocket.js Zeile: 104
            spielStandSenden(newObj);

        } else {
            feldId = "#"+id+"R";
            newObj = {"spielFeld" : feldId, "spielStein" : "kreis", "spielActiv" : true, "aktiveStein" : aktivStein};

            // von angeklickte Feld, Daten weiten senden... mysocket.js Zeile: 104
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
     *  SpielStein(kreuz oder kreis) in richtigen Feld setzen,
     *  Daten zugesendet von mysocket.js Zeile: 44
     *
     *  ACHTUNG: Original Daten kommen von hier oben, die function
     *   $( ".spielfeld" ).on( "click", function(){...}
     *   Zeile: 106 & 113 (hier oben)
     */
     var feldArray  = [];
     var arrText    = "";
     var kreuzZahl  = 0;
     var kreisZahl  = 0;
     var activesStein = "";
    function spielFeldSetzen(feldData){

        //nur gesetzete kreuz oder kreis hoch zählen
        feldData.spielStein == "kreuz" ? kreuzZahl ++ : kreisZahl ++;
        $("#kreuzSpieler").text(kreuzZahl);
        $("#kreisSpieler").text(kreisZahl);

        // Auswahl der Steines wird gesperrt
        spielAktiv = feldData.spielActiv;

        // getroffenen Wahl-Stein an alle anzeigen
        activesStein     = feldData.aktiveStein;
        activesStein == "kreuz" ? kreuzGewellt() : kreisGewellt();

        // Daten in einem Array Puschen
        feldArray.push(feldData);
        var welchesStein    = null;
        var welchesFeld     = null;

        // zeige Kreuz oder Kreis an
        for(var x in feldArray){

            welchesStein    = feldArray[x].spielStein;
            welchesFeld     = feldArray[x].spielFeld;
            if(welchesStein == "kreuz"){

                $(welchesFeld).show();
                kreuz = false;

            } else if(welchesStein == "kreis"){

                $(welchesFeld).show();
                kreuz = true;

            }

        }

    }


    /*
     *  Neues Spiel Starten, spielfragments.html Zeile: 88(a, onClick)
     */
    function neuesSpiel(){

        var neuSpiel = false;
        neuArr = {"neuspiel" : neuSpiel};
        neuesSpielSenden(neuArr);

    }

    /*
    *  Spiel am Allen Browser Neu Starten, mysocket.js Zeile: 72
    */
    function spielNeuStarten(data){
        var dataFalse = data.neuspiel;

        $.post('/spielfeld', {}).done(function(data){

            $('#SPIELFELD').replaceWith(data);

                infoText = "Ein neues Spiel beginnt";
                infoOk = true;
                infoAnzeige(infoOk, infoText)
        });

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
