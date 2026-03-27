//Sends and retrieves notifications (bill availability, service order updates, complaint status).

package com.cts.service;

import com.cts.dto.NotificationDto;
import com.cts.dto.NotificationResponseDto;
import com.cts.entity.Notification;
import com.cts.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    void createNotification(Long userID, String message, NotificationType type);
    List<NotificationResponseDto> getUserNotifications(Long userID, String sort);
    long getUnreadCount(Long userID);
    void markAllAsRead(Long userID);
    void dismissNotification(Long notificationId);
}
