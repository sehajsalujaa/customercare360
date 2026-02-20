//Manages customer profiles (create, update, view, delete).

package com.cts.service;

import com.cts.dto.CustomerDto;
import com.cts.entity.Customer;

import java.util.List;

public interface CustomerService {

    Customer createCustomer(CustomerDto dto);
    Customer getCustomerById(Long id);
    List<Customer> getAllCustomers();
    Customer updateCustomer(Long id, CustomerDto dto);

    void deleteCustomer(Long id);
}
