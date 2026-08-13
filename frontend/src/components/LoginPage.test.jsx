import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "../redux/store";
import LoginPage from "./LoginPage";

describe("Login functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("allows a user to enter email and password", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });

    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");

    const loginButton = screen.getByRole("button", {
      name: /sign in/i,
    });

    expect(loginButton).toBeTruthy();
  });
});