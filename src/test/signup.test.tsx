import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classifySignupError } from "@/lib/signup-errors";

const { signUp, navigate } = vi.hoisted(() => ({ signUp: vi.fn(), navigate: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { signUp } } }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => options,
  useNavigate: () => navigate,
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
import { Register } from "@/routes/register";

function fillForm() {
  render(<Register />);
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "signup-test@example.com" } });
  fireEvent.change(screen.getByLabelText("Senha (mínimo 8 caracteres)"), { target: { value: "test-password-123" } });
  fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "test-password-123" } });
  const form = screen.getByRole("button", { name: "Criar conta" }).closest("form");
  if (!form) throw new Error("Registration form missing");
  return form;
}

beforeEach(() => { signUp.mockReset(); navigate.mockReset(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Signup error categories", () => {
  it("recognizes the email quota code from the reported Supabase logs", () => {
    expect(classifySignupError({ code: "over_email_send_rate_limit", status: 429, message: "email rate limit exceeded" }).rateLimited).toBe(true);
  });
  it("recognizes a generic request limit without calling it an email quota", () => {
    expect(classifySignupError({ code: "over_request_rate_limit", status: 429, message: "Too many requests" }).rateLimited).toBe(true);
  });
  it.each([
    { code: "weak_password", status: 422, message: "Weak password" },
    { code: "unexpected_failure", status: 500, message: "SMTP failed" },
    { status: 0, message: "Failed to fetch" },
    { code: "email_address_invalid", status: 400, message: "Invalid email" },
  ])("does not mistake $message for a quota", (error) => {
    expect(classifySignupError(error).rateLimited).toBe(false);
    expect(classifySignupError(error).pauseSeconds).toBe(0);
  });
});

describe("Registration submissions", () => {
  it("sends only once for simultaneous submissions and disables submission during the request", async () => {
    let resolveRequest: (value: unknown) => void = () => {};
    signUp.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve; }));
    const form = fillForm();
    act(() => { fireEvent.submit(form); fireEvent.submit(form); });
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Criando conta..." })).toBeDisabled();
    await act(async () => resolveRequest({ data: { user: { id: "user" }, session: null }, error: null }));
  });
  it("pauses rate-limited submissions and never retries automatically when the pause expires", async () => {
    vi.useFakeTimers();
    signUp.mockResolvedValue({ data: {}, error: { code: "over_email_send_rate_limit", status: 429, message: "email rate limit exceeded" } });
    const form = fillForm();
    await act(async () => fireEvent.submit(form));
    expect(screen.getByRole("button", { name: "Aguarde 60s" })).toBeDisabled();
    fireEvent.submit(form);
    expect(signUp).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeEnabled();
    expect(signUp).toHaveBeenCalledTimes(1);
    await act(async () => fireEvent.submit(form));
    expect(signUp).toHaveBeenCalledTimes(2);
  });
  it("does not redirect or send again when email confirmation is required", async () => {
    signUp.mockResolvedValue({ data: { user: { id: "user" }, session: null }, error: null });
    const form = fillForm();
    fireEvent.submit(form);
    await waitFor(() => expect(screen.getByRole("button", { name: "Cadastro enviado" })).toBeDisabled());
    fireEvent.submit(form);
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    expect(signUp).toHaveBeenCalledWith(expect.objectContaining({ options: { emailRedirectTo: window.location.origin } }));
  });
  it("does not retry automatically after an ambiguous network error", async () => {
    signUp.mockRejectedValue(new Error("Failed to fetch"));
    const form = fillForm();
    fireEvent.submit(form);
    await waitFor(() => expect(screen.getByRole("button", { name: "Criar conta" })).toBeEnabled());
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});