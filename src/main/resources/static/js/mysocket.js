// den 10.06.2023


var stompClient = null;

function connect(){

    $('#eingabe').focus();

    //alert("connect");
    var socket = new SockJS('/registrieren');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame){
        //$('#verbunden').text('Verbunden').css("color","green");

        stompClient.subscribe("/nachrichten/empfangen/alle", function(message){
            var message = JSON.parse(message.body);

            $('#ausgabe').text('Ausgabe: ' + message.text);

        });

        stompClient.subscribe("/spielereignisse/empfangen/alle", function(spielereignisse){
            var spielzug = JSON.parse(spielereignisse.body);

            // Spiel kreuz oder kreis ins spielFeld setzen, spielfeld.js Zeile: 100
            spielFeldSetzen(spielzug.spielFeld, spielzug.spielStein);

            $('#spielInfo').text(spielzug.spielFeld + "/" + spielzug.spielStein);
        })

        willkommenNachricht();

    }, function(fehler) {
        fehlerNachricht(fehler);
        //$('#ausgabe').html("Es konnte keine Verbindung aufgebaut werden!<br>Fehlernachricht: " + fehler).css("color","red");
    });
}

function senden(textsenden){
    stompClient.send("/app/nachrichten", {}, JSON.stringify({'text': textsenden}));
}

function spielStandSenden(spielFeld, spielStein){

    stompClient.send("/app/spielereignisse", {}, JSON.stringify({'spielFeld': spielFeld, 'spielStein': spielStein }));

}




$(function(){
    connect();
});

function willkommenNachricht(){

    $('#online').removeClass("offlineBild").addClass("onlineBild");
    $('#onlineNachricht').removeClass("offlineBild").addClass("onlineBild");

   /* $('#verbunden').text('Verbindung zu Socket aufgebaut.')
    var nachrichtZumSenden = "Hallo ich bin online: " + $('#uuid').text();
    senden(nachrichtZumSenden);*/
}

function fehlerNachricht(fehler){

    $('#online').removeClass("onlineBild").addClass("offlineBild");
    $('#meineUUID').html("<span class='rot'>" + fehler + "</span>")
}
