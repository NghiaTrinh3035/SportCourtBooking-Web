package com.sportbooking.backend_sportcourtbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendSportCourtBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendSportCourtBookingApplication.class, args);
    }

}
