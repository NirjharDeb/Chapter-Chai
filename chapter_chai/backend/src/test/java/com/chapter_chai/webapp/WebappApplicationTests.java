package com.chapter_chai.webapp;

import com.chapter_chai.webapp.controller.*;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

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
