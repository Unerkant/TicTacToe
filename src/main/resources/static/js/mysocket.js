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

                $('#empfangFehler').html("JSON.parse Fehler:  <span class='rot'>" + e.message + "</span>");
            }

            /*
             * Spiel kreuz oder kreis ins spielFeld setzen,
             * weiter senden an spielfeld.js Zeile: 146
             * weitergeleitetn array sieht so aus:
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

            //$('#spielInfo').text(spielNachricht);
            infoAnzeige(spielNachricht.ok, spielNachricht.infotext);
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
 * Spiel Stand Senden, start spielfeld.js Zeile: 112 + 119
 */
function spielStandSenden(spielStand){

    // Spiel ereignisse weiter an Spiel Feld Senden, empfangen: zeile: 30(hier oben)
    stompClient.send("/app/spielstand", {}, JSON.stringify(spielStand));

}


/*
 *   Spielverlauf oder spielfehler an alle senden
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
