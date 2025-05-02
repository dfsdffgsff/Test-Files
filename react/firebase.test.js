import { describe, it, expect, vi } from "vitest";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import app, { auth } from "../firebase"; // Adjust the import path based on your file structure

// Mock the import.meta.env object
vi.mock("import.meta.env", () => ({
  VITE_API_KEY: "test-api-key",
  VITE_AUTH_DOMAIN: "test-auth-domain",
  VITE_PROJECT_ID: "test-project-id",
  VITE_STORAGE_BUCKET: "test-storage-bucket",
  VITE_MESSAGING_SENDER_ID: "test-messaging-sender-id",
  VITE_APP_ID: "test-app-id",
}));

// Mock Firebase app and auth to avoid actual initialization during tests
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn().mockReturnValue({ mock: "firebase-app" }),
}));
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn().mockReturnValue({ mock: "auth" }),
}));

describe("Firebase Configuration", () => {
  it("should initialize Firebase app with correct config", () => {
    const expectedConfig = {
      apiKey: "test-api-key",
      authDomain: "test-auth-domain",
      projectId: "test-project-id",
      storageBucket: "test-storage-bucket",
      messagingSenderId: "test-messaging-sender-id",
      appId: "test-app-id",
    };

    expect(initializeApp).toHaveBeenCalledWith(expectedConfig);
    expect(app).toEqual({ mock: "firebase-app" });
  });

  it("should initialize Firebase auth", () => {
    expect(getAuth).toHaveBeenCalledWith({ mock: "firebase-app" });
    expect(auth).toEqual({ mock: "auth" });
  });

  it("should have all environment variables defined", () => {
    expect(import.meta.env.VITE_API_KEY).toBeDefined();
    expect(import.meta.env.VITE_AUTH_DOMAIN).toBeDefined();
    expect(import.meta.env.VITE_PROJECT_ID).toBeDefined();
    expect(import.meta.env.VITE_STORAGE_BUCKET).toBeDefined();
    expect(import.meta.env.VITE_MESSAGING_SENDER_ID).toBeDefined();
    expect(import.meta.env.VITE_APP_ID).toBeDefined();
  });
});
