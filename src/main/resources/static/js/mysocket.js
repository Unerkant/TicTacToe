// den 10.06.2023


/*
 *  Socket
 */
var spielZugArray = [];
var stompClient = null;
function connect(){

    $('#nachrichtText').focus();

    //alert("connect");
    var socket = new SockJS('/registrieren');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame){
        //$('#verbunden').text('Verbunden').css("color","green");

        /*
        *   Eingehende Nachricht, ausgabe in nachricht.html
        */
        stompClient.subscribe("/nachrichten/empfangen/alle", function(message){
            var message = JSON.parse(message.body);

            var valueHtml = "<ul><li><p>" + message.text + "</p></li></ul>";
            $('#nachrichtAusgabe').html($('#nachrichtAusgabe').html()+valueHtml);
            //$('.messageBody').scrollTop($('.messageBody')[0].scrollHeight);

        });


       /*
        *   Eingehende Daten von den Spiel, eine ID von Spiel Feld + kreuz oder kreis
        */
        stompClient.subscribe("/spielstand/empfangen/alle", function(spielzug){

            try{

                var spielZug = JSON.parse(spielzug.body);

            } catch(e) {

                $('#spielInfo').html("JSON.parse Fehler:  <span class='rot'>" + e.message + "</span>");
            }

            /*
             * Spiel kreuz oder kreis ins spielFeld setzen,s
             * weiter senden an spielfeld.js Zeile: 163
             * weitergeleiteten array sieht so aus: feste 9 size
             *  [null,null,null,"kreuz","kreis","kreuz",null,null,"kreis"]
             */

            spielFeldSetzen(spielZug);

        });


        /*
        *   empfangen von Nachricht von Spielverlauf oder spielfehler
        *   1. SpielFeld ist besetzt: spielfeld.js Zeile: 113
        */
        stompClient.subscribe("/spielnachricht/empfangen/alle", (spielnachricht) => {
            var spielNachricht = JSON.parse(spielnachricht.body);

            //$('#spielInfo').text("Spiel Nachricht: " + spielNachricht.infook);
            infoAnzeige(spielNachricht.infook, spielNachricht.infotext);
        });


        /*
         *  Client Session Id an Alle anzeigen, wer Online ist
         */
        stompClient.subscribe("/clientsession/empfangen/alle", (sessionenId) => {
            var clientSessionId = JSON.parse(sessionenId.body);

            // client Session Id in spielfeld.js Zeile: 235 anzeigen...
            clientSessionAnzeigen(clientSessionId);
            //$('#spielInfo').text( "clientSessionId" + clientSessionId );
        });


        /*
         *   Spiel Reset, alle variablen auf start einstellung
         */
        stompClient.subscribe("/neuspielstarten/empfangen/alle", (spielreseten) => {
            var spielReseten = JSON.parse(spielreseten.body);

            spielFeldSetzen(spielReseten);
            spielVariableReset();
            //$('#spielInfo').text("Neues Spiel Beginnen" + spielReseten);
        });


        // socket verbindung aufgebaut, in Header/Rechts grünes Sender-Bild
        connected();


    }, function(err) {
        // reagiert nur auf defekten 'new SockJS('/registrieren')'... defekt: new SockJS('/reg');
        disconnected(err);
    });
}

/*
 * Socket Connect
 */
$(function(){
    connect();
});

    /* ****************** Sende Methoden ******************* */

/*
 * Nachrichten Senden, nachricht.html Zeile: 48(onClick)
 */
function nachrichtSenden(value){

    // wenn Text Feld Leer ist, nichts machen
    if(!value){
        $('#nachrichtText').focus();
        return;
    }
    // Nachricht Versenden
    stompClient.send("/app/nachrichten", {}, JSON.stringify({'text': value}));

     // Text Input Leeren + Focus setzen
     $('#nachrichtText').val("");
     $('#nachrichtText').focus();
}


/*
 *  Client session Id abfragen, anzeigen und bei schliessen entfernen
 *  Automatische Start bei socket connected, Zeile: 208(hier unten)
 *
 *  Weitergeleitet an TictactoeController Zeile: 114,
 *  @MessageMapping(value = "/clientSession")
 */
function clientSessionAbfragen(){

    stompClient.send("/app/clientSession", {});
}


/*
 * Spiel Stand Senden, start spielfeld.js Zeile: 112 + 119
 */
function spielStandSenden(spielStand){

   /*
    *   SpielStand array weiter leiten,
    *   zuerst werden die Daten in TictactoeController / @MessageMapping(value = "/spielstand")
    *   in einem neuen Array gespeichert: spielstaende = new String[9];
    *   von controller weiter an stompClient: stompClient.subscribe("/spielstand/empfangen/alle"
    *   hier oben Zeile: 35
    */

    stompClient.send("/app/spielstand", {}, JSON.stringify(spielStand));

}


/*
 *   Spielverlauf oder spielfehler an alle senden
 *   Zugesendet von spielfeld.js Zeile: 201
 */
function spielNachrichtSenden(texting){

    stompClient.send("/app/spielnachricht", {}, JSON.stringify(texting));

}


/*
 * ein abruf des laufendes Spiel, in neuen Browser wird den Aktuellen spielStand angezeigt
 * Da hier kein Body verlangt wird, wir keine ausgabe deklariert(stompClient.subscribe("/spielstand/abfrage.....)
 *
 *  ACHTUNG: der SpielStand des aktuelles Spiel wir automatisch bei neuem socket verbindung geprüft.
 *  Zeile: 167, function connected()...
 */
function spielStandAbfrage(){

    stompClient.send("/app/spielstand/abfrage", {});
}



/*
 *   Neues Spiel Beginnen
 *  Start: spielfeld.js Zeile: 195
 */
function neuesSpielSenden(){

    stompClient.send("/app/neuspielstarten", {}, "");

}



/*
 * connect anzeige, start(hier) Zeile: 34
 */
function connected(){

    $('#online').removeClass("offlineBild");
    $('#online').addClass("onlineBild");                //tictactoe.html
    $('#onlineNachricht').removeClass("offlineBild");
    $('#onlineNachricht').addClass("onlineBild");       //nachricht.html

    clientSessionAbfragen(); // client session holen/anzeigen Zeile:137 (hier oben)
    spielStandAbfrage();
}


/*
 *  Allgemeine Fehler Anzeige
 *  ID: #meineUUID + #online, sind in tictactoe.html Zeile: 31 + 35
 */
function disconnected(fehler){

    $('#online').removeClass("onlineBild");
    $('#online').addClass("onlineFehler");
    $('#meineUUID').html("<span class='rot'>" + fehler + "</span>");
}
