package com.tictactoc.TicTacToe.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * den 11.06.2023
 */

@Controller
public class SpielfeldController {

    @GetMapping(value = "/spielfeld")
    public String spielfeld(){

        return "/spielfeld";
    }
}
