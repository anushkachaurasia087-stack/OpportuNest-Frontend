import { useMemo, useState } from "react"
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  IndianRupee,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react"

import { Link } from "react-router-dom"
import { opportunities } from "../data/opportunities"

function Discover() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [mode, setMode] = useState("All")
  const [freeOnly, setFreeOnly] = useState(false)
  const [beginnerOnly, setBeginnerOnly] = useState(false)
  const [sustainabilityOnly, setSustainabilityOnly] = useState(false)

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {

      const searchText = search.toLowerCase()

      const matchesSearch =
        opportunity.title.toLowerCase().includes(searchText) ||
        opportunity.organizer.toLowerCase().includes(searchText) ||
        opportunity.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        )

      const matchesCategory =
        category === "All" ||
        opportunity.category === category

      const matchesMode =
        mode === "All" ||
        opportunity.mode === mode

      const matchesFree =
        !freeOnly ||
        opportunity.cost === 0

      const matchesBeginner =
        !beginnerOnly ||
        opportunity.level === "Beginner Friendly"

      const matchesSustainability =
        !sustainabilityOnly ||
        opportunity.sustainability === true

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMode &&
        matchesFree &&
        matchesBeginner &&
        matchesSustainability
      )
    })
  }, [
    search,
    category,
    mode,
    freeOnly,
    beginnerOnly,
    sustainabilityOnly,
  ])

  const clearFilters = () => {
    setSearch("")
    setCategory("All")
    setMode("All")
    setFreeOnly(false)
    setBeginnerOnly(false)
    setSustainabilityOnly(false)
  }

  return (
    <div className="min-h-screen px-8 py-8 text-white">

      {/* Header */}

      <div>
        <p className="text-sm text-emerald-400">
          Smart Discovery
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Discover opportunities
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Find hackathons, competitions, workshops and learning
          opportunities matched to your skills and goals.
        </p>
      </div>


      {/* Search */}

      <div className="mt-8 flex gap-3">

        <div className="relative flex-1">

          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search by opportunity, organizer or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
          />

        </div>

        <button
          onClick={clearFilters}
          className="flex items-center gap-2 rounded-2xl border border-slate-800 px-5 text-sm text-slate-400 hover:bg-slate-900"
        >
          <X size={17} />
          Clear
        </button>

      </div>


      {/* Filters */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">

        <div className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal size={17} />
          Filters
        </div>


        {/* Category */}

        <div className="mt-5">

          <p className="mb-3 text-xs text-slate-500">
            CATEGORY
          </p>

          <div className="flex flex-wrap gap-2">

            {[
              "All",
              "Hackathon",
              "Competition",
              "Workshop",
            ].map((item) => (

              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  category === item
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {item}
              </button>

            ))}

          </div>

        </div>


        {/* Mode */}

        <div className="mt-5">

          <p className="mb-3 text-xs text-slate-500">
            MODE
          </p>

          <div className="flex flex-wrap gap-2">

            {[
              "All",
              "Online",
              "Offline",
            ].map((item) => (

              <button
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  mode === item
                    ? "bg-blue-500 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {item}
              </button>

            ))}

          </div>

        </div>


        {/* Smart filters */}

        <div className="mt-5 flex flex-wrap gap-3">

          <FilterButton
            active={freeOnly}
            onClick={() => setFreeOnly(!freeOnly)}
          >
            FREE ONLY
          </FilterButton>

          <FilterButton
            active={beginnerOnly}
            onClick={() => setBeginnerOnly(!beginnerOnly)}
          >
            BEGINNER FRIENDLY
          </FilterButton>

          <FilterButton
            active={sustainabilityOnly}
            onClick={() =>
              setSustainabilityOnly(!sustainabilityOnly)
            }
          >
            🌱 SUSTAINABILITY
          </FilterButton>

        </div>

      </div>


      {/* Results */}

      <div className="mt-8">

        <div className="flex items-end justify-between">

          <div>
            <h2 className="text-xl font-bold">
              {filteredOpportunities.length} opportunities found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ranked according to your profile.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Sparkles size={14} />
            AI Ranked
          </div>

        </div>


        <div className="mt-5 grid grid-cols-2 gap-5">

          {filteredOpportunities.map((opportunity, index) => (

            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              match={92 - index * 4}
            />

          ))}

        </div>


        {filteredOpportunities.length === 0 && (

          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-12 text-center">

            <Search
              className="mx-auto text-slate-600"
              size={35}
            />

            <h3 className="mt-4 font-semibold">
              No opportunities found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your filters or search terms.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}


/* FILTER BUTTON */

function FilterButton({ active, onClick, children }) {

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
      }`}
    >
      {children}
    </button>
  )
}


/* OPPORTUNITY CARD */

function OpportunityCard({ opportunity, match }) {

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500/30">

      {/* Top */}

      <div className="flex items-start justify-between">

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
          {opportunity.category}
        </span>

        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Sparkles size={12} />
          {match}% Match
        </span>

      </div>


      {/* Title */}

      <h3 className="mt-5 text-xl font-semibold group-hover:text-emerald-400">
        {opportunity.title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {opportunity.organizer}
      </p>


      {/* Info */}

      <div className="mt-5 grid grid-cols-2 gap-3">

        <Info
          icon={MapPin}
          text={`${opportunity.mode} · ${opportunity.location}`}
        />

        <Info
          icon={Calendar}
          text={`Deadline ${opportunity.deadline}`}
        />

        <Info
          icon={IndianRupee}
          text={
            opportunity.cost === 0
              ? "Free registration"
              : `₹${opportunity.cost}`
          }
        />

        <Info
          icon={Sparkles}
          text={opportunity.level}
        />

      </div>


      {/* Skills */}

      <div className="mt-5 flex flex-wrap gap-2">

        {opportunity.skills.map((skill) => (

          <span
            key={skill}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-400"
          >
            {skill}
          </span>

        ))}

      </div>


      {/* AI explanation */}

      <div className="mt-5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">

        <div className="flex gap-2">

          <Sparkles
            size={15}
            className="mt-0.5 shrink-0 text-emerald-400"
          />

          <p className="text-xs leading-5 text-slate-400">
            <span className="font-semibold text-emerald-400">
              Why this fits:
            </span>{" "}
            Matches your React and AI skills and fits your
            preference for affordable opportunities.
          </p>

        </div>

      </div>


      {/* Button */}

      <Link
        to={`/event/${opportunity.id}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-semibold transition hover:bg-emerald-500 hover:text-slate-950"
      >
        View opportunity
        <ArrowRight size={16} />
      </Link>

    </div>
  )
}


/* INFO */

function Info({ icon: Icon, text }) {

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">

      <Icon size={14} />

      <span>
        {text}
      </span>

    </div>
  )
}

export default Discover