// den 10.06.2023

function nachrichtSenden(){

    var textEingabe = $('#eingabe').val();
    //$('#ausgabe').text(textEingabe);
    senden(textEingabe);
    //alert('senden: ' + textEingabe);
}

/*var stompClient = null;

function connect(){

    $('#eingabe').focus();

    //alert("connect");
    var socket = new SockJS('/registrieren');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame){
        $('#verbunden').text('Verbunden').css("color","green");

        stompClient.subscribe("/nachrichten/empfangen/alle", function(message){
            var message = JSON.parse(message.body);

            $('#ausgabe').text('Ausgabe: ' + message.text);
        });

        willkommenNachricht();

    }, function(fehlerNachricht) {
        $('#ausgabe').html("Es konnte keine Verbindung aufgebaut werden!<br>Fehlernachricht: " + fehlerNachricht).css("color","red");
    });
}

function senden(textsenden){
    stompClient.send("/app/nachrichten", {}, JSON.stringify({'text': textsenden}));

    $('#eingabe').val('');
    $('#eingabe').focus();
}


$(function(){
    connect();
});

function willkommenNachricht(){
    $('verbunden').text('Verbindung zu Socket aufgebaut.')
    var nachrichtZumSenden = "Hallo ich bin online: " + $('#uuid').text();
    senden(nachrichtZumSenden);
}*/


