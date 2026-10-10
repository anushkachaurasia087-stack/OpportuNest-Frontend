import { useState } from "react";

import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Search,
  XCircle,
  Info,
} from "lucide-react";

import { askAI } from "../services/ai";

export default function ClaimChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkClaim = async () => {
    if (!text.trim()) {
      setError(
        "Please paste an opportunity description first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await askAI(`
You are the OpportuNest AI Claim Checker.

Analyze the following opportunity listing for credibility and completeness.

IMPORTANT:
You cannot browse the internet or independently verify whether the organizer is real.
Do NOT claim that information is factually verified.
Instead, identify suspicious claims, contradictions, missing information, and things the student should verify.

Opportunity listing:

${text}

Give your response in exactly this structure:

CREDIBILITY STATUS:
Choose exactly one:
Looks Complete
Needs Verification
High Risk

CONFIDENCE:
Give a percentage from 0 to 100.

POSITIVE SIGNALS:
- List useful information that makes the listing look complete.

RED FLAGS:
- List suspicious, vague, contradictory, or potentially misleading claims.
- If there are none, say "No obvious red flags found."

MISSING INFORMATION:
- List important information that is missing.

WHAT TO VERIFY:
- Give 3 specific things the student should verify before registering.

FINAL RECOMMENDATION:
Give one short recommendation.

Keep the response concise and student-friendly.
`);

      setResult(response);
    } catch (err) {
      console.error(
        "Claim checker error:",
        err
      );

      setError(
        err.message ||
          "Unable to analyze this opportunity."
      );
    }

    setLoading(false);
  };

  const clearChecker = () => {
    setText("");
    setResult("");
    setError("");
  };

  const getStatus = () => {
    if (!result) return null;

    const lower = result.toLowerCase();

    if (lower.includes("high risk")) {
      return {
        label: "High Risk",
        icon: XCircle,
        description:
          "Several concerns were detected. Verify the opportunity carefully.",
      };
    }

    if (lower.includes("needs verification")) {
      return {
        label: "Needs Verification",
        icon: AlertTriangle,
        description:
          "Some details should be verified before registering.",
      };
    }

    return {
      label: "Looks Complete",
      icon: CheckCircle2,
      description:
        "The listing contains useful information, but official verification is still recommended.",
    };
  };

  const status = getStatus();

  return (
    <div className="min-h-screen px-8 py-8 text-white">

      {/* HEADER */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
            <ShieldCheck
              size={25}
              className="text-emerald-400"
            />
          </div>

          <div>

            <h1 className="text-3xl font-bold">
              AI Claim Checker
            </h1>

            <p className="mt-1 text-slate-500">
              Detect missing, suspicious or contradictory
              information in opportunity listings.
            </p>

          </div>

        </div>

      </div>

      {/* INPUT + INFO */}

      <div className="grid grid-cols-3 gap-6">

        {/* INPUT */}

        <div className="col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-7">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-semibold">
                Paste Opportunity Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Paste the description, eligibility,
                prize, deadline or other claims.
              </p>

            </div>

            <Sparkles
              size={20}
              className="text-emerald-400"
            />

          </div>

          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder={`Example:

Genesis Hackathon 2026

Prize Pool: ₹10,00,000

Open for all college students.

Registration is completely free.

Final registration deadline: 20 October 2026.

Participants will receive certificates and internship opportunities.`}
            className="mt-6 min-h-[280px] w-full resize-none rounded-2xl border border-slate-700 bg-slate-800 p-5 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">

              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              {error}

            </div>
          )}

          <div className="mt-5 flex gap-3">

            <button
              onClick={checkClaim}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <ShieldCheck size={18} />

              {loading
                ? "Analyzing..."
                : "Check Claims"}

            </button>

            <button
              onClick={clearChecker}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-400 transition hover:border-slate-500 hover:text-white"
            >
              Clear
            </button>

          </div>

        </div>

        {/* INFO */}

        <div className="h-fit rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
            <ShieldCheck
              size={21}
              className="text-emerald-400"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            What does AI check?
          </h2>

          <div className="mt-5 space-y-4">

            <CheckItem text="Missing opportunity details" />

            <CheckItem text="Contradictory information" />

            <CheckItem text="Unusually strong claims" />

            <CheckItem text="Vague eligibility requirements" />

            <CheckItem text="Important details students should verify" />

          </div>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">

            <div className="flex gap-2">

              <Info
                size={17}
                className="mt-0.5 shrink-0 text-amber-400"
              />

              <p className="text-xs leading-5 text-slate-400">
                AI cannot independently verify an organizer.
                Always check the official source before
                registering or paying.
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* AI RESULT */}

      {result && (
        <div className="mt-6 space-y-5">

          {/* STATUS CARD */}

          {status && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

                    <status.icon
                      size={24}
                      className="text-emerald-400"
                    />

                  </div>

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      AI Assessment
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {status.label}
                    </h2>

                  </div>

                </div>

                <div className="rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
                  AI Analyzed
                </div>

              </div>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
                {status.description}
              </p>

            </div>
          )}

          {/* RESULT */}

          <div className="rounded-3xl border border-emerald-500/20 bg-slate-900 p-7">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">

                <Sparkles
                  size={20}
                  className="text-emerald-400"
                />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Detailed AI Analysis
                </h2>

                <p className="text-sm text-slate-500">
                  Based only on the information provided
                </p>

              </div>

            </div>

            <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm leading-7 text-slate-300">
              {result}
            </div>

          </div>

          {/* VERIFY CARD */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">

                <Search
                  size={20}
                  className="text-emerald-400"
                />

              </div>

              <div>

                <h2 className="font-semibold">
                  Before You Register
                </h2>

                <p className="text-sm text-slate-500">
                  Always perform a final manual verification.
                </p>

              </div>

            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">

              <VerifyItem
                number="01"
                text="Check the official organizer website."
              />

              <VerifyItem
                number="02"
                text="Confirm the deadline and eligibility."
              />

              <VerifyItem
                number="03"
                text="Never pay through an unverified link."
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-start gap-3 text-sm text-slate-400">

      <CheckCircle2
        size={17}
        className="mt-0.5 shrink-0 text-emerald-400"
      />

      <span>{text}</span>

    </div>
  );
}

function VerifyItem({
  number,
  text,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

      <div className="text-xs font-bold text-emerald-400">
        {number}
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>

    </div>
  );
}