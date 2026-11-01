package com.smart.ev.dto;

import com.smart.ev.domain.User;
import lombok.*;

public class AuthDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        private String email;
        private String password;
        private User.Role expectedRole;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String phone;
        private User.Role role;
        private String vehicleModel;
        private String assignedStationId;
        private String operatorBadgeId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private boolean success;
        private String token;
        private String tokenType;
        private UserDto user;
        private String message;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private String phone;
        private User.Role role;
        private String assignedStationId;
        private String operatorBadgeId;
        private String vehicleModel;
    }
}
