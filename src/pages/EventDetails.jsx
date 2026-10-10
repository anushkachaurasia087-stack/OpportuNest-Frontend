import { useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  Bookmark,
  ExternalLink,
} from "lucide-react";

import { Link, useParams } from "react-router-dom";
import { opportunities } from "../data/opportunities";


function EventDetails() {

  const { id } = useParams();

  const opportunity = opportunities.find(
    (item) => item.id === Number(id)
  );

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);


  if (!opportunity) {

    return (
      <div className="p-10 text-white">
        Opportunity not found.
      </div>
    );

  }


  const saveOpportunity = async () => {

    const user = auth.currentUser;

    if (!user) {

      alert("Please log in first.");

      return;

    }


    if (saving) return;


    setSaving(true);


    try {

      await setDoc(
        doc(
          db,
          "savedEvents",
          `${user.uid}_${opportunity.id}`
        ),
        {
          userId: user.uid,
          opportunityId: opportunity.id,
          title: opportunity.title,
          organizer: opportunity.organizer,
          savedAt: new Date(),
        },
        {
          merge: true,
        }
      );


      setSaved(true);

    } catch (error) {

      console.error(
        "Error saving opportunity:",
        error
      );

      alert(
        "Unable to save opportunity. Check your Firestore rules."
      );

    } finally {

      setSaving(false);

    }

  };


  return (

    <div className="min-h-screen px-8 py-8 text-white">


      {/* BACK */}

      <Link
        to="/discover"
        className="flex w-fit items-center gap-2 text-sm text-slate-500 hover:text-white"
      >

        <ArrowLeft size={16} />

        Back to Discover

      </Link>


      {/* HEADER */}

      <div className="mt-8 flex items-start justify-between gap-6">

        <div>

          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            {opportunity.category}
          </span>


          <h1 className="mt-5 text-4xl font-bold">
            {opportunity.title}
          </h1>


          <p className="mt-2 text-slate-500">
            Organized by {opportunity.organizer}
          </p>

        </div>


        <div className="flex gap-3">


          {/* BOOKMARK */}

          <button
            type="button"
            onClick={saveOpportunity}
            disabled={saving}
            aria-label={
              saved
                ? "Opportunity saved"
                : "Save opportunity"
            }
            className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
              saved
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700 bg-slate-900 text-slate-400 hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
            } ${
              saving
                ? "cursor-wait opacity-60"
                : "cursor-pointer"
            }`}
          >

            <Bookmark
              size={20}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />

          </button>


          {/* APPLY */}

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
          >

            Apply Now

            <ExternalLink size={16} />

          </button>

        </div>

      </div>


      {/* MATCH BANNER */}

      <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-emerald-500/10 p-3">

            <Sparkles className="text-emerald-400" />

          </div>


          <div>

            <div className="flex items-center gap-3">

              <h2 className="font-semibold">
                92% Match
              </h2>

              <span className="text-xs text-emerald-400">
                AI recommendation
              </span>

            </div>


            <p className="mt-1 text-sm text-slate-500">
              This opportunity aligns strongly with your
              skills and preferences.
            </p>

          </div>

        </div>

      </div>


      {/* MAIN GRID */}

      <div className="mt-8 grid grid-cols-3 gap-6">


        {/* MAIN INFORMATION */}

        <div className="col-span-2 space-y-6">


          {/* ABOUT */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              About this opportunity
            </h2>


            <p className="mt-4 leading-7 text-slate-400">
              {opportunity.title} is an opportunity for students
              to learn, collaborate and build practical solutions.
              Participants can work with other students and gain
              experience while competing or learning.
            </p>

          </section>


          {/* WHY FITS */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center gap-2">

              <Sparkles
                size={18}
                className="text-emerald-400"
              />

              <h2 className="text-xl font-semibold">
                Why this fits you
              </h2>

            </div>


            <div className="mt-5 space-y-3">

              <Reason text="Matches your technical skills" />

              <Reason text="Fits your preferred difficulty level" />

              {opportunity.cost === 0 && (
                <Reason text="No registration cost" />
              )}

              {opportunity.mode === "Online" && (
                <Reason text="Can be attended remotely" />
              )}

            </div>

          </section>


          {/* SKILLS */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-semibold">
              Skills involved
            </h2>


            <div className="mt-4 flex flex-wrap gap-2">

              {opportunity.skills.map(
                (skill) => (

                  <span
                    key={skill}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-slate-400"
                  >
                    {skill}
                  </span>

                )
              )}

            </div>

          </section>

        </div>


        {/* SIDE INFORMATION */}

        <div className="space-y-5">


          <InfoCard
            icon={Calendar}
            title="Deadline"
            value={opportunity.deadline}
          />


          <InfoCard
            icon={MapPin}
            title="Location"
            value={`${opportunity.mode} · ${opportunity.location}`}
          />


          <InfoCard
            icon={IndianRupee}
            title="Registration"
            value={
              opportunity.cost === 0
                ? "Free"
                : `₹${opportunity.cost}`
            }
          />


          {opportunity.prize && (

            <InfoCard
              icon={Sparkles}
              title="Prize"
              value={opportunity.prize}
            />

          )}


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-xs text-slate-500">
              VERIFIED INFORMATION
            </p>


            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">

              <CheckCircle2 size={16} />

              Source verified

            </div>


            <p className="mt-2 text-xs text-slate-600">
              Last checked recently.
            </p>

          </div>

        </div>

      </div>

    </div>

  );
}


function Reason({ text }) {

  return (

    <div className="flex items-center gap-3 text-sm text-slate-400">

      <CheckCircle2
        size={17}
        className="text-emerald-400"
      />

      {text}

    </div>

  );

}


function InfoCard({
  icon: Icon,
  title,
  value,
}) {

  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <Icon
        size={19}
        className="text-slate-500"
      />

      <p className="mt-4 text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>

    </div>

  );

}


export default EventDetails;