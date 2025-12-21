package com.example.StyleStore.service;

import com.example.StyleStore.dto.LoginRequest;
import com.example.StyleStore.dto.RegisterRequest;
import com.example.StyleStore.dto.AuthResponse;
import com.example.StyleStore.model.User;
import com.example.StyleStore.model.enums.Role;
import com.example.StyleStore.model.enums.UserStatus;
import com.example.StyleStore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.email())) {
                        throw new RuntimeException("Email đã tồn tại!");
                }

                // gender phải có giá trị hợp lệ và không vượt quá 10 ký tự
                String genderValue = (request.gender() != null && !request.gender().isBlank())
                                ? request.gender().toUpperCase()
                                : "OTHER";
                if (genderValue.length() > 10) {
                        genderValue = genderValue.substring(0, 10);
                }

                User user = User.builder()
                                .fullName(request.fullName())
                                .email(request.email())
                                .password(passwordEncoder.encode(request.password()))
                                .phoneNumber(request.phoneNumber())
                                .gender(genderValue)
                                .address(request.address())
                                .role(Role.USER)
                                .status(UserStatus.ACTIVE)
                                .build();

                userRepository.save(user);

                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                getAuthorities(user.getRole()));

                String jwt = jwtService.generateToken(userDetails, user.getId(), user.getRole().name());

                return new AuthResponse(jwt, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
        }

        public AuthResponse login(LoginRequest request) {
                try {
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(request.email(), request.password()));
                } catch (Exception ex) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
                }

                User user = userRepository.findByEmail(request.email())
                                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                getAuthorities(user.getRole()));

                String jwt = jwtService.generateToken(userDetails, user.getId(), user.getRole().name());

                return new AuthResponse(jwt, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
        }

        private Collection<? extends GrantedAuthority> getAuthorities(Role role) {
                return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
        }
}