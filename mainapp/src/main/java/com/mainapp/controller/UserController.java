    package com.mainapp.controller;

    import com.mainapp.dto.ApiResponse;
    import com.mainapp.dto.UserDTO;
    import com.mainapp.dto.UserUpdateDTO;
    import com.mainapp.dto.UserResponseDTO;
    import com.mainapp.model.User.UserRole;
    import com.mainapp.service.UserService;
    import jakarta.validation.Valid;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/users")
    @RequiredArgsConstructor
    public class UserController {

        private final UserService userService;

        @PostMapping
        public ResponseEntity<ApiResponse<UserResponseDTO>> createUser(@Valid @RequestBody UserDTO userDTO) {
            UserResponseDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User created successfully", createdUser));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<UserResponseDTO>> getUserById(@PathVariable Long id) {
            UserResponseDTO user = userService.getUserById(id);
            return ResponseEntity.ok(ApiResponse.success("User fetched successfully", user));
        }

        @GetMapping("/username/{username}")
        public ResponseEntity<ApiResponse<UserResponseDTO>> getUserByUsername(@PathVariable String username) {
            UserResponseDTO user = userService.getUserByUsername(username);
            return ResponseEntity.ok(ApiResponse.success("User fetched successfully", user));
        }

        @GetMapping("/email/{email}")
        public ResponseEntity<ApiResponse<UserResponseDTO>> getUserByEmail(@PathVariable String email) {
            UserResponseDTO user = userService.getUserByEmail(email);
            return ResponseEntity.ok(ApiResponse.success("User fetched successfully", user));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers() {
            List<UserResponseDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
        }

        @GetMapping("/role/{role}")
        public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getUsersByRole(@PathVariable UserRole role) {
            List<UserResponseDTO> users = userService.getUsersByRole(role);
            return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<UserResponseDTO>> updateUser(
                @PathVariable Long id,
                @RequestBody UserUpdateDTO userDTO) {
            UserResponseDTO updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
        }

        @PatchMapping("/{id}/deactivate")
        public ResponseEntity<ApiResponse<UserResponseDTO>> deactivateUser(@PathVariable Long id) {
            UserResponseDTO user = userService.deactivateUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", user));
        }

        @PatchMapping("/{id}/activate")
        public ResponseEntity<ApiResponse<UserResponseDTO>> activateUser(@PathVariable Long id) {
            UserResponseDTO user = userService.activateUser(id);
            return ResponseEntity.ok(ApiResponse.success("User activated successfully", user));
        }
    }
