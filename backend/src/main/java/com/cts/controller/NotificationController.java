package com.cts.controller;

import com.cts.dto.NotificationResponseDto;
import com.cts.entity.User;
import com.cts.exception.CustomException;
import com.cts.repository.UserRepository;
import com.cts.security.SecurityUtil;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    @GetMapping("/me")
    public List<NotificationResponseDto> getMyNotifications(
            @RequestParam(defaultValue = "DESC") String sort) {
        return notificationService.getUserNotifications(securityUtil.getCurrentUserId(), sort);
    }

    @GetMapping("/unread-count/me")
    public long getMyUnreadCount() {
        return notificationService.getUnreadCount(securityUtil.getCurrentUserId());
    }

    @PutMapping("/mark-read/me")
    public String markMyRead() {
        notificationService.markAllAsRead(securityUtil.getCurrentUserId());
        return "All notifications marked as read";
    }

    @GetMapping("/user/{userId}")
    public List<NotificationResponseDto> getNotifications(
            @PathVariable String userId,
            @RequestParam(defaultValue = "DESC") String sort) {
        return notificationService.getUserNotifications(resolveUserId(userId), sort);
    }

    @GetMapping("/unread-count/user/{userId}")
    public long getUnreadCount(@PathVariable String userId) {
        return notificationService.getUnreadCount(resolveUserId(userId));
    }

    @PutMapping("/mark-read/user/{userId}")
    public String markAllRead(@PathVariable String userId) {
        notificationService.markAllAsRead(resolveUserId(userId));
        return "All notifications marked as read";
    }

    @PutMapping("/dismiss/{notificationId}")
    public String dismiss(@PathVariable Long notificationId) {
        notificationService.dismissNotification(notificationId);
        return "Notification dismissed";
    }

    private Long resolveUserId(String userIdentifier) {
        if (userIdentifier == null || userIdentifier.isBlank()) {
            throw new CustomException("User identifier is required");
        }

        try {
            return Long.parseLong(userIdentifier);
        } catch (NumberFormatException ignored) {
            User user = userRepository.findByEmail(userIdentifier)
                    .or(() -> userRepository.findByPhone(userIdentifier))
                    .orElseThrow(() -> new CustomException("User not found"));
            return user.getUserID();
        }
    }
}
