package com.tictactoc.TicTacToe.controller;

import com.tictactoc.TicTacToe.model.Spielnachricht;
import com.tictactoc.TicTacToe.model.Spielstand;
import com.tictactoc.TicTacToe.service.ClienSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * den 11.06.2023
 */

@Controller
public class TictactoeController {

    @Autowired
    private ClienSessionService clienSessionService;
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    private List<String> sessionArray = new ArrayList<String>();
    private String[] spielstaende;
    private boolean kreuzIstDran = true;


    public TictactoeController(){

        neusSpielfeldErstellen();
    }

    /**
     * array leeren...(bei neuen Spielstart)
     */
    public void neusSpielfeldErstellen(){

        spielstaende = new String[9];
    }



    /**
     * Laden von Haupt Seite
     * @return
     */
    @GetMapping(value = "/tictactoe")
    public String tictacToe(Model model){

        UUID uuid = UUID.randomUUID();
        model.addAttribute("uuid", uuid.toString());
        return "/tictactoe";
    }


    /**
     * nur für Nachrichten schreiben, keine spiel Nachricht anzeigen
     * QUELLE: HOME -> 'eine Nachricht an alle schreiben'
     *
     * @param sessionsId
     * @param spielnachricht
     */
    @MessageMapping(value = "/spielnachricht/{sessionId}")
    public void spielNachrichtReceiving(@DestinationVariable("sessionId") String sessionsId, Spielnachricht spielnachricht){

        simpMessagingTemplate.convertAndSend("/spielnachricht/empfangen/" + sessionsId, spielnachricht);
    }



    /**
     * benutzt von spielstandReceiving Zeile: 67(hier oben)
     */
    @MessageMapping(value = "/spielstand/abfrage")
    public void  spielStandAbfrageReceiving(SimpMessageHeaderAccessor accessor){

        simpMessagingTemplate.convertAndSend("/spielstand/empfangen/alle", spielstaende);

    }



    /**
     * Spiel Stand in einen Array speichern...
     *
     * @param spielstand
     */
    @MessageMapping(value = "/spielstand")
    public void spielstandReceiving(Spielstand spielstand, SimpMessageHeaderAccessor accessor){

        String sessionId = accessor.getSessionId();

        // Spiel nut für Zwei zulassen
        if (!clienSessionService.istErsteOderZweiteSessionId(sessionId)) {

            schickeNachrichtAnEinenEmpfaenger(sessionId, "false", "Du darfst nicht spielen!");
            return;
        }

        // besetzte Spiel Feld
        if (!istPlatzAufDemSpielfeldFuerDiesenStein(spielstand)){

            schickeNachrichtAnEinenEmpfaenger(sessionId, "false", "Spielfeld " + spielstand.getFeldId() + " ist bereits belegt");
            return;
        }

        // Reihe Folge achten
        if (spielstand.getSpielStein().equals("kreis") && kreuzIstDran ||
            spielstand.getSpielStein().equals("kreuz") && !kreuzIstDran){

            String letzteStein = spielstand.getSpielStein().equals("kreuz") ? "&#10005;" : "&#9711;";
            schickeNachrichtAnEinenEmpfaenger(sessionId, "false", letzteStein + " ist nicht dran!");
            return;

        }

        // wenn alles nach dem reihe, folgt
        spielstaende[spielstand.getFeldId() - 1] = spielstand.getSpielStein();
        kreuzIstDran = !kreuzIstDran;
        simpMessagingTemplate.convertAndSend("/spielstand/empfangen/alle", spielstaende);

    }

    /**
     *  Prüfen, ob spiel Feld besetzt ist
     *  benutzt von der Methode oben, spielstand
     *
     * @param spielstand
     * @return
     */
    public boolean istPlatzAufDemSpielfeldFuerDiesenStein(Spielstand spielstand){

        if(spielstaende[spielstand.getFeldId() - 1] == null){

            return true;
        }

            return false;
    }


    /**
     * Nachricht an einen bestimmten User senden
     *
     * @param sessionIds
     * @param infoOk
     * @param infoText
     */
    private void schickeNachrichtAnEinenEmpfaenger(String sessionIds, String infoOk, String infoText){
        Spielnachricht spielnachricht = new Spielnachricht();
        spielnachricht.setInfook(infoOk);
        spielnachricht.setInfotext(infoText);

        simpMessagingTemplate.convertAndSend("/spielnachricht/empfangen/" + sessionIds, spielnachricht);
    }




    /**
     *  ACHTUNG: AUSGESETZT, DIE SESSION WIRD DIREKT FÜR AKTUELLEN CLIENT IN HEADER ANGEZEIGT(masocket.js Zeile: 24)
     *
     *  Client Session Anzeigen/entfernen
     *
     *  Kurze Beschreibung: Start in mysocket.js Zeile: 156
     *  function clientSessionAbfragen()... in function connected()
     *
     *  Kurze Beschreibung: eine neue sessionId bei hollen, bei Neuverbindung eines Clients,
     *  1. Start mysocket.js Zeile: 137, 208, ... stompClient.send("/app/clientSession", {});
     *  2. von hier werden in ClientSessionService die alle aktive sessionId zusammen gesetzt oder
     *      nicht aktive entfernt, und schliesslich von da an der socket (masocket.js Zeile: 51) gesendet
     *  3. zusetliche scripte:
     *      a. WebSocketEventListener:
     *          Um auf eine neue Anmeldung per Socket zu reagieren, gibt es in
     *          Sprint die Möglichkeit einen “EventListener“ zu definiert:
     *      b. ClientSessionService:
     *          hold den von socketListener generierte session Id und setzt alle zusammen,
     *          schliesslich sendet den list-array an socket wieter (mysocket.js Zeile: 51)
     *  4. mysocket.js: Zeile 51, da werden zugesendete daten verarbeitet und an alle angezegt
     *      in spielfeld.js Zeile: 235, ... function clientSessionAnzeigen(session)..
     *
     */
    @MessageMapping(value = "/clientSession")
    public void clientSessionAbfrageReceiving(){

        clienSessionService.sessionSenden(); //ClientSessionService Zeile: 63

    }



    /**
     * Neues Spiel Starten
     * Nachricht anzeige an allen, text definiert in socket(stopmClient)
     *
     * @return
     */
    @MessageMapping(value = "/neuspielstarten")
    public void neuesSpielStarten(){

        neusSpielfeldErstellen();
        simpMessagingTemplate.convertAndSend("/neuspielstarten/empfangen/alle", spielstaende);
        //System.out.println("Neues Spiel Beginnen: " + spielstaende);
    }


}
