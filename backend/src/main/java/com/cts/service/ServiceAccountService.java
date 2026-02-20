//Lists services availed by a customer (electricity, gas, water).

package com.cts.service;

import com.cts.entity.ServiceAccount;

import java.util.List;

public interface ServiceAccountService {
    List<ServiceAccount> getServicesByCustomer(Long customerId);
}
