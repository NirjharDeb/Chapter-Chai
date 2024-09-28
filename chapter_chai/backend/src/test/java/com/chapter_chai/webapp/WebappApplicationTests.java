package com.chapter_chai.webapp;
import java.security.Principal;
import com.chapter_chai.webapp.controller.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

@SpringBootTest
class WebappApplicationTests {
	@Autowired
	private Controller controller;
	@Autowired
	private WebappApplication application;
	@Autowired
	private SpringConfig springConfig;




	@Test
	void contextLoads() {
		assertThat(controller).isNotNull();
		assertThat(application).isNotNull();
		assertThat(springConfig).isNotNull();
	}

	
}
