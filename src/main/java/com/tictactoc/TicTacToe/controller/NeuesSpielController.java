package com.tictactoc.TicTacToe.controller;

import com.tictactoc.TicTacToe.model.Neuesspiel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;


@Controller
public class NeuesSpielController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping(value = "/neuspielstarten")
    public void neuesspielReceiving(Neuesspiel neuesspiel) throws Exception{

        simpMessagingTemplate.convertAndSend("/neuspielstarten/empfangen/alle", neuesspiel);
    }
}
