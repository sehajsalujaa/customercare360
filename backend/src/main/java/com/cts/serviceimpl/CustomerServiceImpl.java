package com.cts.serviceimpl;

import com.cts.dto.*;
import com.cts.entity.*;
import com.cts.enums.CustomerStatus;
import com.cts.enums.Priority;
import com.cts.enums.RequestStatus;
import com.cts.enums.ServiceAccountStatus;
import com.cts.exception.CustomException;
import com.cts.repository.*;
import com.cts.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AuthAuditRepository authAuditRepository;
    private final ServiceAccountRepository serviceAccountRepository;
    private final PremiseRepository premiseRepository;
    private final ServiceRequestRepository serviceRequestRepository;

    @Override
    public void approveCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        if (customer.getCustomerStatus() != CustomerStatus.PENDING) {
            throw new CustomException("Customer not in pending state");
        }
        customer.setCustomerStatus(CustomerStatus.ACTIVE);
        customer.getUser().setEnabled(true);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);
    }

    @Override
    public void updateCustomerContact(Long customerId,
                                      UpdateCustomerContactDto dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found"));
        User user = customer.getUser();
        if(dto.getEmail() != null && !dto.getEmail().isBlank()) {
            user.setEmail(dto.getEmail());
        }
        if(dto.getPhone() != null && !dto.getPhone().isBlank()) {
            user.setPhone(dto.getPhone());
        }
        if(dto.getAddress() != null && !dto.getAddress().isBlank()) {
            customer.setAddress(dto.getAddress());
        }
        if(dto.getCountryCode() != null && !dto.getCountryCode().isBlank()) {
            customer.setCountryCode(dto.getCountryCode());
        }
        if(dto.getRegionCode() != null && !dto.getRegionCode().isBlank()) {
            customer.setRegionCode(dto.getRegionCode());
        }
        userRepository.save(user);
        customerRepository.save(customer);
        authAuditRepository.save(
                AuthAudit.builder()
                        .email(user.getEmail())
                        .action("UPDATE_CUSTOMER_CONTACT")
                        .status("SUCCESS")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @Override
    public void createServiceAccount(CreateServiceAccountDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new CustomException("Customer not found"));
        if(dto.getStartDate().isAfter(LocalDate.now())) {
            throw new CustomException("Start date cannot be future date");
        }
        ServiceAccount serviceAccount = ServiceAccount.builder()
                .customer(customer)
                .serviceType(dto.getServiceType())
                .startDate(dto.getStartDate())
                .serviceAccountStatus(ServiceAccountStatus.ACTIVE)
                .build();
        serviceAccountRepository.save(serviceAccount);
    }

    @Override
    public void linkPremise(LinkPremiseDto dto) {
        ServiceAccount account = serviceAccountRepository
                .findById(dto.getServiceAccountId())
                .orElseThrow(() -> new CustomException("Service account not found"));
        if(account.getServiceAccountStatus() == ServiceAccountStatus.CLOSED) {
            throw new CustomException("Cannot link premise to closed account");
        }
        if(dto.getRegion() == null || dto.getRegion().isBlank()) {
            throw new CustomException("Region is mandatory");
        }
        if(account.getPremise() != null){
            throw new CustomException("Premise already linked");
        }
        Premise premise = Premise.builder()
                .address(dto.getAddress())
                .region(dto.getRegion())
                .meterId(dto.getMeterId())
                .build();
        premiseRepository.save(premise);
        account.setPremise(premise);
        serviceAccountRepository.save(account);
    }

    @Override
    public CustomerProfileResponseDto getCustomerProfile(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found"));
        List<ServiceAccount> accounts =
                serviceAccountRepository.findByCustomerCustomerId(customerId);
        List<ServiceAccountProfileDto> accountDtos = accounts.stream()
                .map(acc -> ServiceAccountProfileDto.builder()
                        .accountId(acc.getAccountId())
                        .serviceType(acc.getServiceType())
                        .serviceAccountStatus(acc.getServiceAccountStatus())
                        .address(acc.getPremise() != null ? acc.getPremise().getAddress() : null)
                        .region(acc.getPremise() != null ? acc.getPremise().getRegion() : null)
                        .meterId(acc.getPremise() != null ? acc.getPremise().getMeterId() : null)
                        .build())
                .toList();
        return CustomerProfileResponseDto.builder()
                .customerId(customer.getCustomerId())
                .name(customer.getName())
                .email(customer.getUser().getEmail())
                .phone(customer.getUser().getPhone())
                .serviceAccounts(accountDtos)
                .build();

        // TODO: Add Bills and Service Requests once those modules are completed for 360 profile
    }

    @Override
    public void deactivateCustomer(Long customerId, String reason) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found"));
        if(reason == null || reason.isBlank()){
            throw new CustomException("Deactivation reason is required");
        }
        customer.setCustomerStatus(CustomerStatus.INACTIVE);
        customer.setDeactivationReason(reason);
        customerRepository.save(customer);
    }

    @Override
    public void reactivateCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found"));
        customer.setCustomerStatus(CustomerStatus.ACTIVE);
        customer.setDeactivationReason(null);
        customerRepository.save(customer);
    }

    @Override
    public void createServiceRequest(CreateServiceRequestDto dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new CustomException("Customer not found"));
        ServiceRequest request = ServiceRequest.builder()
                .customer(customer)
                .requestType(dto.getRequestType())
                .createdDate(LocalDateTime.now())
                .priority(Priority.P3)      // default
                .status(RequestStatus.OPEN) // default
                .build();
        serviceRequestRepository.save(request);
    }

}
