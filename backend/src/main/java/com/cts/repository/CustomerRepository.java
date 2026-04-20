package com.cts.repository;

import com.cts.entity.Customer;
import com.cts.entity.User;
import com.cts.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUser(User user);
    List<Customer> findByCustomerStatus(CustomerStatus status);
    long countByCustomerStatus(CustomerStatus status);

    @Query("SELECT c FROM Customer c JOIN c.user u WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "u.phone LIKE CONCAT('%', :search, '%') OR " +
            "STR(c.customerId) LIKE CONCAT('%', :search, '%'))")
    Page<Customer> searchCustomers(@Param("search") String search, Pageable pageable);

    List<Customer> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
