package com.cts.serviceimpl;

import com.cts.dto.CreateComplaintDto;
import com.cts.dto.ResolveComplaintDto;
import com.cts.entity.Complaint;
import com.cts.entity.User;
import com.cts.enums.ComplaintStatus;
import com.cts.enums.NotificationType;
import com.cts.exception.CustomException;
import com.cts.repository.ComplaintRepository;
import com.cts.repository.UserRepository;
import com.cts.service.ComplaintService;
import com.cts.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public void createComplaint(CreateComplaintDto dto) {
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
        notificationService.createNotification(
                saved.getUser().getUserID(),
                "Your complaint has been registered",
                NotificationType.COMPLAINT
        );
    }

    @Override
    public void resolveComplaint(ResolveComplaintDto dto) {
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
        Long userID = complaint.getUser().getUserID();
        notificationService.createNotification(
                userID,
                "Your complaint has been resolved",
                NotificationType.COMPLAINT
        );
    }
}
