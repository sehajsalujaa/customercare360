//Manages customer profiles (create, update, view, delete).

package com.cts.service;

import com.cts.dto.*;
import com.cts.entity.Customer;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerService {

   void approveCustomer(Long customerId);
   void rejectCustomer(Long customerId, String reason);
   void updateCustomerContact(Long customerId, UpdateCustomerContactDto dto);
   void createServiceAccount(CreateServiceAccountDto dto);
   void linkPremise(LinkPremiseDto dto);
   CustomerProfileResponseDto getCustomerProfile(Long customerId, Pageable pageable);
   void deactivateCustomer(Long customerId, String reason);
   void reactivateCustomer(Long customerId);
   void createServiceRequest(CreateServiceRequestDto dto);
   void recordServiceAgreement(RecordServiceAgreementDto dto);
   List<Customer> getPendingCustomers();
   long getPendingCount();
}
