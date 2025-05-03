import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
// import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// Mock firebase modules
vi.mock("../firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// Test component that uses auth context
const TestComponent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }

  return (
    <div>
      <div data-testid="auth-status">
        {currentUser ? "User is logged in" : "User is logged out"}
      </div>
    </div>
  );
};

describe("AuthContext", () => {
  let mockUnsubscribe;

  beforeEach(() => {
    mockUnsubscribe = vi.fn();
    onAuthStateChanged.mockImplementation((auth, callback) => {
      // Initially no user is logged in
      callback(null);
      return mockUnsubscribe;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when loading is complete", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should not show loading after auth state is determined
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth-status").textContent).toContain(
      "User is logged out"
    );
  });

  it("sets loading to false even when user is null", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should not show loading and show correct auth status
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth-status").textContent).toContain(
      "User is logged out"
    );
  });

  it("sets currentUser to null when not logged in", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status").textContent).toContain(
      "User is logged out"
    );
  });

  it("updates currentUser when logged in", async () => {
    // Simulate a user logging in
    const mockUser = { email: "test@example.com" };

    onAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate logged in user
      callback(mockUser);
      return mockUnsubscribe;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-status").textContent).toContain(
      "User is logged in"
    );
  });

  it("properly unsubscribes from auth listener on unmount", () => {
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Unmount component
    unmount();

    // Verify unsubscribe was called
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
