package com.mainapp.service;

import com.mainapp.dto.AdminRegistrationRequest;
import com.mainapp.dto.AdminResponse;
import com.mainapp.dto.DistributionResponse;
import com.mainapp.dto.InventoryResponse;
import com.mainapp.exception.ResourceAlreadyExistsException;
import com.mainapp.exception.ResourceNotFoundException;
import com.mainapp.model.AdminProfile;
import com.mainapp.model.Citizen;
import com.mainapp.model.User;
import com.mainapp.model.User.UserRole;
import com.mainapp.repository.AdminProfileRepository;
import com.mainapp.repository.CitizenRepository;
import com.mainapp.repository.DealerRepository;
import com.mainapp.repository.DistributionRepository;
import com.mainapp.repository.ProductRepository;
import com.mainapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final DistributionService distributionService;
    private final InventoryService inventoryService;
    private final CitizenRepository citizenRepository;
    private final DealerRepository dealerRepository;
    private final ProductRepository productRepository;
    private final DistributionRepository distributionRepository;
    private final UserRepository userRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final PasswordEncoder passwordEncoder;

    // Admin registration codes for security (in production, these should be stored in DB and time-limited)
    private static final Map<String, String> VALID_REGISTRATION_CODES = new HashMap<>();
    
    static {
        VALID_REGISTRATION_CODES.put("ADMIN_PDS_2024", "PDS Admin Registration");
        VALID_REGISTRATION_CODES.put("GOV_RATION_ADMIN", "Government Ration System");
        VALID_REGISTRATION_CODES.put("ERATIONS_SETUP_01", "E-Rations System Setup");
    }

    // ================== ADMIN REGISTRATION & PROFILE ==================

    /**
     * Register a new admin user
     * Requires a valid registration code for security
     */
    public AdminResponse registerAdmin(AdminRegistrationRequest request) {
        // Validate registration code
        if (!isValidRegistrationCode(request.getRegistrationCode())) {
            throw new IllegalArgumentException("Invalid registration code. Contact system administrator.");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Create User entity with ADMIN role
        User adminUser = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(UserRole.ADMIN)
                .phone(request.getPhone())
                .aadhaarRef(request.getAadhaarRef())
                .active(true)
                .build();

        User savedUser = userRepository.save(adminUser);

        // Create AdminProfile
        AdminProfile adminProfile = AdminProfile.builder()
                .user(savedUser)
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .active(true)
                .build();

        AdminProfile savedAdminProfile = adminProfileRepository.save(adminProfile);

        return mapAdminToResponse(savedAdminProfile);
    }

    /**
     * Get admin profile by user ID
     */
    @Transactional(readOnly = true)
    public AdminResponse getAdminProfileByUserId(Long userId) {
        AdminProfile adminProfile = adminProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found for user ID: " + userId));
        return mapAdminToResponse(adminProfile);
    }

    /**
     * Update admin profile
     */
    public AdminResponse updateAdminProfile(Long adminId, String department, String designation) {
        AdminProfile adminProfile = adminProfileRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found with ID: " + adminId));

        if (department != null && !department.isBlank()) {
            adminProfile.setDepartment(department);
        }
        if (designation != null && !designation.isBlank()) {
            adminProfile.setDesignation(designation);
        }

        AdminProfile updatedProfile = adminProfileRepository.save(adminProfile);
        return mapAdminToResponse(updatedProfile);
    }

    /**
     * Deactivate admin account
     */
    public AdminResponse deactivateAdmin(Long adminId) {
        AdminProfile adminProfile = adminProfileRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found with ID: " + adminId));

        adminProfile.setActive(false);
        adminProfile.getUser().setActive(false);

        AdminProfile updatedProfile = adminProfileRepository.save(adminProfile);
        return mapAdminToResponse(updatedProfile);
    }

    /**
     * Activate admin account
     */
    public AdminResponse activateAdmin(Long adminId) {
        AdminProfile adminProfile = adminProfileRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found with ID: " + adminId));

        adminProfile.setActive(true);
        adminProfile.getUser().setActive(true);

        AdminProfile updatedProfile = adminProfileRepository.save(adminProfile);
        return mapAdminToResponse(updatedProfile);
    }

    /**
     * Validate registration code
     * In production, this should query a time-limited registration codes table
     */
    private boolean isValidRegistrationCode(String code) {
        return VALID_REGISTRATION_CODES.containsKey(code);
    }

    /**
     * Map AdminProfile to AdminResponse DTO
     */
    private AdminResponse mapAdminToResponse(AdminProfile adminProfile) {
        return AdminResponse.builder()
                .id(adminProfile.getId())
                .userId(adminProfile.getUser().getId())
                .department(adminProfile.getDepartment())
                .designation(adminProfile.getDesignation())
                .active(adminProfile.getActive())
                .createdAt(adminProfile.getCreatedAt())
                .updatedAt(adminProfile.getUpdatedAt())
                .build();
    }


    // ================== DASHBOARD STATISTICS ==================

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalCitizens", citizenRepository.count());
        stats.put("totalDealers", dealerRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalDistributions", distributionRepository.count());
        stats.put("activeDealers", dealerRepository.findByActive(true).size());
        stats.put("activeProducts", productRepository.count());
        
        return stats;
    }

    // ================== DEALER REPORTS ==================

    public Map<String, Object> getDealerReport(Long dealerId) {
        Map<String, Object> report = new HashMap<>();

        // Basic dealer info
        dealerRepository.findById(dealerId)
                .ifPresent(dealer -> {
                    report.put("dealerId", dealer.getId());
                    report.put("shopName", dealer.getShopName());
                    report.put("ownerName", dealer.getUser() != null ? dealer.getUser().getFullName() : "Unknown");
                    report.put("region", dealer.getRegion());
                });

        // Distribution statistics
        List<DistributionResponse> distributions = distributionService.getDistributionsByDealer(dealerId);
        report.put("totalDistributions", distributions.size());
        
        Double totalAmount = distributions.stream()
                .mapToDouble(DistributionResponse::getTotalAmount)
                .sum();
        report.put("totalRevenue", totalAmount);

        // Inventory status
        List<InventoryResponse> inventory = inventoryService.getInventoryByDealer(dealerId);
        report.put("inventoryItems", inventory.size());
        
        Double totalStock = inventory.stream()
                .mapToDouble(InventoryResponse::getCurrentStock)
                .sum();
        report.put("totalCurrentStock", totalStock);

        // Citizens linked to dealer
        Long citizenCount = citizenRepository.findByAssignedDealerId(dealerId).stream().count();
        report.put("linkedCitizens", citizenCount);

        return report;
    }

    public List<DistributionResponse> getDealerDistributions(Long dealerId) {
        return distributionService.getDistributionsByDealer(dealerId);
    }

    // ================== PRODUCT REPORTS ==================

    public Map<String, Object> getProductReport(Long productId) {
        Map<String, Object> report = new HashMap<>();

        // Basic product info
        productRepository.findById(productId)
                .ifPresent(product -> {
                    report.put("productId", product.getId());
                    report.put("productName", product.getProductName());
                    report.put("unit", product.getUnit());
                    report.put("pricePerUnit", product.getPricePerUnit());
                    report.put("category", product.getCategory());
                });

        // Distribution statistics
        List<DistributionResponse> distributions = distributionRepository.findByProductId(productId)
                .stream()
                .map(dist -> {
                    return DistributionResponse.builder()
                            .id(dist.getId())
                            .quantity(dist.getQuantity())
                            .totalAmount(dist.getTotalAmount())
                            .distributionDate(dist.getDistributionDate())
                            .build();
                })
                .toList();

        report.put("totalDistributions", distributions.size());
        
        Double totalQuantityDistributed = distributions.stream()
                .mapToDouble(DistributionResponse::getQuantity)
                .sum();
        report.put("totalQuantityDistributed", totalQuantityDistributed);

        return report;
    }

    // ================== CITIZEN REPORTS ==================

    public Map<String, Object> getCitizenReport(String rationCardNumber) {
        Map<String, Object> report = new HashMap<>();

        // Get citizen info
        citizenRepository.findByRationCardNumber(rationCardNumber)
                .ifPresent(citizen -> {
                    report.put("citizenId", citizen.getId());
                    report.put("name", citizen.getUser() != null ? citizen.getUser().getFullName() : "Unknown");
                    report.put("rationCardNumber", citizen.getRationCardNumber());
                    report.put("familySize", citizen.getFamilySize());
                    report.put("category", citizen.getCategory());
                });

        // Distribution history
        List<DistributionResponse> distributions = distributionService.getDistributionsByRationCard(rationCardNumber);
        report.put("totalDistributions", distributions.size());
        
        Double totalAmountPaid = distributions.stream()
                .mapToDouble(DistributionResponse::getTotalAmount)
                .sum();
        report.put("totalAmountPaid", totalAmountPaid);

        report.put("distributionHistory", distributions);

        return report;
    }

    // ================== LOW STOCK ALERTS ==================

    public List<InventoryResponse> getLowStockAlerts() {
        Double threshold = 50.0; // Default threshold
        return inventoryService.getLowStockAlerts(threshold);
    }

    public List<InventoryResponse> getLowStockAlertsByDealer(Long dealerId) {
        Double threshold = 50.0; // Default threshold
        return inventoryService.getLowStockByDealer(dealerId, threshold);
    }

    // ================== DATE RANGE REPORTS ==================

    public List<DistributionResponse> getDistributionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return distributionService.getDistributionsByDateRange(startDate, endDate);
    }

    public Map<String, Object> getMonthlyReport(int year, int month) {
        Map<String, Object> report = new HashMap<>();

        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1).minusSeconds(1);

        List<DistributionResponse> distributions = distributionService.getDistributionsByDateRange(startDate, endDate);
        
        report.put("month", year + "-" + String.format("%02d", month));
        report.put("totalDistributions", distributions.size());
        
        Double totalRevenue = distributions.stream()
                .mapToDouble(DistributionResponse::getTotalAmount)
                .sum();
        report.put("totalRevenue", totalRevenue);

        report.put("distributions", distributions);

        return report;
    }

    // ================== CATEGORY WISE REPORTS ==================

    public Map<String, Object> getCategoryWiseReport(String category) {
        Map<String, Object> report = new HashMap<>();

        List<Map<String, Object>> citizens = citizenRepository.findByCategory(Citizen.CitizenCategory.valueOf(category.toUpperCase()))
                .stream()
                .map(citizen -> {
                    Map<String, Object> citizenMap = new HashMap<>();
                    citizenMap.put("id", citizen.getId());
                    citizenMap.put("name", citizen.getUser() != null ? citizen.getUser().getFullName() : "Unknown");
                    citizenMap.put("rationCardNumber", citizen.getRationCardNumber());
                    citizenMap.put("familySize", citizen.getFamilySize());
                    return citizenMap;
                })
                .toList();

        report.put("category", category.toUpperCase());
        report.put("totalCitizens", citizens.size());
        report.put("citizens", citizens);

        return report;
    }
}
