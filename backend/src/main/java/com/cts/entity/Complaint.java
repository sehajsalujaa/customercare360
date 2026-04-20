package com.cts.entity;

import com.cts.enums.ComplaintCategory;
import com.cts.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complaintId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private ComplaintCategory complaintCategory;

    private String description;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus complaintStatus;

    private LocalDateTime createdAt;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private boolean slaMet;
}
