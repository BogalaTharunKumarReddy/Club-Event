package com.campusconnect.common;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/** Small helper to build safe {@link Pageable}s with sane bounds and a server-defined default sort. */
public final class PageRequests {

    private static final int MAX_SIZE = 100;

    private PageRequests() {
    }

    public static Pageable of(int page, int size, Sort defaultSort) {
        int safePage = Math.max(page, 0);
        int safeSize = size < 1 ? 10 : Math.min(size, MAX_SIZE);
        return PageRequest.of(safePage, safeSize, defaultSort);
    }
}
