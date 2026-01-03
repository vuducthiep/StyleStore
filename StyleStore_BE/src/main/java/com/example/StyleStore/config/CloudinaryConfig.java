package com.example.StyleStore.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dslt4mgvy",
                "api_key", "825361189772776",
                "api_secret", "MvpZwBT5znbLDrpmWcfRwzrLx_g",
                "secure", true));
    }
}
