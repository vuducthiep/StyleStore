package com.example.StyleStore.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RedisService {
    private final RedisTemplate<String, Object> redisObjectTemplate;

    @Autowired
    public RedisService(RedisTemplate<String, Object> redisObjectTemplate) {
        this.redisObjectTemplate = redisObjectTemplate;
    }

    public void set(String key, Object value, Duration ttl) {
        redisObjectTemplate.opsForValue().set(key, value, ttl.getSeconds(), TimeUnit.SECONDS);
    }

    public <T> T get(String key, Class<T> clazz) {
        Object value = null;
        try {
            value = redisObjectTemplate.opsForValue().get(key);
            if (value == null) return null;
            if (clazz.isInstance(value)) {
                return clazz.cast(value);
            }
            // Try to convert if possible (for String fallback)
            if (value instanceof String) {
                // Optionally, try to parse JSON string here if needed
                return null;
            }
            return null;
        } catch (Exception e) {
            // Handle old/broken data: delete key and return null
            redisObjectTemplate.delete(key);
            return null;
        }
    }

    public void delete(String key) {
        redisObjectTemplate.delete(key);
    }
}
