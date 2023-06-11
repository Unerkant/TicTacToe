// den 10.06.2023

var stompClient = null;

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
    });
}

function senden(){
    stompClient.send("/app/nachrichten", {}, JSON.stringify({'text': $('#eingabe').val()}));

    $('#eingabe').val('');
    $('#eingabe').focus();
}


function disconnect(){
    if(stompClient !== null){
        stompClient.disconnect();
    }
}


$(function(){
    $("form").on('submit', function(e){
        e.preventDefault();
    });
    $("#connect").click(function(){ connect(); });
    $("#disconnect").click(function(){ disconnect(); });
    $("#send").click(function(){ senden(); });
});