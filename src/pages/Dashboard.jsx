import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
  IndianRupee,
  Users,
  Leaf,
} from "lucide-react"

import { Link } from "react-router-dom"

import { opportunities } from "../data/opportunities"

function Dashboard() {

  const recommended = opportunities.slice(0, 3)

  return (
    <div className="min-h-screen px-8 py-8 text-white">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-emerald-400">
            Good evening 👋
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Find your next opportunity.
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            AI-powered recommendations based on your skills,
            interests, budget and availability.
          </p>
        </div>

        <Link
          to="/discover"
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Explore
          <ArrowRight size={18} />
        </Link>

      </div>


      {/* AI Match Banner */}

      <div className="mt-8 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 p-6">

        <div className="flex items-start gap-4">

          <div className="rounded-2xl bg-emerald-500/10 p-3">
            <Sparkles className="text-emerald-400" />
          </div>

          <div className="flex-1">

            <div className="flex items-center gap-3">

              <h2 className="text-lg font-semibold">
                Your AI Match Score
              </h2>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                87% Match
              </span>

            </div>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Based on your current skills in React, Python and AI,
              we found several opportunities that fit your profile.
            </p>

            <Link
              to="/discover"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              See your recommendations
              <ArrowRight size={15} />
            </Link>

          </div>

        </div>

      </div>


      {/* Stats */}

      <div className="mt-8 grid grid-cols-4 gap-4">

        <Stat
          icon={TrendingUp}
          number="12"
          label="Opportunities found"
        />

        <Stat
          icon={Calendar}
          number="4"
          label="Deadlines this month"
        />

        <Stat
          icon={Users}
          number="7"
          label="Potential teammates"
        />

        <Stat
          icon={Leaf}
          number="18.4 kg"
          label="CO₂ potentially saved"
        />

      </div>


      {/* Recommended */}

      <div className="mt-10">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold">
              Recommended for you
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Opportunities selected based on your profile.
            </p>
          </div>

          <Link
            to="/discover"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            View all →
          </Link>

        </div>


        <div className="mt-5 grid grid-cols-3 gap-5">

          {recommended.map((opportunity) => (
            <OpportunityPreview
              key={opportunity.id}
              opportunity={opportunity}
            />
          ))}

        </div>

      </div>


      {/* Bottom cards */}

      <div className="mt-8 grid grid-cols-2 gap-5">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-purple-500/10 p-3">
              <Sparkles className="text-purple-400" size={20} />
            </div>

            <div>
              <h3 className="font-semibold">
                AI Prep Coach
              </h3>

              <p className="text-sm text-slate-500">
                Get a personalized preparation roadmap.
              </p>
            </div>

          </div>

          <Link
            to="/prep"
            className="mt-5 block rounded-xl border border-slate-700 py-3 text-center text-sm font-semibold hover:bg-slate-800"
          >
            Create my plan
          </Link>

        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-500/10 p-3">
              <Users className="text-blue-400" size={20} />
            </div>

            <div>
              <h3 className="font-semibold">
                Find your team
              </h3>

              <p className="text-sm text-slate-500">
                Match with students who complement your skills.
              </p>
            </div>

          </div>

          <Link
            to="/team"
            className="mt-5 block rounded-xl border border-slate-700 py-3 text-center text-sm font-semibold hover:bg-slate-800"
          >
            Find teammates
          </Link>

        </div>

      </div>

    </div>
  )
}


/* ---------- Components ---------- */

function Stat({ icon: Icon, number, label }) {

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <Icon
        size={20}
        className="text-slate-400"
      />

      <p className="mt-4 text-2xl font-bold">
        {number}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>

    </div>
  )
}


function OpportunityPreview({ opportunity }) {

  return (
    <Link
      to={`/event/${opportunity.id}`}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-emerald-500/30"
    >

      <div className="flex items-start justify-between">

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
          {opportunity.category}
        </span>

        {opportunity.cost === 0 && (
          <span className="text-xs font-semibold text-emerald-400">
            FREE
          </span>
        )}

      </div>


      <h3 className="mt-5 text-lg font-semibold group-hover:text-emerald-400">
        {opportunity.title}
      </h3>


      <p className="mt-2 text-sm text-slate-500">
        {opportunity.organizer}
      </p>


      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">

        <span>
          {opportunity.mode}
        </span>

        <span>
          {opportunity.location}
        </span>

      </div>


      <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500">

        <Calendar size={14} />

        Deadline: {opportunity.deadline}

      </div>

    </Link>
  )
}

export default Dashboard