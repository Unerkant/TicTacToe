package com.tictactoc.TicTacToe.configuration;

import com.tictactoc.TicTacToe.service.ClienSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * den 1.08.2023
 */
@Component
public class WebSocketEventListener {

    @Autowired
    private ClienSessionService clienSessionService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event){
        String sessionId = getSessionId(event.getMessage());

        clienSessionService.sessionZufugen(sessionId);
        //clienSessionService.sessionSenden();
        //System.out.println("Socket eventListenr: " + sessionId);

    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event){
        String sessionId = getSessionId(event.getMessage());

        clienSessionService.sessionEntfernen(sessionId);
        clienSessionService.sessionSenden();
        //System.out.println("Socket Disconnect: " +sessionId);
    }

    /**
     * eine automatisch generierte session von socked holen
     *
     * @param message
     * @return
     */
    private String getSessionId(Message<byte[]> message){

        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(message);
        return headerAccessor.getSessionId();
    }

}
