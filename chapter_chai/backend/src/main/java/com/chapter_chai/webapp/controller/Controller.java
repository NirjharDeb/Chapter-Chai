package com.chapter_chai.webapp.controller;

import java.util.ArrayList;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
// import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class Controller {
    @GetMapping("/auth/check")
    public ResponseEntity<?> checkAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return ResponseEntity.ok().body("{\"message\": \"User authenticated\"}");
        }
        return ResponseEntity.status(401).body("{\"message\": \"User NOT AUTHENTICATED\"}");
    }
    

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        // Simulating user authentication, replace with DB-based authentication
        if ("user".equals(request.get("username")) && "password".equals(request.get("password"))) {
            // creates user role
            Role role = new Role("ROLE_USER");
            ArrayList<Role> roles = new ArrayList<>();
            roles.add(role);
            UserDetails userDetails = new User(request.get("username"), request.get("password"), roles);

            // authenticates user
            Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), null); // userDetails, password, authorities
            // SecurityContext context = SecurityContextHolder.createEmptyContext();
            // context.setAuthentication(auth);
            // SecurityContextHolder.setContext(context);
            SecurityContextHolder.getContext().setAuthentication(auth);

            return ResponseEntity.ok().body("{\"message\": \"User logged in successfully\"}");
        } else {
            return ResponseEntity.status(401).body("{\"message\": \"Invalid credentials\"}");
        }
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        // Here you would add logic for registering a new user, e.g., saving to DB
        return ResponseEntity.ok("New account created for user: " + request.get("username"));
    }
}

class Role implements GrantedAuthority {
    private final String id;

    public Role(String name) {
        id = name;
    }

    @Override
    public String getAuthority() {
        return id;
    }
}
