package com.cts.exception;
import com.cts.dto.ErrorResponseDto;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
@RestControllerAdvice
public class GlobalExceptionHandler {
    // 🔴 Custom Business Exception → 400
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponseDto> handleCustom(CustomException ex) {
        ErrorResponseDto error = ErrorResponseDto.builder()
                .code("BUSINESS_ERROR")
                .message(ex.getMessage())
                .correlationId(MDC.get("correlationId"))
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
    // 🔴 Validation Exception → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Validation error");
        ErrorResponseDto error = ErrorResponseDto.builder()
                .code("VALIDATION_ERROR")
                .message(message)
                .correlationId(MDC.get("correlationId"))
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
    // 🔴 Generic Exception → 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneric(Exception ex) {
        ErrorResponseDto error = ErrorResponseDto.builder()
                .code("INTERNAL_ERROR")
                .message("Something went wrong")
                .correlationId(MDC.get("correlationId"))
                .timestamp(LocalDateTime.now())
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}