package com.cts.utils;

import com.cts.entity.Customer;
import com.cts.entity.User;
import com.cts.enums.CustomerStatus;
import com.cts.enums.CustomerType;
import java.time.LocalDateTime;

public class CustomerBuilder {
    public static Customer buildCustomer(User user, String name, String address,
                                         String regionCode, CustomerType type) {
        return Customer.builder()
                .user(user)
                .name(name)
                .address(address)
                .countryCode("IN")
                .regionCode(regionCode)
                .customerType(type)
                .customerStatus(CustomerStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }
}