package com.tictactoc.TicTacToe.controller;

import com.tictactoc.TicTacToe.model.Nachricht;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * den 10.06.2023
 */

@Controller
public class NachrichtController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;


    @GetMapping(value = "/nachricht")
    public String nachricht(){

        return "/nachricht";
    }


    @MessageMapping(value = "/nachrichten")
    public void messageReceiving(Nachricht nachricht) throws Exception{
        simpMessagingTemplate.convertAndSend("/nachrichten/empfangen/alle", nachricht);
    }
}
