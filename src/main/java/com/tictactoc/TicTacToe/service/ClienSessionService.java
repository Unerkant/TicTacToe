package com.tictactoc.TicTacToe.service;

import com.tictactoc.TicTacToe.model.Clientsession;
import com.tictactoc.TicTacToe.model.Spielnachricht;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class ClienSessionService {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    private ArrayList<String> aktiveSession;

    public ClienSessionService(){
        aktiveSession = new ArrayList<>();
    }

    /**
     * auf vorhandene session prüfen
     * @param sessionId
     * @return
     */
    public boolean sessionSchonVohanden(String sessionId){
        return aktiveSession.contains(sessionId);
    }

    /**
     * neuer session id zum array-list hinzufügen
     *
     * @param sessionId
     */
    public void sessionZufugen(String sessionId){

        if (sessionSchonVohanden(sessionId)){
            // schon vorhanden
            return;
        }

        aktiveSession.add(sessionId);
        //System.out.println(" zusammen setzen: " +aktiveSession);
    }

    /**
     * bei schliessen der socked(disconnect) sessionid entfernen
     *
     * @param sessionId
     */
    public void sessionEntfernen(String sessionId){
         aktiveSession.remove(sessionId);
        //System.out.println(" session entfernen: " +aktiveSession);
    }


    /**
     * zusammen gesetzte list-array mit den session-id an socket senden und schliesslich an alle anzeigen
     */
    public void sessionSenden(){

       /* Spielnachricht spielnachricht = new Spielnachricht();
        boolean connections = true;
        spielnachricht.setInfook(String.valueOf(connections));
        spielnachricht.setInfotext(aktiveSession.toString());*/
        Clientsession clientsession = new Clientsession();
        clientsession.setClientsSessions(aktiveSession.toString());

        // Sessionen senden an mysocket.js Zeile: 51
        simpMessagingTemplate.convertAndSend("/clientsession/empfangen/alle", clientsession);
        //System.out.println("Service session Senden: " + clientsession.getClientsSessions());
    }


    /* ********************** füt TicTacTocController ********************** */

    public boolean istErsteOderZweiteSessionId(String sessionId) {
        String ersteSession = getAktiveSessionAnPosition(0);
        String zweiteSession = getAktiveSessionAnPosition(1);

        if (ersteSession != null && ersteSession.equals(sessionId) ||
                zweiteSession != null && zweiteSession.equals(sessionId)) {
            return true;
        }

        return false;
    }

    private String getAktiveSessionAnPosition(int position) {
        if (aktiveSession.size() < position+1) {
            return null;
        }

        return aktiveSession.get(position);
    }

}
