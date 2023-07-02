package com.tictactoc.TicTacToe.model;

/**
 * den 23.06.2023
 */

public class Spielstand {

    private String spielFeld;
    private String spielStein;
    private Boolean spielActiv;
    private String aktiveStein;

    public String getSpielFeld() { return spielFeld; }
    public void setSpielFeld(String spielFeld) { this.spielFeld = spielFeld; }

    public String getSpielStein() { return spielStein; }
    public void setSpielStein(String spielStein) { this.spielStein = spielStein; }

    public Boolean getSpielActiv() { return spielActiv; }
    public void setSpielActiv(Boolean spielActiv) { this.spielActiv = spielActiv; }

    public String getAktiveStein() { return aktiveStein; }
    public void setAktiveStein(String aktiveStein) { this.aktiveStein = aktiveStein; }

}
