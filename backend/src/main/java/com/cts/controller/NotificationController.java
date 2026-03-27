package com.cts.controller;

import com.cts.dto.NotificationResponseDto;
import com.cts.entity.Notification;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public List<NotificationResponseDto> getNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "DESC") String sort) {
        return notificationService.getUserNotifications(userId, sort);
    }

    @GetMapping("/unread-count/user/{userId}")
    public long getUnreadCount(@PathVariable Long userId) {
        return notificationService.getUnreadCount(userId);
    }

    @PutMapping("/mark-read/user/{userId}")
    public String markAllRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return "All notifications marked as read";
    }

    @PutMapping("/dismiss/{notificationId}")
    public String dismiss(@PathVariable Long notificationId) {
        notificationService.dismissNotification(notificationId);
        return "Notification dismissed";
    }
}
