package com.chapter_chai.webapp;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SpringConfig {
    @Bean
    public SecurityFilterChain security_filter_chain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(registry->{
            registry.requestMatchers("/", "/login").permitAll();
            registry.anyRequest().authenticated();
        })
        .oauth2Login(Customizer.withDefaults())
        .formLogin(Customizer.withDefaults())
        .build();
    }
}