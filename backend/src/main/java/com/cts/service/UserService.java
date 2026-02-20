//Handles registration and login for all actors (Customer, Agent, Admin, etc.).

package com.cts.service;

import com.cts.dto.CustomerDto;
import com.cts.dto.UserDto;
import com.cts.entity.Customer;
import com.cts.entity.User;

public interface UserService {
    Customer registerUser(UserDto userDto, CustomerDto customerDto);
    User login(String username, String password);
    boolean verifyOtp(String email, String otp);
    public User provisionAgent(UserDto dto);
    public User assignRole(Long userId, String role);
    public void logoutAllDevices(Long userId);
}
