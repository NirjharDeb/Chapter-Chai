package com.chapter_chai.webapp.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;

@RestController
@RequestMapping("/api")
public class Controller {
    @GetMapping("/hello")
    public String sayHello() {
        return "Hello!!";
    }
    //using placeholder for now but this could lead to map
    @RequestMapping("/logged_in")
    public Principal user(Principal user) {
        return user;
    }
}
