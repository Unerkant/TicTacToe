package com.tictactoc.TicTacToe.controller;

import com.tictactoc.TicTacToe.model.Spielnachricht;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * den 1.07.2023
 */

@Controller
public class SpielnachrichtController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;


    /**
     * Senden eine Nachricht oder Fehlen von dem Spielverlauf,
     * ausgabe oben vordem Spiel Feld spielfragments.html Zeile: 38 #spielInfo
     *
     * @param spielnachricht
     */
    @MessageMapping(value = "/spielnachricht")
    public void spielmessageReceiving(Spielnachricht spielnachricht) throws Exception{
        simpMessagingTemplate.convertAndSend("/spielnachricht/empfangen/alle", spielnachricht);
    }
}
