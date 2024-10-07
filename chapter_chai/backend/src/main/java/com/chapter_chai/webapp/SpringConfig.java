package com.chapter_chai.webapp;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SpringConfig {
    @Bean
    public SecurityFilterChain security_filter_chain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(auth->{
            auth.requestMatchers("/static/**", "/manifest.json", "/favicon.ico", "/logo192.png", "/index.html").permitAll(); // react stuff
            auth.requestMatchers("/", "/auth/register", "/auth/login").permitAll(); // actual site
            auth.requestMatchers("/map").authenticated();
        })
        .oauth2Login(login->login.disable())
        .formLogin(login->login.disable())
        .build();
    }
}
