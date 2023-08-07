package com.tictactoc.TicTacToe.controller;

import com.tictactoc.TicTacToe.configuration.WebSocketEventListener;
import com.tictactoc.TicTacToe.model.Spielstand;
import com.tictactoc.TicTacToe.service.ClienSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
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

    private final List<String> sessionArray = new ArrayList<String>();
    private String[] spielstaende;


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
     * Spiel Stand in einen Array speichern...
     * Kurze Beschreibung:
     * wenn in SpielFeld wird der mittleren feld(id:5) angeklickt + gewellt als spielStein eine 'kreuz',
     * wird automatisch einen array 'newObj = {"feldId" : id, "spielStein" : "kreuz"};' von spielfeld.js Zeile: 129
     * an socket gesendet... bevor der array an socket ankommt wird er hier bearbeitet, von mysocket.js Zeile: 125
     * 'stompClient.send("/app/spielstand", {}, JSON.stringify(spielStand));'...
     * hier unten in messageMapping wird die position der ckilck in variable spielstaende gespeichert...
     * die variable 'spielstaende' hatte feste 9 size, die zugesendete array hatte die ID: 5 + speilStein als 'kreuz',
     * das bedeutet: in variable 'spielstaende' unter die Position 5 wird den string 'kreuz' gespeichert...
     * [null,null,null,null,"kreuz",null,null,null,null]... dieser array wird weiter an socket gegeben
     * mysocket.js Zeile: 35... stompClient.subscribe("/spielstand/empfangen/alle", function(spielzug)
     * von socket wird der array weiter an alle gesendet und angezeigt...spielfeld.js Zeiel: 164
     * function spielFeldSetzen(feldData){... hier wierd der array durch die schleife bearbetet und an richtige stelle
     * den feld mit dem stein belegen(unser fall, auf 5 position einen kreuz setzen)...
     *
     *
     * @param spielstand
     */
    @MessageMapping(value = "/spielstand")
    public void spielstandReceiving(Spielstand spielstand){

        if (darfSteinSetzen(spielstand)) {
            spielstaende[spielstand.getFeldId() - 1] = spielstand.getSpielStein();
        }

        simpMessagingTemplate.convertAndSend("/spielstand/empfangen/alle", spielstaende);
        //System.out.println("Controller: " + spielstand.getFeldId() +" / "+ spielstand.getSpielStein() +" / "+ spielstaende);
    }


    /**
     *  Prüfen, ob spiel Feld besetzt ist
     *
     * @param spielstand
     * @return
     */
    public boolean darfSteinSetzen(Spielstand spielstand){

        if(spielstaende[spielstand.getFeldId() - 1] == null){

            return true;
        }

            return false;
    }


    /**
     *  Client Session Anzeigen/entfernen
     *
     *  Kurze Beschreibung: Start in mysocket.js Zeile: 166
     *  function clientSessionAbfragen()...
     *
     *  Kurze Beschreibung: eine neue sessionId bei hollen, bei Neuverbindung eines Clients,
     *  1. Start mysocket.js Zeile: 137, 208, ... stompClient.send("/app/clientSession", {});
     *  2. von hier werden in ClientSessionService die alle aktive sessionId zusammen gesetzt oder
     *      nicht aktive entfernt, und schliesslich von da an der socket (masocket.js Zeile: 73) gesendet
     *  3. zusetliche scripte:
     *      a. WebSocketEventListener:
     *          Um auf eine neue Anmeldung per Socket zu reagieren, gibt es in
     *          Sprint die Möglichkeit einen “EventListener“ zu definiert:
     *      b. ClientSessionService:
     *          hold den von socketListener generierte session Id und setzt alle zusammen,
     *          schliesslich sendet den list-array an socket wieter (mysocket.js Zeile: 73)
     *  4. mysocket.js: Zeile 73, da werden zugesendete daten verarbeitet und an alle angezegt
     *      in spielfeld.js Zeile: 235, ... function clientSessionAnzeigen(session)..
     *
     */
    @MessageMapping(value = "/clientSession")
    public void clientSessionAbfrageReceiving(){

        clienSessionService.sessionSenden();
        //System.out.println("TicTacTocController" );
    }


    /**
     * benutzt von spielstandReceiving Zeile: 67(hier oben)
     */
    @MessageMapping(value = "/spielstand/abfrage")
    public void  spielStandAbfrageReceiving(){

        simpMessagingTemplate.convertAndSend("/spielstand/empfangen/alle", spielstaende);

    }


    /**
     * Neues Spiel Starten
     * @return
     */
    @MessageMapping(value = "/neuspielstarten")
    public void neuesSpielStarten(){

        neusSpielfeldErstellen();
        simpMessagingTemplate.convertAndSend("/neuspielstarten/empfangen/alle", spielstaende);
        //System.out.println("Neues Spiel Beginnen: " + spielstaende);
    }


}
