package com.chapter_chai.webapp;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class SpringConfig {
    @Bean
    public SecurityFilterChain security_filter_chain(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(auth->{
            auth.requestMatchers("/static/**", "/manifest.json", "/favicon.ico", "/logo192.png", "/index.html", "/", "/auth/register", "/auth/login", "/auth/check").permitAll();
            auth.anyRequest().authenticated();
        })
        .oauth2Login(login->login.disable())
        .formLogin(login->login.disable())
        .csrf(csrf->csrf.disable())
        .sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
        .build();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("localhost:3000");
        config.addAllowedOrigin("localhost:8080");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public UserDetailsService user_details_service() {
        UserDetails userDetails = User.withDefaultPasswordEncoder()
            .username("user")
            .password("password")
            .roles("USER")
            .build();
        
            return new InMemoryUserDetailsManager(userDetails);
    }
}