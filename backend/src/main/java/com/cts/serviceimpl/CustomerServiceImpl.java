package com.cts.serviceimpl;

import com.cts.dto.*;
import com.cts.entity.*;
import com.cts.enums.*;
import com.cts.exception.CustomException;
import com.cts.repository.*;
import com.cts.security.SecurityUtil;
import com.cts.service.AuditService;
import com.cts.service.CustomerService;
import com.cts.entity.ServiceRequest;
import com.cts.entity.Bill;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final ServiceAgreementRepository serviceAgreementRepository;
    private final SecurityUtil securityUtil;
    private final AuditService auditService;
    private final BillRepository billRepository;
    private final NotificationService notificationService;

    @Override
    public void approveCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found"));
        if (customer.getCustomerStatus() != CustomerStatus.PENDING) {
            throw new CustomException("Customer not in pending state");
        }
        customer.setCustomerStatus(CustomerStatus.ACTIVE);
        customer.getUser().setEnabled(true);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);

        safeNotifyUser(
                customer.getUser() != null ? customer.getUser().getUserID() : null,
                "Your customer account has been approved and activated.",
                NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "Customer");
    }

    @Override
    public void rejectCustomer(Long customerId, String reason) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found"));
        if (customer.getCustomerStatus() != CustomerStatus.PENDING) {
            throw new CustomException("Customer not in pending state");
        }
        customer.setCustomerStatus(CustomerStatus.REJECT);
        customer.getUser().setEnabled(false);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);

        safeNotifyUser(
                customer.getUser() != null ? customer.getUser().getUserID() : null,
                "Your customer account registration has been rejected. Reason: " + (reason == null || reason.isBlank() ? "Not provided" : reason),
                NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "Customer");
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

        safeNotifyUser(
                user.getUserID(),
                "Your profile contact information has been updated.",
                NotificationType.SERVICE
        );

        authAuditRepository.save(
                AuthAudit.builder()
                        .email(user.getEmail())
                        .action("UPDATE_CUSTOMER_CONTACT")
                        .status("SUCCESS")
                        .timestamp(LocalDateTime.now())
                        .build()
        );
        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "Customer");
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
                .premiseEffectiveFrom(dto.getStartDate())
                .build();
        serviceAccountRepository.save(serviceAccount);

        safeNotifyUser(
                customer.getUser() != null ? customer.getUser().getUserID() : null,
                "A new " + dto.getServiceType() + " service account has been created for your profile.",
                NotificationType.SERVICE
        );
        notifyRoleUsers(
                "ROLE_BILLING_ANALYST",
                "New service account " + serviceAccount.getAccountId() + " created for customer " + customer.getName() + ".",
                NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "CREATE", "ServiceAccount");
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
        Premise premise = premiseRepository.findByMeterId(dto.getMeterId())
                .orElseGet(() -> premiseRepository.save(
                        Premise.builder()
                                .address(dto.getAddress())
                                .region(dto.getRegion())
                                .meterId(dto.getMeterId())
                                .build()
                ));

        if (serviceAccountRepository.existsByPremisePremiseIdAndServiceTypeAndServiceAccountStatus(
                premise.getPremiseId(),
                account.getServiceType(),
                ServiceAccountStatus.ACTIVE
        ) && (account.getPremise() == null || !premise.getPremiseId().equals(account.getPremise().getPremiseId()))) {
            throw new CustomException("An active account already exists for this service type on the premise");
        }

        if (account.getPremise() != null) {
            account.setPremiseEffectiveTo(LocalDate.now().minusDays(1));
        }

        account.setPremise(premise);
        account.setPremiseEffectiveFrom(LocalDate.now());
        account.setPremiseEffectiveTo(null);
        serviceAccountRepository.save(account);

        Long customerUserId = account.getCustomer() != null && account.getCustomer().getUser() != null
                ? account.getCustomer().getUser().getUserID()
                : null;
        safeNotifyUser(
                customerUserId,
                "Premise and meter details were linked to your service account " + account.getAccountId() + ".",
                NotificationType.SERVICE
        );
        notifyRoleUsers(
                "ROLE_FIELD_COORDINATOR",
                "Premise linked for account " + account.getAccountId() + " with meter " + premise.getMeterId() + ".",
                NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "Premise");
    }

    @Override
    public CustomerProfileResponseDto getCustomerProfile(Long customerId, Pageable pageable) {
        // 1. Fetch customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        // 2. Fetch service accounts
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
        // 3. Fetch bills (paginated)
        Page<Bill> billPage =
                billRepository.findByServiceAccountCustomerCustomerId(customerId, pageable);
        List<BillDto> billDtos = billPage.getContent().stream()
                .map(bill -> BillDto.builder()
                        .accountId(bill.getServiceAccount().getAccountId())
                        .cycleId(bill.getBillingCycle().getCycleId())
                        .usage(bill.getUsage())
                        .amount(bill.getAmount())
                        .status(bill.getBillStatus().name())
                        .dueDate(bill.getDueDate())
                        .build())
                .toList();
        // 4. Fetch service requests (paginated)
        Page<ServiceRequest> requestPage =
                serviceRequestRepository.findByCustomerCustomerId(customerId, pageable);
        List<ServiceRequestDto> requestDtos = requestPage.getContent().stream()
                .map(req -> ServiceRequestDto.builder()
                        .requestId(req.getRequestId())
                        .type(req.getRequestType().name())
                        .status(req.getStatus().name())
                        .priority(req.getPriority().name())
                        .build())
                .toList();
        // 5. Build final response
        return CustomerProfileResponseDto.builder()
                .customerId(customer.getCustomerId())
                .name(customer.getName())
                .email(customer.getUser().getEmail())
                .phone(customer.getUser().getPhone())
                .customerStatus(customer.getCustomerStatus() != null ? customer.getCustomerStatus().name() : null)
                .address(customer.getAddress())
                .customerType(customer.getCustomerType() != null ? customer.getCustomerType().name() : null)
                .serviceAccounts(accountDtos)
                .bills(billDtos)
                .requests(requestDtos)
                .build();
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

        safeNotifyUser(
                customer.getUser() != null ? customer.getUser().getUserID() : null,
                "Your customer profile has been deactivated. Reason: " + reason,
                NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "Customer");
    }

    @Override
    public void reactivateCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found"));
        customer.setCustomerStatus(CustomerStatus.ACTIVE);
        customer.setDeactivationReason(null);
        customerRepository.save(customer);

        safeNotifyUser(
                customer.getUser() != null ? customer.getUser().getUserID() : null,
                "Your customer profile has been reactivated.",
                NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "UPDATE", "Customer");
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
        auditService.logAction(securityUtil.getCurrentUserId(), "CREATE", "ServiceRequest");

        Long customerUserId = customer.getUser() != null ? customer.getUser().getUserID() : securityUtil.getCurrentUserId();
        safeNotifyUser(
                customerUserId,
                "Your service request " + request.getRequestId() + " has been raised successfully.",
                NotificationType.SERVICE
        );
        notifyRoleUsers(
                "ROLE_FIELD_COORDINATOR",
                "New service request " + request.getRequestId() + " created by customer " + customer.getName() + ".",
                NotificationType.SERVICE
        );
        notifyRoleUsers(
                "ROLE_AGENT",
                "Service request " + request.getRequestId() + " is open for customer " + customer.getName() + ".",
                NotificationType.SERVICE
        );
    }

    @Override
    public void recordServiceAgreement(RecordServiceAgreementDto dto) {
        ServiceAccount account = serviceAccountRepository
                .findById(dto.getServiceAccountId())
                .orElseThrow(() -> new CustomException("Service account not found"));
        if(account.getCustomer().getCustomerType() == CustomerType.INDUSTRIAL
            && dto.getTariffCode() == null){
            throw new CustomException("Tarrif code mandatory for industrial customers");
        }
        ServiceAgreement agreement = ServiceAgreement.builder()
                .serviceAccount(account)
                .termStartDate(dto.getTermStartDate())
                .termEndDate(dto.getTermEndDate())
                .tariffCode(dto.getTariffCode())
                .specialNotes(dto.getSpecialNotes())
                .build();
        serviceAgreementRepository.save(agreement);

        Long customerUserId = account.getCustomer() != null && account.getCustomer().getUser() != null
                ? account.getCustomer().getUser().getUserID()
                : null;
        safeNotifyUser(
                customerUserId,
                "Service agreement has been recorded for your account " + account.getAccountId() + ".",
                NotificationType.SERVICE
        );
        notifyRoleUsers(
                "ROLE_BILLING_ANALYST",
                "Service agreement recorded for account " + account.getAccountId() + ".",
                NotificationType.SERVICE
        );

        auditService.logAction(securityUtil.getCurrentUserId(), "CREATE", "ServiceAgreement");
    }

    @Override
    public List<Customer> getPendingCustomers(){
        return customerRepository.findByCustomerStatus(CustomerStatus.PENDING);
    }

    @Override
    public long getPendingCount(){
        return customerRepository.countByCustomerStatus(CustomerStatus.PENDING);
    }

        private void safeNotifyUser(Long userId, String message, NotificationType type) {
                try {
                        if (userId != null) {
                                notificationService.createNotification(userId, message, type);
                        }
                } catch (Exception ignored) {
                }
        }

        private void notifyRoleUsers(String roleName, String message, NotificationType type) {
                try {
                        List<User> users = userRepository.findByRolesName(roleName);
                        for (User u : users) {
                                safeNotifyUser(u.getUserID(), message, type);
                        }
                } catch (Exception ignored) {
                }
        }
}
