package com.tradetracker.pms.dto.request.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class CreateUserRequest {
    @NotBlank
    @Size(max=100)
    private String firstName;

    @NotBlank
    @Size(max=100)
    private String lastName;

    @NotBlank
    @Size(max=150)
    @Email
    private String email;

    @NotBlank
    @Size(min=6, max=100)
    private String password;

    public CreateUserRequest(){}

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
