import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios";
import Logo from '../components/Logo'

type UserRole = "ADMIN" | "PHOTOGRAPHER";

interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
}

interface ApiError {
  detail?: string;
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Veuillez renseigner votre e-mail et votre mot de passe.");
      return;
    }

    setLoading(true);

    try {
      // Vérifie le chemin réel de ton endpoint FastAPI.
      const response = await api.post<LoginResponse>(
        "/auth/login",
        {
          email: cleanEmail,
          password,
        }
      );

      const { access_token, token_type, role } = response.data;

      const normalizedRole = role?.toUpperCase();      

      if (
        !access_token ||
        !["ADMIN", "PHOTOGRAPHER"].includes(normalizedRole)
      ) {
        setError(
          "Réponse invalide : token ou rôle utilisateur manquant."
        );
        return;
      }

      // Enregistrer la session uniquement après validation.
      localStorage.setItem("access_token", access_token);
      localStorage.setItem(
        "token_type",
        token_type || "bearer"
      );
      localStorage.setItem("user_role", normalizedRole);

      // Redirection selon le rôle.
      if (normalizedRole === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiError>(err)) {
        if (!err.response) {
          setError(
            "Serveur inaccessible. Vérifiez l'URL de l'API et votre connexion."
          );
        } else {
          const status = err.response.status;
          const detail = err.response.data?.detail;

          if (status === 401) {
            setError("E-mail ou mot de passe incorrect.");
          } else if (status === 403) {
            setError(detail || "Votre compte est désactivé.");
          } else {
            setError(
              detail || "Une erreur est survenue lors de la connexion."
            );
          }
        }
      } else {
        setError("Une erreur inattendue est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/[0.06] blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="mb-10 flex justify-center"><Logo size="lg" /></div>

        {/* Card */}
        <div className="bg-ink-900/60 backdrop-blur-xl border border-overlay/[0.06] rounded-3xl p-8 md:p-10 shadow-2xl">

          <h1 className="text-2xl font-bold text-ink-50 mb-2">
            Bon retour parmi nous
          </h1>

          <p className="text-sm text-ink-500 mb-7">
            Connectez-vous à votre compte
          </p>

          {/* ================================= */}
          {/* ERREUR */}
          {/* ================================= */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >

            {/* Email */}
            <div>

              <label className="block text-sm font-medium text-ink-300 mb-2">
                Adresse e-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="vous@exemple.com"
                required
                disabled={loading}
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10 disabled:opacity-50"
              />

            </div>

            {/* Password */}
            <div>

              <label className="block text-sm font-medium text-ink-300 mb-2">
                Mot de passe
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-ink-800 border border-overlay/[0.08] text-ink-100 placeholder-ink-500 text-sm outline-none transition-all focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (v) => !v
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                >

                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                    >
                      <path
                        d="M3 3l18 18M10.5 10.7a2 2 0 002.8 2.8M9.9 5.1A9.7 9.7 0 0112 5c5 0 9 4.5 10 7a13 13 0 01-2.2 3.2M6.1 6.1A13 13 0 002 12c1 2.5 5 7 10 7a9.7 9.7 0 004.9-1.3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                    >
                      <path
                        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}

                </button>

              </div>

            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm text-ink-400 cursor-pointer">

                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-brand-500"
                />

                Se souvenir de moi

              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                Mot de passe oublié ?
              </Link>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {loading
                ? "Connexion en cours..."
                : "Se connecter"}

            </button>

          </form>

          {/* Divider */}
          {/* <div className="flex items-center gap-4 my-7">

            <div className="flex-1 h-px bg-overlay/[0.08]" />

            <span className="text-xs text-ink-500 uppercase tracking-wider">
              ou
            </span>

            <div className="flex-1 h-px bg-overlay/[0.08]" />

          </div> */}

          {/* Btn Google */}
          {/* <button
            type="button"
            className="w-full py-3.5 rounded-xl bg-overlay/[0.04] border border-overlay/[0.08] text-ink-200 font-medium text-sm transition-all hover:bg-overlay/[0.08] flex items-center justify-center gap-3"
          >

            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                fill="#4285F4"
                d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 01-2.2 3.3v2.7h3.6c2.1-2 3.2-4.8 3.2-7.8z"
              />

              <path
                fill="#34A853"
                d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1-3.6 1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0012 23z"
              />

              <path
                fill="#FBBC05"
                d="M6 14.3a6.6 6.6 0 010-4.2V7.3H2.3a11 11 0 000 9.8L6 14.3z"
              />

              <path
                fill="#EA4335"
                d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 002.3 7.3L6 10.1c.9-2.6 3.2-4.7 6-4.7z"
              />
            </svg>

            Continuer avec Google

          </button> */}

          {/* Switch */}
          <p className="text-center text-sm text-ink-400 mt-7">

            Pas encore de compte ?{" "}

            <Link
              to="/signup"
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
            >
              Créer un compte
            </Link>

          </p>

        </div>

        {/* Back */}
        <p className="text-center mt-6">

          <Link
            to="/"
            className="text-sm text-ink-500 hover:text-ink-300 transition-colors"
          >
            ← Retour à l'accueil
          </Link>

        </p>

      </div>
    </div>
  );
}