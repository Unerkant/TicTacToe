// den 10.06.2023


/*
 *  Socket, startet automatisch hier unten Zeile: 126
 */

    /* ************************* Socket + connect + disconnect ************************ */

var spielZugArray = [];
var stompClient = null;
var sessionID   = null;
function connect(){

    // Textarea Leeren Zeile: 225 (hier unten)
    textareaLeeren();

    //Socket + stompClient
    var socket = new SockJS('/registrieren');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame){

        // client sessionID aus den URL holen
        var registerPfad = this.ws._transport.url;
        var pfadElemente = registerPfad.split("/");
        sessionID    = pfadElemente[pfadElemente.length - 2];

        // tictactoe.html: client session ID in header anzeigen...
        $("#clientsIdsAnzeige").text( sessionID );
        // nachricht.html: client session ID in Header anzeigen
        $("#userSession").text(sessionID);

        /*
        *   Eingehende Nachricht, ausgabe in nachricht.html
        */
        stompClient.subscribe("/nachrichten/empfangen/alle", function(message){
            var message = JSON.parse(message.body);

            var valueHtml = "<ul><li>"+
                                "<p><span class='rot'>[" + message.usersession + "] </span>" +
                                "<span>" + message.text + "</span>"  +
                              "</p></li></ul>";
            $('#nachrichtAusgabe').html($('#nachrichtAusgabe').html()+valueHtml);
            //$('.messageBody').scrollTop($('.messageBody')[0].scrollHeight);

        });


        /*
         *  Client Session Id an Alle anzeigen, wer Online ist
         */
        stompClient.subscribe("/clientsession/empfangen/alle", (sessionenId) => {
            var clientSessionId = JSON.parse(sessionenId.body);

            clientSessionAnzeigen(clientSessionId.clientsSessions);
            // AUSGESETZT: wird Direkt nur für Aktuelle Client in Header angezeigt, Zeile:24 (hier oben)

        });


       /*
        *   Eingehende Daten von den Spiel, eine ID von Spiel Feld + kreuz oder kreis
        */
        stompClient.subscribe("/spielstand/empfangen/alle", function(spielzug){

            try{

                var spielZug = JSON.parse(spielzug.body);

                /*
                 * Spiel kreuz oder kreis ins spielFeld setzen,s
                 * weiter senden an spielfeld.js Zeile: 155
                 * weitergeleiteten array sieht so aus: feste 9 size
                 *  [null,null,null,"kreuz","kreis","kreuz",null,null,"kreis"]
                 */
                spielFeldSetzen(spielZug);

            } catch(e) {

                $('#spielInfo').html("JSON.parse Fehler:  <span class='rot'>" + e.message + "</span>");
            }





        });


        /*
         *   empfangen von Nachricht von Spielverlauf oder spielfehler
         *   1. SpielFeld ist besetzt: spielfeld.js Zeile: 113
         */
        stompClient.subscribe("/spielnachricht/empfangen/" + sessionID, (spielnachricht) => {

            try{

                var spielNachricht = JSON.parse(spielnachricht.body);

                //$('#spielInfo').text("Spiel Nachricht: " + spielNachricht.infotext);
                infoAnzeige(spielNachricht.infook, spielNachricht.infotext);
            } catch(e) {

                $('#spielInfo').html("JSON.parse Fehler:  <span class='rot'>" + e.message + "</span>");

            }

        });


        /*
         *   Spiel Reset, alle variablen auf start einstellung
         */
        stompClient.subscribe("/neuspielstarten/empfangen/alle", (spielreseten) => {
            var spielReseten = JSON.parse(spielreseten.body);

            spielFeldSetzen(spielReseten);
            spielVariableReset();
            var okInfo = true;
            var textInfo = "Ein neues Spiel beginnt!";
            infoAnzeige(okInfo, textInfo);
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
    //kreuzGewellt();
});


/*
 *  connect anzeige, start(hier) Zeile: 34
 *  Automatische Client session abfrage Zeile: 196 (hier unten)
 */
function connected(){

    $('#online').removeClass("offlineBild");
    $('#online').addClass("onlineBild");                //tictactoe.html
    $('#onlineNachricht').removeClass("offlineBild");
    $('#onlineNachricht').addClass("onlineBild");       //nachricht.html

    clientSessionAbfragen(); // client session holen/anzeigen Zeile:196 (hier unten)
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




    /* ***************************** Sende Methoden ********************************** */

/*
 * Nachrichten Senden, onClick in nachricht.html Zeile: 50
 *
 * Zusätzlich zum Text fügen wir noch eine User Session dazu...
 *  weiter gesendet an NachrichtController(@MessageMapping(value = "/nachrichten"))
 *  dann an den socket/stompClient (hier oben Zeile: 31)
 */
function nachrichtSenden(value){

    // wenn Text Feld Leer ist, nichts machen
    if(!value){
        $('#nachrichtText').focus();
        return;
    }


    var nachrichtZumSenden = {"text" : value, "usersession" : sessionID};
    // Nachricht mit User Session Versenden
    stompClient.send("/app/nachrichten", {}, JSON.stringify(nachrichtZumSenden));

    // Textarea Leeren Zeile: 225 (hier unten)
    textareaLeeren();

}


/*
 *  Client session Id abfragen, anzeigen und bei schliessen entfernen
 *  Automatische Start bei socket connected, Zeile: 156(hier oben)
 *
 *  Weitergeleitet an TictactoeController Zeile: 204,
 *  @MessageMapping(value = "/clientSession")
 */
function clientSessionAbfragen(){

    stompClient.send("/app/clientSession", {}); // ACHTUNG AUSGESETZT
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

    //$('#spielInfo').text("Spiel Nachricht: " +  texting.infotext);
    stompClient.send("/app/spielnachricht/" + sessionID, {}, JSON.stringify(texting));

}


/*
 *   Neues Spiel Beginnen
 *  Start: spielfeld.js Zeile: 180
 */
function neuesSpielStarten(){

    stompClient.send("/app/neuspielstarten", {}, "");

}

    /* ************************* Textarea ************************************************** */

/*
 *  wird benutzt hier Zeile: 14, 154
 */
function textareaLeeren(){
     // Text Input Leeren + Focus setzen
     $('#nachrichtText').val("");
     $('#nachrichtText').focus();
     $('#nachrichtText').css( "height", "36" );
}

