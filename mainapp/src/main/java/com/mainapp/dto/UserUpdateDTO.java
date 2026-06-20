package com.mainapp.dto;

import com.mainapp.model.User.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateDTO {

    private Long id;

    // Optional on update - no @NotBlank
    private String username;

    @Email(message = "Invalid email format")
    private String email;

    // Optional - only updated when provided
    private String password;

    private String fullName;

    private UserRole role;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;

    private String aadhaarRef;

    private Boolean active;
}
