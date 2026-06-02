package com.sportbooking.backend_sportcourtbooking.exception;

import com.sportbooking.backend_sportcourtbooking.DTOs.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return build(HttpStatus.BAD_REQUEST, "Validation failed: " + message);
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class, EntityNotFoundException.class})
    public ResponseEntity<ApiResponse<?>> handleBadRequest(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> handleAuth(AuthenticationException ex, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<?>> handleRuntime(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    private ResponseEntity<ApiResponse<?>> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiResponse<>(false, message));
    }

    // OLD CODE - KEEP FOR BACKUP
    /*
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationOld(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return buildOld(HttpStatus.BAD_REQUEST, "Validation failed", message, request.getRequestURI());
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class, EntityNotFoundException.class})
    public ResponseEntity<ApiErrorResponse> handleBadRequestOld(RuntimeException ex, HttpServletRequest request) {
        return buildOld(HttpStatus.BAD_REQUEST, "Bad request", ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDeniedOld(AccessDeniedException ex, HttpServletRequest request) {
        return buildOld(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthOld(AuthenticationException ex, HttpServletRequest request) {
        return buildOld(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleRuntimeOld(RuntimeException ex, HttpServletRequest request) {
        return buildOld(HttpStatus.BAD_REQUEST, "Bad request", ex.getMessage(), request.getRequestURI());
    }

    private ResponseEntity<ApiErrorResponse> buildOld(HttpStatus status, String error, String message, String path) {
        return ResponseEntity.status(status).body(
                new ApiErrorResponse(java.time.LocalDateTime.now(), status.value(), error, message, path)
        );
    }
    */
}
