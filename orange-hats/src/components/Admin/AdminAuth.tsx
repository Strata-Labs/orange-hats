import React, { useState } from "react";
import { useAtom } from "jotai";
import { adminTokenAtom, isAuthenticatedAtom } from "@/atoms";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setAdminToken] = useAtom(adminTokenAtom);
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = btoa(`${username}:${password}`);
      localStorage.setItem("adminToken", token);
      setAdminToken(token);
      setIsAuthenticated(true);
      onAuthenticated();
    } catch (error) {
      setError("Invalid credentials");
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-main-dark-grey p-8 rounded-xl">
        <h2 className="text-2xl md:text-3xl font-space-mono text-secondary-white mb-8 text-center">
          Admin Authentication
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-secondary-white mb-2 font-space-grotesk"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-background text-secondary-white border border-main-orange focus:outline-none focus:ring-2 focus:ring-main-orange"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-secondary-white mb-2 font-space-grotesk"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-background text-secondary-white border border-main-orange focus:outline-none focus:ring-2 focus:ring-main-orange"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-main-orange text-black font-bold py-3 rounded-full hover:opacity-90 transition-opacity font-space-grotesk"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;
