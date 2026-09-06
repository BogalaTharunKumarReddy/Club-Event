package com.campusconnect.service;

import com.campusconnect.dto.request.ChangePasswordRequest;
import com.campusconnect.dto.request.UpdateProfileRequest;
import com.campusconnect.dto.response.UserResponse;
import com.campusconnect.entity.User;

public interface UserService {

    UserResponse getById(Long id);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    /** Internal helper for other services that need the managed entity. */
    User getEntityOrThrow(Long id);
}
