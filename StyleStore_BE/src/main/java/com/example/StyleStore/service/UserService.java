package com.example.StyleStore.service;

import com.example.StyleStore.model.User;
import com.example.StyleStore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // for test api
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public boolean deleteUserByEmail(String email) {
        return userRepository.deleteByEmail(email);
    }

    public boolean deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            return false;
        }
        userRepository.deleteById(id);
        return true;
    }

    public User updateUser(Long id, User newUser) {
        return userRepository.findById(id)
                .map(user -> {
                    if (newUser.getFullName() != null) {
                        user.setFullName(newUser.getFullName());
                    }
                    if (newUser.getEmail() != null) {
                        user.setEmail(newUser.getEmail());
                    }
                    if (newUser.getPassword() != null && !newUser.getPassword().isEmpty()) {
                        user.setPassword(newUser.getPassword());
                    }
                    if (newUser.getRole() != null) {
                        user.setRole(newUser.getRole());
                    }
                    if (newUser.getStatus() != null) {
                        user.setStatus(newUser.getStatus());
                    }
                    if (newUser.getPhoneNumber() != null) {
                        user.setPhoneNumber(newUser.getPhoneNumber());
                    }
                    if (newUser.getGender() != null) {
                        user.setGender(newUser.getGender());
                    }
                    if (newUser.getAddress() != null) {
                        user.setAddress(newUser.getAddress());
                    }
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}