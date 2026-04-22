package com.tradetracker.pms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration using STOMP (Simple Text Oriented Messaging Protocol).
 *
 * This enables real-time, bidirectional communication between the server and the Angular frontend.
 * Instead of the client repeatedly polling the REST API for stock updates, the server pushes
 * new data to all connected clients via WebSocket as soon as it's available.
 *
 * Flow:
 * 1. The frontend connects to the "/ws" endpoint using SockJS (a fallback for browsers that don't support WebSocket).
 * 2. The frontend subscribes to "/topic/stock-quotes" to receive real-time stock price updates.
 * 3. The server (via FinnhubPollingService) broadcasts stock data to "/topic/stock-quotes" every 90 seconds.
 *
 * - "/topic" prefix: used for pub/sub messaging (one-to-many broadcast).
 * - SockJS: provides a WebSocket-like API with fallback transports (long-polling, streaming) for compatibility.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Configures a simple in-memory message broker that routes messages to clients subscribed to "/topic/*" destinations.
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
    }

    // Registers the STOMP endpoint that the frontend connects to. SockJS is enabled for browser compatibility.
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:4200")
                .withSockJS();
    }
}
