package com.tictactoc.TicTacToe.controller;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * den 9.6.2023
 */

@Controller
public class HomeController {

    @GetMapping(value = {"/", "/home"})
    public String home(){

        return "/spielfeld";
    }

}
