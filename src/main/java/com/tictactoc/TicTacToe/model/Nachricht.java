package com.tictactoc.TicTacToe.model;

/**
 * den 11.06.2023
 */



public class Nachricht {

    private String text;
    private String usersession;

    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }

    public String getUsersession() { return usersession; }
    public void setUsersession(String usersession) { this.usersession = usersession; }
}
