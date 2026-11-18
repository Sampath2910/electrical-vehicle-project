package com.smart.ev.service;

import com.smart.ev.domain.User;
import com.smart.ev.domain.Wallet;
import com.smart.ev.dto.AuthDto;
import com.smart.ev.repository.UserRepository;
import com.smart.ev.repository.WalletRepository;
import com.smart.ev.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        String rawIdentifier = request.getEmail() != null ? request.getEmail().trim() : "";

        User user = userRepository.findByIdentifier(rawIdentifier)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this Email, Username, or Mobile Number."));

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            String message = "Login successful.";
            if (request.getExpectedRole() != null && user.getRole() != request.getExpectedRole()) {
                message = String.format(
                        "Signed in as %s. Redirecting to your %s portal.",
                        user.getRole(), user.getRole().name().toLowerCase()
                );
            }

            return AuthDto.AuthResponse.builder()
                    .success(true)
                    .token(jwt)
                    .tokenType("Bearer")
                    .message(message)
                    .user(toUserDto(user))
                    .build();
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            throw new IllegalArgumentException("Incorrect password. Please verify your password and try again.");
        }
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        User user = User.builder()
                .name(request.getName() != null ? request.getName().trim() : "EV Driver")
                .email(email)
                .phone(request.getPhone() != null ? request.getPhone().trim() : "+91 00000 00000")
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : User.Role.USER)
                .vehicleModel(request.getVehicleModel())
                .assignedStationId(request.getAssignedStationId())
                .operatorBadgeId(request.getOperatorBadgeId())
                .status("ACTIVE")
                .build();

        user = userRepository.save(user);

        // Initialize welcome wallet balance with ₹250.00
        Wallet wallet = Wallet.builder()
                .userId(user.getId())
                .balance(new BigDecimal("250.00"))
                .currency("INR")
                .build();
        walletRepository.save(wallet);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );
        String jwt = tokenProvider.generateToken(authentication);

        return AuthDto.AuthResponse.builder()
                .success(true)
                .token(jwt)
                .tokenType("Bearer")
                .message("Registration successful.")
                .user(toUserDto(user))
                .build();
    }

    public AuthDto.UserDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? toUserDto(user) : null;
    }

    public AuthDto.UserDto toUserDto(User user) {
        return AuthDto.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .assignedStationId(user.getAssignedStationId())
                .operatorBadgeId(user.getOperatorBadgeId())
                .vehicleModel(user.getVehicleModel())
                .build();
    }
}
