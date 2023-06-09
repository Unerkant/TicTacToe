package com.tictactoc.TicTacToe.controller;

import com.tictactoc.TicTacToe.model.Spielstand;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.UUID;

/**
 * den 11.06.2023
 */

@Controller
public class TictactoeController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

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
     * Message Mapping
     *
     * @param spielstand
     * @throws Exception
     */
    @MessageMapping(value = "/spielstand")
    public void spielstandReceiving(Spielstand spielstand) throws Exception{
        simpMessagingTemplate.convertAndSend("/spielstand/empfangen/alle", spielstand);
    }


    /**
     * Laden von Fragment: spielfeld
     * @return
     */
    @PostMapping(path = "/spielfeld")
    public String spielFeld(){
        System.out.println("Post Mapping: ");
        return "/tictactoe :: #SPIELFELD";
    }

}
