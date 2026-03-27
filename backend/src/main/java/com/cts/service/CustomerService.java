//Manages customer profiles (create, update, view, delete).

package com.cts.service;

import com.cts.dto.*;

public interface CustomerService {

   void approveCustomer(Long customerId);
   void updateCustomerContact(Long customerId, UpdateCustomerContactDto dto);
   void createServiceAccount(CreateServiceAccountDto dto);
   void linkPremise(LinkPremiseDto dto);
   CustomerProfileResponseDto getCustomerProfile(Long customerId);
   void deactivateCustomer(Long customerId, String reason);
   void reactivateCustomer(Long customerId);
   void createServiceRequest(CreateServiceRequestDto dto);
   void recordServiceAgreement(RecordServiceAgreementDto dto);
}
