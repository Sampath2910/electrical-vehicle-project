package com.smart.ev.controller;

import com.smart.ev.dto.AuthDto;
import com.smart.ev.dto.WalletDto;
import com.smart.ev.service.AuthService;
import com.smart.ev.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<WalletDto.WalletResponse> getWallet() {
        AuthDto.UserDto currentUser = authService.getCurrentUser();
        String userId = currentUser != null ? currentUser.getId() : "user-drv-001";
        return ResponseEntity.ok(walletService.getWallet(userId));
    }

    @PostMapping("/topup")
    public ResponseEntity<?> topUp(@RequestBody WalletDto.TopUpRequest request) {
        try {
            AuthDto.UserDto currentUser = authService.getCurrentUser();
            String userId = currentUser != null ? currentUser.getId() : "user-drv-001";
            return ResponseEntity.ok(walletService.topUp(userId, request.getAmount(), request.getPaymentReference()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
        }
    }

    public record ErrorResponse(String error) {}
}
