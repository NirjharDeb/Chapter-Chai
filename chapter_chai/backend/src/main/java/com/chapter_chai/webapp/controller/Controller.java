package com.chapter_chai.webapp.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;



@RestController
@RequestMapping("/auth")
public class Controller {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        // In a real-world app, you'd authenticate the user, generate a token, and return it
        // For now, we're simulating success/failure.
        if ("user".equals(request.getUsername()) && "password".equals(request.getPassword())) {
            return ResponseEntity.ok("User logged in successfully");
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        // Here you would add logic for registering a new user, e.g., saving to DB
        return ResponseEntity.ok("New account created for user: " + request.getUsername());
    }
}

// Data class to handle incoming JSON requests
class AuthRequest {
    private String username;
    private String password;

    // getters and setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
