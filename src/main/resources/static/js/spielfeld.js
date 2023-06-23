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
    // gesetzte kreuze/kreise zählen
    var kreuzZahl = 0;
    var kreisZahl = 0;
    var infoText = "";
    var infoOk = true;

    $('.zeichenwahl').on({
        click: function() {

            if(spielAktiv){
                event.preventDefault();
                // wenn Spiel Beginnt, Wahl & Hover effect aussetzen
                return;
            }

            mouseAktiv = false;
            kreuzOderKreis = true;

            // Kreuz oder Kreis wellen
            var ids = this.id;
            if(ids == 'KREUZWAHL'){

                $('#KREUZWAHL').addClass( "wahlHover" );
                $('#RUNDWAHL').removeClass( "wahlHover" );
                kreuz = true;
                nachrichtSenden("Kreuz gewellt");

            } else {

                $('#RUNDWAHL').addClass( "wahlHover" );
                $('#KREUZWAHL').removeClass( "wahlHover" );
                kreuz = false;
                // mysocket.js/
                nachrichtSenden("Kreis gewellt");

            }

            // hover effect anzeigen
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


    /* SpielFeld kreuze oder null setzen  */
    $( ".spielfeld" ).on( "click", function() {

        var id = this.id;
        if (istEinsDerBilderSichtbar(id) || kreuzOderKreis == false) {
            if(kreuzOderKreis == false){
                infoText = "treffen sie ihre Wahl, kreuz oder kreis"
                infoOk = false;
                infoAnzeige(infoOk, infoText);
            } else {
                infoText = "bereits getätigt"
                infoOk = false;
                infoAnzeige(infoOk, infoText);
            }
            // mache nichts, wenn spielfeld schon gesetzt ist
            return;
        }

        spielAktiv = true;

        //
        if (kreuz) {
            spielStandSenden(id, 'kreuz');
        } else {
            spielStandSenden(id, 'kreis');
        }


    });


    function spielFeldSetzen(spielFeld, spielStein){
          // zeige Kreuz oder Kreis an
                if (spielStein == 'kreuz') {
                    $("#"+spielFeld+"K").show();

                    kreuzZahl ++;
                    $("#kreuzSpieler").text(kreuzZahl);

                } else if(spielStein == 'kreis') {
                   $("#"+spielFeld+"R").show();

                    kreisZahl ++;
                    $("#kreisSpieler").text(kreisZahl);

                }

    }


    // Spiel Feld ist schon markiert
    function istEinsDerBilderSichtbar(id) {
        return $("#"+id+"K").is(":visible") || $("#"+id+"R").is(":visible");
    }


    function nachrichtSenden(text){

        senden(text);
    }


    /* Neues Spiel Starten */
    function neuesSpiel(){

        $.post('/spielfeld', {}).done(function(data){
            $('#SPIELFELD').replaceWith(data);

            infoText = "Ein neues Spiel beginnt";
            infoOk = true;
            infoAnzeige(infoOk, infoText)

        });

    }

    // Info Div ausblenden
    function infoAnzeige(ok, text){

        ok == true ? $("#textInfo").css("color","black") : $("#textInfo").css("color","red");
        $("#textInfo").html("<p>"+text+"<p>");
        $("#textInfo p").delay(2000).fadeOut(600);
        //setTimeout(function() {sleep(loschen)}, 2000);
    }
