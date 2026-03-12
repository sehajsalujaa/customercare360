package com.cts.repository;

import com.cts.dto.CustomerProfileResponseDto;
import com.cts.entity.Customer;
import com.cts.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUser(User user);
}
