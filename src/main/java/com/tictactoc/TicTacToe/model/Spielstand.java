package com.tictactoc.TicTacToe.model;

/**
 * den 23.06.2023
 */

public class Spielstand {

    private String feldId;
    private String bildId;
    private String spielStein;
    private Boolean spielActiv;
    private String aktiveStein;

    public String getFeldId() { return feldId; }
    public void setFeldId(String feldId) { this.feldId = feldId; }

    public String getBildId() { return bildId;}
    public void setBildId(String bildId) { this.bildId = bildId; }

    public String getSpielStein() { return spielStein; }
    public void setSpielStein(String spielStein) { this.spielStein = spielStein; }

    public Boolean getSpielActiv() { return spielActiv; }
    public void setSpielActiv(Boolean spielActiv) { this.spielActiv = spielActiv; }

    public String getAktiveStein() { return aktiveStein; }
    public void setAktiveStein(String aktiveStein) { this.aktiveStein = aktiveStein; }

}
