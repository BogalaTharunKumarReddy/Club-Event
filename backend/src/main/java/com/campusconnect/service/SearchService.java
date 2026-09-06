package com.campusconnect.service;

import com.campusconnect.dto.response.GlobalSearchResponse;

public interface SearchService {

    /**
     * Free-text search across events and clubs, plus users for platform admins.
     *
     * @param q        the raw query string (blank/too-short queries yield an empty result)
     * @param viewerId the signed-in user's id, or {@code null} when anonymous — used to
     *                 flag saved events / followed clubs in the results
     * @param isAdmin  whether the viewer holds the ADMIN role; only admins get user matches
     * @param limit    max results to return per result type
     */
    GlobalSearchResponse search(String q, Long viewerId, boolean isAdmin, int limit);
}
