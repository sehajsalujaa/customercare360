//Sends and retrieves notifications (bill availability, service order updates, complaint status).

package com.cts.service;

import com.cts.dto.NotificationDto;
import com.cts.entity.Notification;

import java.util.List;

public interface NotificationService {
    Notification sendNotification(NotificationDto dto);
    List<Notification> getNotificationsByUser(Long userID);
}
