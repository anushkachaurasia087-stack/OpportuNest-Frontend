
import { useState } from "react";
import {
  Leaf,
  MapPin,
  Wallet,
  Route,
  Clock,
  TrainFront,
  Car,
  Bike,
  Bus,
  Footprints,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  TreePine,
  RefreshCw,
  Info,
  Cloud,
} from "lucide-react";

const travelModes = [
  { id: "Public transport", label: "Public transport", icon: TrainFront },
  { id: "Bus", label: "Bus", icon: Bus },
  { id: "Carpool", label: "Carpool", icon: Car },
  { id: "Cab / Auto", label: "Cab / Auto", icon: Car },
  { id: "Walking / Cycling", label: "Walking / Cycling", icon: Bike },
];

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-800/70 p-4">
      <Icon size={20} className="mb-3 text-emerald-400" />
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value || "Unavailable"}</p>
    </div>
  );
}

function GreenImpact() {
  const [eventName, setEventName] = useState("");
  const [homeLocation, setHomeLocation] = useState("");
  const [budget, setBudget] = useState("500");
  const [preferredModes, setPreferredModes] = useState([
    "Public transport",
    "Carpool",
  ]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = (mode) => {
    setPreferredModes((current) =>
      current.includes(mode)
        ? current.filter((item) => item !== mode)
        : [...current, mode]
    );
  };

  const analyzeJourney = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/green-impact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: eventName.trim(),
          homeLocation: homeLocation.trim(),
          budget: Number(budget),
          preferredModes,
        }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned ${response.status}. Check that Vercel is running and try again.`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to analyze this journey.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong while analyzing your journey."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen space-y-8 px-5 py-8 text-white md:px-8">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-emerald-500/10 p-3">
          <Leaf size={30} className="text-emerald-400" />
        </div>

        <div>
          <p className="text-sm font-medium text-emerald-400">
            SUSTAINABLE OPPORTUNITY DISCOVERY
          </p>
          <h1 className="mt-1 text-3xl font-bold">Green Impact</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Discover the most affordable and environmentally conscious way
            to attend your next hackathon, workshop, competition or event.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <Leaf className="mb-3 text-emerald-400" size={24} />
          <h3 className="font-semibold">Lower your footprint</h3>
          <p className="mt-2 text-sm text-slate-400">
            Compare estimated emissions across practical transport options.
          </p>
        </Card>

        <Card>
          <Wallet className="mb-3 text-emerald-400" size={24} />
          <h3 className="font-semibold">Protect your budget</h3>
          <p className="mt-2 text-sm text-slate-400">
            Check estimated round-trip costs against your travel budget.
          </p>
        </Card>

        <Card>
          <Sparkles className="mb-3 text-emerald-400" size={24} />
          <h3 className="font-semibold">Get an AI recommendation</h3>
          <p className="mt-2 text-sm text-slate-400">
            Find a practical balance between affordability, time and
            sustainability.
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-bold">Analyze your journey</h2>
          <p className="mt-1 text-sm text-slate-400">
            Enter your details to compare sustainable travel choices.
          </p>
        </div>

        <form onSubmit={analyzeJourney} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Event name
            </label>
            <div className="relative">
              <Sparkles
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
              />
              <input
                required
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Genesis Hackathon 2026"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 outline-none focus:border-emerald-500"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              AI will try to identify the event's likely venue.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Your home location
            </label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
              />
              <input
                required
                value={homeLocation}
                onChange={(e) => setHomeLocation(e.target.value)}
                placeholder="e.g. Thane West, Maharashtra"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 outline-none focus:border-emerald-500"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              A locality or nearby station is enough. Avoid entering your
              full home address.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Maximum round-trip travel budget (₹)
            </label>
            <div className="relative">
              <IndianRupee
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
              />
              <input
                required
                type="number"
                min="0"
                step="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="500"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">
              Preferred travel options
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {travelModes.map(({ id, label, icon: Icon }) => {
                const selected = preferredModes.includes(id);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleMode(id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                      selected
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <Icon size={19} />
                    <span className="flex-1">{label}</span>
                    {selected && <CheckCircle2 size={17} />}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              These preferences help guide the recommendation. The AI may
              still include other practical alternatives.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={20} className="animate-spin" />
                Analyzing sustainable travel options...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Analyze My Green Journey
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-5 flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertTriangle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-emerald-400">YOUR JOURNEY REPORT</p>
              <h2 className="mt-1 text-2xl font-bold">
                {result.event?.name || eventName}
              </h2>
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              New analysis
            </button>
          </div>

          <Card>
            <div className="flex items-start gap-3">
              <MapPin size={22} className="mt-1 shrink-0 text-emerald-400" />
              <div>
                <p className="text-sm text-slate-400">Likely event venue</p>
                <h3 className="mt-1 text-lg font-semibold">
                  {result.event?.location || "Venue not identified"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Venue confidence: {result.event?.locationConfidence || "Unknown"}
                </p>
                {result.event?.locationNote && (
                  <p className="mt-1 text-sm text-slate-400">
                    {result.event.locationNote}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              icon={Route}
              label="Estimated one-way distance"
              value={result.trip?.distanceOneWay}
            />
            <Metric
              icon={Clock}
              label="Estimated one-way journey"
              value={result.trip?.travelTimeOneWay}
            />
            <Metric
              icon={Wallet}
              label="Your travel budget"
              value={`₹${result.budget?.amount ?? budget}`}
            />
          </div>

          <Card>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-emerald-400/50 bg-emerald-500/10">
                <Leaf size={22} className="mb-1 text-emerald-400" />
                <p className="text-3xl font-bold text-emerald-300">
                  {result.greenScore ?? 0}
                </p>
                <p className="text-xs text-slate-400">out of 100</p>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold">Your Green Score</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {result.scoreExplanation ||
                    "An AI assessment of sustainability, affordability and travel feasibility."}
                </p>
              </div>
            </div>
          </Card>

          <div>
            <h3 className="mb-4 text-xl font-bold">
              Compare your transport options
            </h3>

            <div className="grid gap-4 lg:grid-cols-2">
              {(result.options || []).map((option, index) => (
                <Card key={`${option.mode}-${index}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold">{option.mode}</h4>
                      <p className="mt-1 text-sm text-slate-400">
                        {option.sustainabilityNote || option.emissionsLabel}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        option.withinBudget
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {option.withinBudget ? "Within budget" : "Over budget"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">One-way cost</p>
                      <p className="mt-1 font-semibold">{option.costOneWay}</p>
                    </div>
                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">Round-trip cost</p>
                      <p className="mt-1 font-semibold">{option.costRoundTrip}</p>
                    </div>
                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">One-way time</p>
                      <p className="mt-1 font-semibold">{option.timeOneWay}</p>
                    </div>
                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">Round-trip CO₂</p>
                      <p className="mt-1 font-semibold">
                        {option.estimatedCO2KgRoundTrip == null
                          ? "Unavailable"
                          : `~${option.estimatedCO2KgRoundTrip} kg`}
                      </p>
                    </div>
                  </div>

                  {option.distanceNote && (
                    <p className="mt-3 text-xs text-slate-400">
                      {option.distanceNote}
                    </p>
                  )}

                  {option.feasibility && (
                    <p className="mt-3 text-sm text-slate-300">
                      Feasibility: {option.feasibility}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <CheckCircle2 size={24} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI recommendation</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Recommended mode:{" "}
                  {result.budget?.recommendedMode || "No suitable option identified"}
                </p>
              </div>
            </div>

            <p className="mt-4 leading-7 text-slate-300">
              {result.finalRecommendation ||
                "Review the transport comparisons and confirm the venue and fares before travelling."}
            </p>

            {result.budget?.estimatedRoundTripCost && (
              <p className="mt-3 text-sm text-emerald-300">
                Estimated round-trip cost: {result.budget.estimatedRoundTripCost}
              </p>
            )}

            {result.budget?.feasibility && (
              <p className="mt-2 text-sm text-slate-400">
                Journey feasibility: {result.budget.feasibility}
              </p>
            )}
          </Card>

          {Array.isArray(result.why) && result.why.length > 0 && (
            <Card>
              <h3 className="mb-4 font-bold">Why this recommendation?</h3>
              <div className="space-y-3">
                {result.why.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center gap-3">
              <TreePine size={23} className="text-emerald-400" />
              <h3 className="text-xl font-bold">
                Your sustainable travel action plan
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {(result.recommendations || []).map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-300">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <Info size={19} className="mt-0.5 shrink-0 text-slate-400" />
            <div className="text-xs leading-5 text-slate-400">
              <p>
                AI-generated estimates are not live map, traffic, fare or
                emissions data. Carbon figures depend on the vehicle, occupancy,
                route and energy source. Confirm the event venue and actual fares
                before travelling.
              </p>
              {(result.limitations || []).map((item, index) => (
                <p key={index} className="mt-1">{item}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GreenImpact;