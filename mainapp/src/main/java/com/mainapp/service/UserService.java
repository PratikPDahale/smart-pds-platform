package com.mainapp.service;

import com.mainapp.dto.UserDTO;
import com.mainapp.dto.UserResponseDTO;
import com.mainapp.dto.UserUpdateDTO;
import com.mainapp.exception.ResourceAlreadyExistsException;
import com.mainapp.exception.ResourceNotFoundException;
import com.mainapp.model.User;
import com.mainapp.model.User.UserRole;
import com.mainapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDTO createUser(UserDTO userDTO) {
        // Check if username already exists
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists: " + userDTO.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists: " + userDTO.getEmail());
        }

        // Create new user with hashed password
        User user = User.builder()
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))  // Hash password
                .fullName(userDTO.getFullName())
                .role(userDTO.getRole())
                .phone(userDTO.getPhone())
                .aadhaarRef(userDTO.getAadhaarRef())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        return mapToResponseDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponseDTO(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return mapToResponseDTO(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToResponseDTO(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public UserResponseDTO updateUser(Long id, UserUpdateDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Update username if provided and check conflicts
        if (userDTO.getUsername() != null && !userDTO.getUsername().isBlank()) {
            if (!user.getUsername().equals(userDTO.getUsername()) &&
                    userRepository.existsByUsername(userDTO.getUsername())) {
                throw new ResourceAlreadyExistsException("Username already exists: " + userDTO.getUsername());
            }
            user.setUsername(userDTO.getUsername());
        }

        // Update email if provided and check conflicts
        if (userDTO.getEmail() != null && !userDTO.getEmail().isBlank()) {
            if (!user.getEmail().equals(userDTO.getEmail()) &&
                    userRepository.existsByEmail(userDTO.getEmail())) {
                throw new ResourceAlreadyExistsException("Email already exists: " + userDTO.getEmail());
            }
            user.setEmail(userDTO.getEmail());
        }

        // Update other optional fields
        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));  // Hash password
        }

        if (userDTO.getRole() != null) {
            user.setRole(userDTO.getRole());
        }

        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }

        if (userDTO.getAadhaarRef() != null) {
            user.setAadhaarRef(userDTO.getAadhaarRef());
        }

        if (userDTO.getActive() != null) {
            user.setActive(userDTO.getActive());
        }

        User updatedUser = userRepository.save(user);
        return mapToResponseDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public UserResponseDTO deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(false);
        User updatedUser = userRepository.save(user);
        return mapToResponseDTO(updatedUser);
    }

    public UserResponseDTO activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(true);
        User updatedUser = userRepository.save(user);
        return mapToResponseDTO(updatedUser);
    }

    // Helper method to map User to UserResponseDTO
    private UserResponseDTO mapToResponseDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .aadhaarRef(user.getAadhaarRef())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
