package com.cts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Customercare360Application {

	public static void main(String[] args) {

        SpringApplication.run(Customercare360Application.class, args);
	}
}
