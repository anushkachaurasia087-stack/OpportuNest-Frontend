
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { auth, db } from "../firebase/config";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  User,
  CheckCircle2,
  Bookmark,
  Trash2,
  Users,
  MapPin,
  Clock,
  GraduationCap,
  Code2,
} from "lucide-react";

const defaultSkills = [
  "React",
  "JavaScript",
  "Python",
  "AI",
];

export default function Profile() {
  const [name, setName] = useState("Manasvi");
  const [branch, setBranch] = useState("Computer Engineering");
  const [year, setYear] = useState("2nd Year");
  const [location, setLocation] = useState("Mumbai");
  const [availability, setAvailability] = useState("Weekends");
  const [skills, setSkills] = useState(defaultSkills);
  const [skillsInput, setSkillsInput] = useState("");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [savedEvents, setSavedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // LOAD PROFILE
  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        // Read only the current user's document
        const profileRef = doc(db, "users", user.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (profileSnapshot.exists()) {
          const profileData = profileSnapshot.data();

          setName(profileData.name || "Manasvi");
          setBranch(
            profileData.branch || "Computer Engineering"
          );
          setYear(profileData.year || "2nd Year");
          setLocation(profileData.location || "Mumbai");
          setAvailability(
            profileData.availability || "Weekends"
          );
          setSkills(
            Array.isArray(profileData.skills)
              ? profileData.skills
              : defaultSkills
          );
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  // LOAD SAVED OPPORTUNITIES
  useEffect(() => {
    const loadSavedEvents = async () => {
      const user = auth.currentUser;

      if (!user) {
        setSavedEvents([]);
        setLoadingEvents(false);
        return;
      }

      try {
        const savedEventsRef = collection(db, "savedEvents");

        const q = query(
          savedEventsRef,
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const events = snapshot.docs.map((eventDoc) => ({
          id: eventDoc.id,
          ...eventDoc.data(),
        }));

        setSavedEvents(events);
      } catch (error) {
        console.error("Error loading saved events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadSavedEvents();
  }, []);

  // ADD A SKILL
  const addSkill = () => {
    const newSkill = skillsInput.trim();

    if (
      !newSkill ||
      skills.some(
        (skill) =>
          skill.toLowerCase() === newSkill.toLowerCase()
      )
    ) {
      setSkillsInput("");
      return;
    }

    setSkills((previous) => [...previous, newSkill]);
    setSkillsInput("");
  };

  // REMOVE A SKILL
  const removeSkill = (skillToRemove) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
  };

  // SAVE PROFILE AND TEAM-MATCHING PROFILE
  const saveProfile = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in first.");
      return;
    }

    if (!name.trim() || !branch.trim() || !year.trim()) {
      alert("Please fill in your name, branch, and year.");
      return;
    }

    setSaving(true);

    try {
      const cleanedSkills = skills
        .map((skill) => skill.trim())
        .filter(Boolean);

      // Save the private account profile
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          branch: branch.trim(),
          year: year.trim(),
          location: location.trim(),
          availability: availability.trim(),
          skills: cleanedSkills,
          email: user.email,
        },
        { merge: true }
      );

      // Save a separate profile for team matching.
      // Do not include email in this public-facing document.
      await setDoc(
        doc(db, "teamProfiles", user.uid),
        {
          uid: user.uid,
          name: name.trim(),
          branch: branch.trim(),
          year: year.trim(),
          location: location.trim(),
          availability: availability.trim(),
          skills: cleanedSkills,
          interests: [],
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSkills(cleanedSkills);
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(
        "Unable to save your profile. Check your Firestore rules and browser console."
      );
    } finally {
      setSaving(false);
    }
  };

  // REMOVE A SAVED OPPORTUNITY
  const removeSavedEvent = async (eventId) => {
    const user = auth.currentUser;

    if (!user) return;

    try {
      await deleteDoc(doc(db, "savedEvents", eventId));

      setSavedEvents((previous) =>
        previous.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error("Error removing saved event:", error);
      alert("Unable to remove saved opportunity.");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 text-white sm:px-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="mt-2 text-slate-400">
          Manage your profile, skills, and saved opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* PROFILE CARD */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-7 lg:col-span-2">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-3xl font-bold text-slate-950">
              {name.trim().charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-2xl font-bold">
                {name || "Your Name"}
              </h2>
              <p className="mt-1 text-slate-400">
                {branch} · {year}
              </p>
            </div>
          </div>

          {/* PROFILE FIELDS */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Branch
              </label>
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Information Technology"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>Postgraduate</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={15} />
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <Clock size={15} />
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option>Weekdays</option>
                <option>Weekends</option>
                <option>Evenings</option>
                <option>Flexible</option>
              </select>
            </div>
          </div>

          {/* SKILLS */}
          <div className="mt-8">
            <label className="mb-3 flex items-center gap-2 text-sm text-slate-400">
              <Code2 size={16} />
              Skills
            </label>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                    className="font-bold text-emerald-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}

              {skills.length === 0 && (
                <p className="text-sm text-slate-500">
                  Add your skills below.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={skillsInput}
                onChange={(e) =>
                  setSkillsInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill (e.g. UI/UX)"
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={addSkill}
                className="rounded-xl border border-slate-700 px-5 py-3 font-medium hover:border-emerald-500 hover:text-emerald-400"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* SAVE */}
          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 size={18} />
            {saving
              ? "Saving..."
              : saved
              ? "Profile Saved!"
              : "Save Profile"}
          </button>

          <p className="mt-3 text-xs text-slate-500">
            Saving also updates the profile used for team matching.
          </p>
        </div>

        {/* ACCOUNT AND SUMMARY */}
        <div className="h-fit rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <User size={20} className="text-emerald-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                EMAIL
              </p>
              <p className="mt-1 truncate text-sm text-slate-200">
                {auth.currentUser?.email || "Not logged in"}
              </p>
            </div>
          </div>

          <div className="my-6 h-px bg-slate-800" />

          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Bookmark
                size={20}
                className="text-emerald-400"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                SAVED OPPORTUNITIES
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {savedEvents.length}
              </p>
            </div>
          </div>

          <div className="my-6 h-px bg-slate-800" />

          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Users size={20} className="text-emerald-400" />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                TEAM MATCHING
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Save your profile to become discoverable.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SAVED OPPORTUNITIES */}
      <div className="mt-10">
        <div className="mb-5 flex items-center gap-3">
          <Bookmark
            size={22}
            className="text-emerald-400"
          />
          <h2 className="text-2xl font-bold">
            Saved Opportunities
          </h2>
        </div>

        {loadingEvents ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading saved opportunities...
          </div>
        ) : savedEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <Bookmark
              size={35}
              className="mx-auto text-slate-700"
            />

            <p className="mt-4 text-slate-400">
              You haven't saved any opportunities yet.
            </p>

            <Link
              to="/discover"
              className="mt-5 inline-block rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Discover Opportunities
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {savedEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-500/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                      Saved
                    </span>

                    <h3 className="mt-4 break-words text-lg font-bold">
                      {event.title || "Untitled Opportunity"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {event.organizer || "Organizer not specified"}
                    </p>
                  </div>

                  <Bookmark
                    size={20}
                    className="shrink-0 text-emerald-400"
                    fill="currentColor"
                  />
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2
                    size={15}
                    className="text-emerald-400"
                  />
                  Saved to your profile
                </div>

                <div className="mt-5 flex gap-3">
                  <Link
                    to={`/event/${event.opportunityId}`}
                    className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => removeSavedEvent(event.id)}
                    className="flex items-center justify-center rounded-xl border border-slate-700 px-4 text-slate-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                    title="Remove saved opportunity"
                    aria-label="Remove saved opportunity"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}