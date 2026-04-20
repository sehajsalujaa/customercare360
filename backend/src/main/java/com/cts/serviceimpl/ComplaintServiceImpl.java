package com.cts.serviceimpl;

import com.cts.dto.ComplaintResponseDto;
import com.cts.dto.CreateComplaintDto;
import com.cts.dto.ResolveComplaintDto;
import com.cts.entity.Complaint;
import com.cts.entity.User;
import com.cts.enums.ComplaintCategory;
import com.cts.enums.ComplaintStatus;
import com.cts.enums.NotificationType;
import com.cts.exception.CustomException;
import com.cts.repository.ComplaintRepository;
import com.cts.repository.UserRepository;
import com.cts.service.AuditService;
import com.cts.service.ComplaintService;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintServiceImpl.class);
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Override
    public void createComplaint(CreateComplaintDto dto) {
        log.info("Creating complaint for userID={}", dto.getUserId());
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new CustomException("User not found"));
        Complaint complaint = Complaint.builder()
                .user(user)
                .complaintCategory(dto.getComplaintCategory())
                .description(dto.getDescription())
                .complaintStatus(ComplaintStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();
        Complaint saved = complaintRepository.save(complaint);
        auditService.logAction(dto.getUserId(), "CREATE", "Complaint");
        notificationService.createNotification(
                saved.getUser().getUserID(),
                "Your complaint has been registered",
                NotificationType.COMPLAINT
        );

        notifyRoleUsers("ROLE_ADMIN", "New complaint #" + saved.getComplaintId() + " has been raised.", NotificationType.COMPLAINT);
        notifyRoleUsers("ROLE_AGENT", "Complaint #" + saved.getComplaintId() + " requires attention.", NotificationType.COMPLAINT);
        if (saved.getComplaintCategory() == ComplaintCategory.BILLING) {
            notifyRoleUsers("ROLE_BILLING_ANALYST", "Billing complaint #" + saved.getComplaintId() + " has been raised.", NotificationType.COMPLAINT);
        } else {
            notifyRoleUsers("ROLE_FIELD_COORDINATOR", "Service complaint #" + saved.getComplaintId() + " has been raised.", NotificationType.COMPLAINT);
        }
    }

    @Override
    public void resolveComplaint(ResolveComplaintDto dto) {
        log.info("Resolving complaintId={}", dto.getComplaintId());
        Complaint complaint = complaintRepository.findById(dto.getComplaintId())
                .orElseThrow(() -> new CustomException("Complaint not found"));
        if (complaint.getComplaintStatus() != ComplaintStatus.OPEN) {
            throw new CustomException("Complaint already processed");
        }
        if (dto.getResolutionNotes() == null || dto.getResolutionNotes().isBlank()) {
            throw new CustomException("Resolution notes are required");
        }
        LocalDateTime now = LocalDateTime.now();
        boolean slaMet = now.isBefore(complaint.getCreatedAt().plusDays(2));
        complaint.setComplaintStatus(dto.getComplaintStatus());
        complaint.setResolutionNotes(dto.getResolutionNotes());
        complaint.setResolvedAt(now);
        complaint.setSlaMet(slaMet);
        complaintRepository.save(complaint);

        auditService.logAction(complaint.getUser().getUserID(), "UPDATE", "Complaint");
        Long userID = complaint.getUser().getUserID();
        notificationService.createNotification(
                userID,
                "Your complaint has been resolved",
                NotificationType.COMPLAINT
        );

        notifyRoleUsers("ROLE_ADMIN", "Complaint #" + complaint.getComplaintId() + " has been resolved.", NotificationType.COMPLAINT);
    }

    @Override
    public ComplaintResponseDto getComplaintById(Long complaintId) {
        log.info("Fetching complaint by ID={}", complaintId);
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new CustomException("Complaint not found"));
        return mapToResponse(complaint);
    }

    @Override
    public List<ComplaintResponseDto> getAllComplaints() {
        log.info("Fetching all complaints");
        return complaintRepository.findAll().stream()
                .map(this::mapToResponse)
                .filter(dto -> dto != null)
                .toList();
    }

    @Override
    public List<ComplaintResponseDto> filterComplaints(ComplaintStatus status, ComplaintCategory category,
                                                         Long userId, LocalDateTime fromDate, LocalDateTime toDate) {
        log.info("Filtering complaints - status={}, category={}, userId={}", status, category, userId);
        return complaintRepository.filterComplaints(status, category, userId, fromDate, toDate).stream()
                .map(this::mapToResponse)
                .filter(dto -> dto != null)
                .toList();
    }

    private ComplaintResponseDto mapToResponse(Complaint complaint) {
        User user = complaint.getUser();
        
        // Skip complaints without users (orphaned data)
        if (user == null) {
            log.warn("Skipping complaint {} with no associated user", complaint.getComplaintId());
            return null;
        }
        
        return ComplaintResponseDto.builder()
                .complaintId(complaint.getComplaintId())
                .userId(user.getUserID())
                .userName(user.getEmail())
                .userEmail(user.getEmail())
                .complaintCategory(complaint.getComplaintCategory())
                .description(complaint.getDescription())
                .complaintStatus(complaint.getComplaintStatus())
                .createdAt(complaint.getCreatedAt())
                .resolutionNotes(complaint.getResolutionNotes())
                .resolvedAt(complaint.getResolvedAt())
                .slaMet(complaint.isSlaMet())
                .build();
    }

    private void notifyRoleUsers(String roleName, String message, NotificationType type) {
        try {
            List<User> users = userRepository.findByRolesName(roleName);
            for (User u : users) {
                notificationService.createNotification(u.getUserID(), message, type);
            }
        } catch (Exception e) {
            log.error("Failed role notification for role={}", roleName, e);
        }
    }
}
