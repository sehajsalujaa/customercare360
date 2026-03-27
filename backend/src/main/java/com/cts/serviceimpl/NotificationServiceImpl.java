package com.cts.serviceimpl;

import com.cts.dto.NotificationResponseDto;
import com.cts.entity.Notification;
import com.cts.entity.User;
import com.cts.enums.NotificationStatus;
import com.cts.enums.NotificationType;
import com.cts.exception.CustomException;
import com.cts.repository.NotificationRepository;
import com.cts.repository.UserRepository;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void createNotification(Long userId, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .notificationType(type)
                .notificationStatus(NotificationStatus.UNREAD)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponseDto> getUserNotifications(Long userID, String sort) {
        List<Notification> notifications;
        if ("ASC".equalsIgnoreCase(sort)) {
            notifications = notificationRepository.findByUserUserIDOrderByCreatedAtAsc(userID);
        } else {
            notifications = notificationRepository.findByUserUserIDOrderByCreatedAtDesc(userID);
        }
        return notifications.stream()
                .map(n -> NotificationResponseDto.builder()
                        .message(n.getMessage())
                        .category(n.getNotificationType().name())
                        .status(n.getNotificationStatus().name())
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public long getUnreadCount(Long userID) {
        return notificationRepository.countByUserUserIDAndNotificationStatus(
                userID, NotificationStatus.UNREAD);
    }

    @Override
    public void markAllAsRead(Long userID) {
        List<Notification> list = notificationRepository.findByUserUserID(userID);
        list.forEach(n -> n.setNotificationStatus(NotificationStatus.READ));
        notificationRepository.saveAll(list);
    }

    @Override
    public void dismissNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException("Notification not found"));
        notification.setNotificationStatus(NotificationStatus.DISMISSED);
        notificationRepository.save(notification);
    }
}
