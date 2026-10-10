import { useState } from "react";
import {
  Sparkles,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

import { askAI } from "../services/ai";

const opportunities = [
  {
    id: 1,
    title: "Genesis Hackathon 2026",
    category: "Hackathon",
    skills: ["React", "AI", "Python", "Git"],
    duration: "7 days",
    match: 92,
  },
  {
    id: 2,
    title: "GreenTech Innovation Challenge",
    category: "Competition",
    skills: [
      "AI",
      "Research",
      "Data Science",
      "Sustainability",
    ],
    duration: "10 days",
    match: 86,
  },
  {
    id: 3,
    title: "FinTech Buildathon",
    category: "Hackathon",
    skills: [
      "React",
      "JavaScript",
      "APIs",
      "FinTech",
    ],
    duration: "5 days",
    match: 81,
  },
];

const plans = {
  "Genesis Hackathon 2026": [
    {
      day: "Day 1",
      title: "React Fundamentals",
      description:
        "Revise components, props, state, hooks and React Router.",
      time: "2 hours",
      resource: "React Official Tutorial",
    },
    {
      day: "Day 2",
      title: "Build a Mini UI",
      description:
        "Create a small dashboard using React and Tailwind CSS.",
      time: "2 hours",
      resource: "Tailwind CSS Docs",
    },
    {
      day: "Day 3",
      title: "Python + APIs",
      description:
        "Learn how to connect a frontend with a Python backend API.",
      time: "2 hours",
      resource: "FastAPI Beginner Guide",
    },
    {
      day: "Day 4",
      title: "AI Integration",
      description:
        "Learn how an LLM API can be integrated into your application.",
      time: "2 hours",
      resource: "Gemini API Documentation",
    },
    {
      day: "Day 5",
      title: "Git & Collaboration",
      description:
        "Practice Git branches, commits, pull requests and resolving conflicts.",
      time: "1.5 hours",
      resource: "GitHub Skills",
    },
    {
      day: "Day 6",
      title: "Build Your Project",
      description:
        "Combine everything and build the main hackathon feature.",
      time: "3 hours",
      resource: "Your Project",
    },
    {
      day: "Day 7",
      title: "Pitch & Polish",
      description:
        "Fix bugs, improve UI and prepare your 2-minute project pitch.",
      time: "2 hours",
      resource: "Hackathon Pitch Practice",
    },
  ],

  "GreenTech Innovation Challenge": [
    {
      day: "Day 1",
      title: "Understand the Problem",
      description:
        "Research the sustainability problem and identify measurable impact.",
      time: "2 hours",
      resource: "UN Sustainable Development Goals",
    },
    {
      day: "Day 2",
      title: "Data Science Basics",
      description:
        "Revise datasets, preprocessing and basic data visualization.",
      time: "2 hours",
      resource: "Kaggle Learn",
    },
    {
      day: "Day 3",
      title: "AI Fundamentals",
      description:
        "Understand classification, prediction and model evaluation.",
      time: "2 hours",
      resource: "Google ML Crash Course",
    },
    {
      day: "Day 4",
      title: "Build a Prototype",
      description:
        "Turn your idea into a working proof of concept.",
      time: "3 hours",
      resource: "Prototype",
    },
  ],

  "FinTech Buildathon": [
    {
      day: "Day 1",
      title: "JavaScript Revision",
      description:
        "Revise modern JavaScript, arrays, objects and async functions.",
      time: "2 hours",
      resource: "MDN JavaScript Guide",
    },
    {
      day: "Day 2",
      title: "React + APIs",
      description:
        "Build a React interface that consumes an external API.",
      time: "2 hours",
      resource: "React Documentation",
    },
    {
      day: "Day 3",
      title: "FinTech Basics",
      description:
        "Understand payments, digital wallets and financial APIs.",
      time: "2 hours",
      resource: "FinTech Fundamentals",
    },
    {
      day: "Day 4",
      title: "Build & Test",
      description:
        "Create your MVP and test the main user journey.",
      time: "3 hours",
      resource: "Your Project",
    },
  ],
};

function PrepCoach() {
  const [selected, setSelected] = useState(opportunities[0]);

  const [started, setStarted] = useState(false);

  const [completed, setCompleted] = useState([]);

  // REAL AI STATE
  const [aiResult, setAiResult] = useState("");

  const [aiLoading, setAiLoading] = useState(false);

  const [aiError, setAiError] = useState("");

  const plan = plans[selected.title] || [];

  const toggleComplete = (day) => {
    setCompleted((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day]
    );
  };

  const progress =
    plan.length === 0
      ? 0
      : Math.round(
          (completed.length / plan.length) * 100
        );

  // -----------------------------
  // REAL GEMINI AI
  // -----------------------------

  const generateAIPlan = async () => {
    setAiLoading(true);
    setAiError("");
    setAiResult("");

    try {
      const result = await askAI(`
You are OpportuNest AI Prep Coach.

You are helping a college student prepare for an opportunity.

Student skills:
React, JavaScript, Python, AI

Opportunity:
${selected.title}

Category:
${selected.category}

Required skills:
${selected.skills.join(", ")}

Preparation duration:
${selected.duration}

Current match score:
${selected.match}%

Create a practical and beginner-friendly preparation plan.

Give the response in this exact structure:

SKILL GAPS
- List the most important skills the student should improve.

WHAT TO LEARN FIRST
- Give the top 3 things to focus on.

DAY-WISE PLAN
Day 1:
Day 2:
Day 3:
Continue according to the preparation duration.

FREE RESOURCES
- Suggest useful free learning resources.

FINAL ADVICE
- Give 3 practical tips for performing well.

Keep the response concise.
Do not use unnecessary explanations.
`);

      setAiResult(result);

      setStarted(true);
    } catch (error) {
      console.error(
        "AI generation error:",
        error
      );

      setAiError(
        "Unable to generate the AI plan. Please check your Gemini API setup."
      );
    }

    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-8 py-10 text-white">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-10">

          <div className="mb-3 flex items-center gap-2 text-emerald-400">

            <Sparkles size={20} />

            <span className="text-sm font-semibold tracking-wider">
              AI PREP COACH
            </span>

          </div>

          <h1 className="text-4xl font-bold">
            Prepare Smarter
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Get a personalized preparation plan based on
            the opportunity, your skills and the time you
            have available.
          </p>

        </div>

        {/* OPPORTUNITY SELECTOR */}

        <div className="mb-8">

          <h2 className="mb-4 text-lg font-semibold">
            Choose an opportunity
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            {opportunities.map((opportunity) => (

              <button
                key={opportunity.id}
                onClick={() => {
                  setSelected(opportunity);
                  setStarted(false);
                  setCompleted([]);
                  setAiResult("");
                  setAiError("");
                }}
                className={`rounded-2xl border p-5 text-left transition ${
                  selected.id === opportunity.id
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-900 hover:border-slate-600"
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                    {opportunity.category}
                  </span>

                  <span className="text-sm font-bold text-emerald-400">
                    {opportunity.match}%
                  </span>

                </div>

                <h3 className="mt-4 font-semibold">
                  {opportunity.title}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  {opportunity.duration} preparation plan
                </p>

              </button>

            ))}

          </div>

        </div>

        {/* AI ANALYSIS */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* SKILL GAP */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-emerald-500/10 p-3">

                <Target
                  className="text-emerald-400"
                  size={22}
                />

              </div>

              <div>

                <h3 className="font-semibold">
                  Skill Analysis
                </h3>

                <p className="text-xs text-slate-500">
                  AI detected
                </p>

              </div>

            </div>

            <div className="mt-6">

              <div className="mb-2 flex justify-between text-sm">

                <span className="text-slate-400">
                  Current readiness
                </span>

                <span className="font-bold text-emerald-400">
                  {selected.match}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${selected.match}%`,
                  }}
                />

              </div>

            </div>

            <div className="mt-6">

              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Required skills
              </p>

              <div className="space-y-3">

                {selected.skills.map(
                  (skill, index) => (

                    <div
                      key={skill}
                      className="flex items-center justify-between"
                    >

                      <span className="text-sm text-slate-300">
                        {skill}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          index < 2
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-orange-500/10 text-orange-400"
                        }`}
                      >
                        {index < 2
                          ? "Strong"
                          : "Learn"}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

          {/* AI SUMMARY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-emerald-500/10 p-3">

                <Sparkles
                  className="text-emerald-400"
                  size={22}
                />

              </div>

              <div>

                <h3 className="font-semibold">
                  AI Recommendation
                </h3>

                <p className="text-xs text-slate-500">
                  Personalized for you
                </p>

              </div>

            </div>

            {!aiResult && (

              <p className="mt-6 leading-relaxed text-slate-300">

                You're already a strong match for{" "}

                <span className="font-semibold text-white">
                  {selected.title}
                </span>

                . Focus on strengthening your weaker
                skills first, then spend the final days
                building and polishing a working prototype.

              </p>

            )}

            {aiResult && (

              <div className="mt-6 whitespace-pre-wrap rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm leading-7 text-slate-300">
                {aiResult}
              </div>

            )}

            {aiError && (

              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {aiError}
              </div>

            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl bg-slate-800 p-4">

                <Clock
                  size={18}
                  className="text-cyan-400"
                />

                <p className="mt-3 text-xs text-slate-500">
                  Recommended
                </p>

                <p className="mt-1 font-semibold">
                  2 hrs/day
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-4">

                <BookOpen
                  size={18}
                  className="text-emerald-400"
                />

                <p className="mt-3 text-xs text-slate-500">
                  Learning
                </p>

                <p className="mt-1 font-semibold">
                  Free resources
                </p>

              </div>

              <div className="rounded-xl bg-slate-800 p-4">

                <Target
                  size={18}
                  className="text-orange-400"
                />

                <p className="mt-3 text-xs text-slate-500">
                  Goal
                </p>

                <p className="mt-1 font-semibold">
                  Build MVP
                </p>

              </div>

            </div>

            {/* REAL AI BUTTON */}

            <button
              onClick={generateAIPlan}
              disabled={aiLoading}
              className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Sparkles size={18} />

              {aiLoading
                ? "AI is thinking..."
                : "Generate Real AI Plan"}

            </button>

          </div>

        </div>

        {/* PREPARATION PLAN */}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <h2 className="text-xl font-bold">
                Your Preparation Plan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                AI-generated day-wise roadmap
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm font-semibold text-emerald-400">
                {progress}% complete
              </p>

              <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

          </div>

          {/* START BUTTON */}

          {!started && (

            <button
              onClick={() => setStarted(true)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Generate My Plan
              <ChevronRight size={18} />
            </button>

          )}

          {/* PLAN */}

          {started && (

            <div className="mt-7 space-y-3">

              {plan.map((item) => {

                const isComplete =
                  completed.includes(item.day);

                return (

                  <div
                    key={item.day}
                    className={`rounded-2xl border p-5 transition ${
                      isComplete
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >

                    <div className="flex items-start gap-4">

                      <button
                        onClick={() =>
                          toggleComplete(item.day)
                        }
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                          isComplete
                            ? "border-emerald-400 bg-emerald-500 text-slate-950"
                            : "border-slate-700 text-transparent"
                        }`}
                      >

                        <CheckCircle2 size={18} />

                      </button>

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center justify-between gap-2">

                          <div>

                            <span className="text-xs font-semibold text-emerald-400">
                              {item.day}
                            </span>

                            <h3 className="mt-1 font-semibold">
                              {item.title}
                            </h3>

                          </div>

                          <span className="flex items-center gap-1 text-xs text-slate-500">

                            <Clock size={13} />

                            {item.time}

                          </span>

                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                          {item.description}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">

                          <BookOpen size={13} />

                          {item.resource}

                        </div>

                      </div>

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default PrepCoach;