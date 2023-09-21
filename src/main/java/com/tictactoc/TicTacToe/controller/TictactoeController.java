package com.tictactoc.TicTacToe.controller;

import com.tictactoc.TicTacToe.model.Gewinnbenachrichtigung;
import com.tictactoc.TicTacToe.model.Gewinnercounter;
import com.tictactoc.TicTacToe.model.Spielnachricht;
import com.tictactoc.TicTacToe.model.Spielstand;
import com.tictactoc.TicTacToe.repository.Siege;
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
public class TictactoeController implements Siege {

    @Autowired
    private ClienSessionService clienSessionService;
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    private List<String> sessionArray = new ArrayList<String>();
    private String[] spielstaende;
    private boolean kreuzIstDran = true;
    private int kreuzCount = 0;
    private int kreisCount = 0;
    private int unentschieden = 0;


    public TictactoeController(){

        neusSpielfeldErstellen();
    }

    /**
     * array leeren...(bei neuen Spielstart)
     */
    public void neusSpielfeldErstellen(){

        spielstaende = new String[9];
        kreuzIstDran = true;
        // Zählt alle Zuge, nach jedem Spiel muss auf null gesetzt, Zeile: 175
        unentschieden = 0;

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

        gewinnCounterAnzeigen();
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


        /**
         * wenn alles nach der Reihe läuft,
         * dann nächsten zug(stein) wird in array gespeichert... [null,"kreuz",null,null,null,"kreis",null,null,null]
         */
        spielstaende[spielstand.getFeldId() - 1] = spielstand.getSpielStein();
        kreuzIstDran = !kreuzIstDran;
        simpMessagingTemplate.convertAndSend("/spielstand/empfangen/alle", spielstaende);


        /**
         * ACHTUNG: Gewinner Ermitteln, nach dem Setzen des Steines
         */
        TictactoeController controller = new TictactoeController();
        if (welcheSteinGewonnen("kreuz")){

            kreuzCount++;
            // count in interface Sige speichern
            controller.getKreuzCount(kreuzCount);
            // Gewinner Count ausgeben
            gewinnCounterAnzeigen();

            // Nachricht, wer gewonnen hatte
            gewinnBenachrichtigung("true", "Kreuz hatte Gewonnen", "kreuz");

        } else if (welcheSteinGewonnen("kreis")){

            kreisCount++;
            controller.getKreisCount(kreisCount);
            gewinnCounterAnzeigen();

            // Gewinner Nachricht anzeigen
            gewinnBenachrichtigung("true", "Kreis hatte Gewonnen", "kreis");

        } else{
            unentschieden++;
            // Ausgabe nach dem letzten Zug
            if (unentschieden == 9) {
                gewinnBenachrichtigung("true", "Unentschieden!", "keine");
            }
        }

    }


    /**
     *  Prüfen, ob spiel Feld besetzt ist
     *  benutzt von der Methode oben, spielstand
     *
     * @param spielstand
     * @return
     */
    private boolean istPlatzAufDemSpielfeldFuerDiesenStein(Spielstand spielstand){

        if(spielstaende[spielstand.getFeldId() - 1] == null){

            return true;
        }

            return false;
    }


    /**
     * senden an die Methode 'gewinnPosition()' varianten von gewinn-positionen,
     * schließlich in die Methode werde in den array 'spielstaende', [null,null,null,null,null,null,null,null,null]
     * nach belegten positionen geprüft....
     * Weiter detaillierte beschreibung unten, in commentary vor Methode gewinnPosition()...
     *
     * @param spielstein
     * @return
     */
    private boolean welcheSteinGewonnen(String spielstein){

        return  gewinnPosition(spielstein, 0, 1, 2) ||
                gewinnPosition(spielstein, 3, 4, 5) ||
                gewinnPosition(spielstein, 6, 7, 8) ||
                gewinnPosition(spielstein, 0, 3, 6) ||
                gewinnPosition(spielstein, 1, 4, 7) ||
                gewinnPosition(spielstein, 2, 5, 8) ||
                gewinnPosition(spielstein, 0, 4, 8) ||
                gewinnPosition(spielstein, 2, 4, 6);

    }


    /**
     *  Prüfen, ob alle Drei Steine in Gewinn Position stehen...
     *  z.b.s mittlere reihe mit kreuz gefühlt: wird zugesendet, spielstein = kreuz, position 3 + 4 + 5
     * 'gewinnPosition(spielstein, 3, 4, 5)'... dann von Array 'spielstaende' werden die Positionen abgefragt
     *  ["kreis",null,null,"kreuz","kreuz","kreuz",null,"kreis",null]...
     *  und schliesslich in variable gespeichert(positionEins, positionZwei und positionDrei)..
     *  Fazit: wenn alle drei positionen sind mit dem gleichen stein belegt, GEWONNEN
     *  in unserer fall der kreuz hatte gewonnen...
     *
     * @param spielstein
     * @param eins
     * @param zwei
     * @param drei
     * @return
     */
    private boolean gewinnPosition(String spielstein, int eins, int zwei, int drei ){

        String positionEins = spielstaende[eins];
        String positionZwei = spielstaende[zwei];
        String positionDrei = spielstaende[drei];

        return  positionEins != null && positionEins.equals(spielstein)
                &&
                positionZwei != null && positionZwei.equals(spielstein)
                &&
                positionDrei != null && positionDrei.equals(spielstein);

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
     * Gewinn Nachricht an alle schicken
     *
     * @param ok
     * @param text
     */
    private void gewinnBenachrichtigung(String ok, String text, String stein){

        Gewinnbenachrichtigung gewinnnachricht = new Gewinnbenachrichtigung();
        gewinnnachricht.setGewinnOk(ok);
        gewinnnachricht.setGewinnText(text);
        gewinnnachricht.setGewinnStein(stein);

        simpMessagingTemplate.convertAndSend("/gewinnnachrichten/empfangen/alle", gewinnnachricht);
    }


    /**
     * Gewinner Count Anzeige an alle anzeigen
     */
    private void gewinnCounterAnzeigen(){

        int kreuzTotal = getKreuzCount(kreuzCount);
        int kreisTotal = getKreisCount(kreisCount);
        Gewinnercounter gewinnercounter = new Gewinnercounter();
        gewinnercounter.setKreuzCountTotal(kreuzTotal);
        gewinnercounter.setKreisCountTotal(kreisTotal);

        simpMessagingTemplate.convertAndSend("/gewinnercounter/empfangen/alle", gewinnercounter);
    }

    /**
     * Schnittstele für Siege, einen Zähler für die Siege kreuz + kreis
     * @param count
     */
    @Override
    public int getKreuzCount(int count) {
        //System.out.println("Kreuz Count: " + count);
        return count;
    }

    /**
     *  Schnittstele für Siege, einen Zähler für die Siege kreuz + kreis
     * @param count
     */
    @Override
    public int getKreisCount(int count) {
        //System.out.println("Kreis Count: " + count);
        return count;
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
     *
     * die variable spielstaende auf null setzen, Zeile: 44 (hier oben)... neuesSpielfeldErstellen()...
     *
     * Nachricht anzeige an allen, text definiert in mysocket.js (stopmClient),
     * stompClient.subscribe("/neuspielstarten/empfangen/alle", Zeile: 121
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
