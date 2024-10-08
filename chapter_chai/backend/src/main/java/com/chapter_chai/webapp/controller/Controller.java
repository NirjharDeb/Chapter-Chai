package com.chapter_chai.webapp.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import java.security.Principal;

@RestController
@RequestMapping("/api")
public class Controller {

    @GetMapping("/logged_in")
    public Principal user(Principal user) {
        return user;
    }
    

    // @GetMapping("/auth/check")
    // public ResponseEntity<?> checkAuth() {
    //     Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    //     if (auth != null && auth.isAuthenticated()) {
    //         return ResponseEntity.ok().body("{\"message\": \"User authenticated\"}");
    //     }
    //     return ResponseEntity.status(401).body("{\"message\": \"User NOT AUTHENTICATED\"}");
    // }
    

    // @PostMapping("/auth/login")
    // public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
    //     // Simulating user authentication, replace with DB-based authentication
    //     if ("user".equals(request.get("username")) && "password".equals(request.get("password"))) {
    //         // creates user role
    //         Role role = new Role("ROLE_USER");
    //         ArrayList<Role> roles = new ArrayList<>();
    //         roles.add(role);
    //         UserDetails userDetails = new User(request.get("username"), request.get("password"), roles);

    //         // authenticates user
    //         Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), null); // userDetails, password, authorities
    //         // SecurityContext context = SecurityContextHolder.createEmptyContext();
    //         // context.setAuthentication(auth);
    //         // SecurityContextHolder.setContext(context);
    //         SecurityContextHolder.getContext().setAuthentication(auth);

    //         return ResponseEntity.ok().body("{\"message\": \"User logged in successfully\"}");
    //     } else {
    //         return ResponseEntity.status(401).body("{\"message\": \"Invalid credentials\"}");
    //     }
    // }

    // @PostMapping("/auth/register")
    // public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
    //     // Here you would add logic for registering a new user, e.g., saving to DB
    //     return ResponseEntity.ok("New account created for user: " + request.get("username"));
    // }
}

// class Role implements GrantedAuthority {
//     private final String id;

//     public Role(String name) {
//         id = name;
//     }

//     @Override
//     public String getAuthority() {
//         return id;
//     }
// }
