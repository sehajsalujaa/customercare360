package com.cts.repository;

import com.cts.entity.Notification;
import com.cts.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserUserID(Long userID);
    Long countByUserUserIDAndNotificationStatus(Long userID, NotificationStatus notificationStatus);
    List<Notification> findByUserUserIDOrderByCreatedAtAsc(Long userID);
    List<Notification> findByUserUserIDOrderByCreatedAtDesc(Long userID);
}
