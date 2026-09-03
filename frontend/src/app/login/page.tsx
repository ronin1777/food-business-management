"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { Eye, EyeOff } from "lucide-react";

import { login } from "@/lib/api/auth";

export default function LoginPage() {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(
        username.trim(),
        password,
      );

      window.location.href =
        "/dashboard";
    } catch (error) {
      console.error(
        "Login failed:",
        error,
      );

      setError(
        "نام کاربری یا رمز عبور نادرست است.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        flex min-h-screen
        items-center justify-center
        bg-background
        px-4
        py-8
      "
    >
      <div
        className="
          w-full max-w-sm
        "
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight
            "
          >
            مدیریت کسب‌وکار
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            ورود به حساب کاربری
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Username */}
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium"
            >
              نام کاربری
            </label>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value,
                )
              }
              disabled={loading}
              required
              placeholder="نام کاربری خود را وارد کنید"
              className="
                flex h-10 w-full
                rounded-md
                border border-input
                bg-background
                px-3
                text-sm
                outline-none
                transition-colors
                placeholder:text-muted-foreground
                focus:border-ring
                focus:ring-2
                focus:ring-ring/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              رمز عبور
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                disabled={loading}
                required
                placeholder="رمز عبور خود را وارد کنید"
                className="
                  flex h-10 w-full
                  rounded-md
                  border border-input
                  bg-background
                  px-3
                  pl-10
                  text-sm
                  outline-none
                  transition-colors
                  placeholder:text-muted-foreground
                  focus:border-ring
                  focus:ring-2
                  focus:ring-ring/20
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              />

              <button
                type="button"
                tabIndex={-1}
                aria-label={
                  showPassword
                    ? "مخفی کردن رمز عبور"
                    : "نمایش رمز عبور"
                }
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                className="
                  absolute
                  left-2
                  top-1/2
                  flex size-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-md
                  text-muted-foreground
                  transition-colors
                  hover:bg-accent
                  hover:text-accent-foreground
                "
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="
                rounded-md
                border border-destructive/20
                bg-destructive/10
                px-3 py-2.5
                text-sm
                text-destructive
              "
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading ||
              !username.trim() ||
              !password
            }
            className="
              flex h-10 w-full
              items-center
              justify-center
              rounded-md
              bg-primary
              px-4
              text-sm
              font-medium
              text-primary-foreground
              transition-colors
              hover:bg-primary/90
              focus:outline-none
              focus:ring-2
              focus:ring-ring/30
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            {loading
              ? "در حال ورود..."
              : "ورود"}
          </button>
        </form>

        {/* Register */}
        <p
          className="
            mt-6
            text-center
            text-sm
            text-muted-foreground
          "
        >
          حساب کاربری ندارید؟{" "}
          <Link
            href="/register"
            className="
              font-medium
              text-foreground
              underline-offset-4
              hover:underline
            "
          >
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </main>
  );
}