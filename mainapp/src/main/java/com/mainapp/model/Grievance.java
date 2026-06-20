package com.mainapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "grievances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grievance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull(message = "Citizen ID is required")
    private Long citizenId;

    @Column(nullable = false)
    @NotNull(message = "Dealer ID is required")
    private Long dealerId;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Subject is required")
    private String subject;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Category is required")
    private String category;

    @Column(nullable = false, length = 1000)
    @NotBlank(message = "Description is required")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GrievancePriority priority = GrievancePriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GrievanceStatus status = GrievanceStatus.OPEN;

    @Column(length = 1000)
    private String response;

    @Column
    private LocalDateTime resolvedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (priority == null) {
            priority = GrievancePriority.MEDIUM;
        }
        if (status == null) {
            status = GrievanceStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
