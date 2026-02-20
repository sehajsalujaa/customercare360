//package com.cts.serviceimpl;
//
//import com.cts.dto.CustomerDto;
//import com.cts.dto.UserDto;
//import com.cts.entity.Customer;
//import com.cts.entity.User;
//import com.cts.enums.UserRole;
//import com.cts.enums.UserStatus;
//import com.cts.repository.CustomerRepository;
//import com.cts.repository.UserRepository;
//import com.cts.service.UserService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.Optional;
//
//@Service
//public class UserServiceImpl implements UserService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private CustomerRepository customerRepository;
//
//    private final Map<String, OtpEntry> otpStore = new HashMap<>();
//
//    private static class OtpEntry {
//        String otp;
//        LocalDateTime expiry;
//        OtpEntry(String otp, LocalDateTime expiry) {
//            this.otp = otp;
//            this.expiry = expiry;
//        }
//    }
//
//    // US001: Customer self-register with email/phone and OTP verification
//    public Customer registerUser (UserDto userDto, CustomerDto customerDto){
//
//        // Check duplicate email/phone
//        if (userRepository.findByEmail(userDto.getEmail()) != null) {
//            throw new RuntimeException("Email already registered");
//        }
//        if (userRepository.findByUsername(userDto.getUsername()) != null) {
//            throw new RuntimeException("Username already taken");
//        }
//
//        // Password policy check
//        if (!isValidPassword(userDto.getPassword())) {
//            throw new RuntimeException("Password does not meet complexity requirements");
//        }
//
//        // Create user with inactive status until OTP verified
//        User user = User.builder()
//                .username(userDto.getUsername())
//                .email(userDto.getEmail())
//                .phone(userDto.getPhone())
//                .role(UserRole.CUSTOMER)
//                .password(userDto.getPassword())
//                .build();
//
//        User savedUser = userRepository.save(user);
//
//        Customer customer = Customer.builder()
//                .user(savedUser)
//                .customerType(customerDto.getCustomerType())
//                .contactInfo(customerDto.getContactInfo())
//                .status(UserStatus.INACTIVE)
//                .build();
//
//        Customer savedCustomer = customerRepository.save(customer);
//
//        // Generate OTP and store
//        String otp = generateOtp();
//        otpStore.put(savedUser.getEmail(), new OtpEntry(otp, LocalDateTime.now().plusMinutes(5)));
//
//        // TODO: send OTP via email/SMS
//        System.out.println("OTP for " + savedUser.getEmail() + ": " + otp);
//
//        return savedCustomer;
//    }
//
//    @Override
//    public boolean verifyOtp(String email, String otp){
//        OtpEntry entry = otpStore.get(email);
//        if (entry != null && entry.otp.equals(otp) && LocalDateTime.now().isBefore(entry.expiry)) {
//            Customer customer = customerRepository.findByUser_Email(email);
//            customer.setStatus("Active");
//            customerRepository.save(customer);
//            otpStore.remove(email);
//            return true;
//        }
//        return false;
//    }
//
//    // US002: Admin provisions agent with RBAC
//    @Override
//    public User provisionAgent(UserDto dto) {
//        User agent = new User();
//        agent.setUsername(dto.getUsername());
//        agent.setEmail(dto.getEmail());
//        agent.setPhone(dto.getPhone());
//        agent.setRole("AGENT");
//        agent.setPassword(dto.getPassword());
//        return userRepository.save(agent);
//    }
//
//    // US003: Admin manages roles and permissions
//    @Override
//    public User assignRole(Long userId, String role) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        user.setRole(role.toUpperCase());
//        return userRepository.save(user);
//    }
//
//    // US004: User login with email/phone + password
//    @Override
//    public User login(String usernameOrEmail, String password) {
//        User user = Optional.ofNullable(userRepository.findByUsername(usernameOrEmail))
//                .orElse(userRepository.findByEmail(usernameOrEmail));
//
//        if (user == null) throw new RuntimeException("User not found");
//
//        if (!user.getPassword().equals(password)) {
//            throw new RuntimeException("Invalid credentials");
//        }
//
//        // TODO: generate JWT access + refresh tokens
//        System.out.println("JWT issued for " + user.getUsername());
//        return user;
//    }
//
//    // US005: Logout from all devices
//    @Override
//    public void logoutAllDevices(Long userId) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        // TODO: invalidate refresh tokens in token store
//        System.out.println("All sessions invalidated for " + user.getUsername());
//    }
//
//    // Helper methods
//    private boolean isValidPassword(String password) {
//        return password.length() >= 8 &&
//                password.matches(".*[A-Z].*") &&
//                password.matches(".*[a-z].*") &&
//                password.matches(".*\\d.*") &&
//                password.matches(".*[@#$%^&+=].*");
//    }
//
//    private String generateOtp() {
//        return String.valueOf((int)(Math.random() * 900000) + 100000); // 6-digit OTP
//    }
//}
