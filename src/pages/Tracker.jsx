import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import {
  collection,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Trophy,
  Users,
  ArrowRight,
  Bell,
  Sparkles,
} from "lucide-react";

const initialOpportunities = [
  {
    id: 1,
    title: "Genesis Hackathon 2026",
    organizer: "VESIT",
    deadline: "Oct 20, 2026",
    daysLeft: 12,
    status: "Team Formed",
    category: "Hackathon",
    progress: 50,
  },
  {
    id: 2,
    title: "GreenTech Innovation Challenge",
    organizer: "GreenTech",
    deadline: "Nov 5, 2026",
    daysLeft: 28,
    status: "Interested",
    category: "Competition",
    progress: 25,
  },
  {
    id: 3,
    title: "AI for Social Good Workshop",
    organizer: "Tech Community",
    deadline: "Oct 28, 2026",
    daysLeft: 20,
    status: "Applied",
    category: "Workshop",
    progress: 75,
  },
];

const statuses = [
  "Interested",
  "Team Formed",
  "Applied",
  "Result",
];

function Tracker() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOAD TRACKER DATA FROM FIREBASE
  useEffect(() => {
    const loadTracker = async () => {
      const user = auth.currentUser;

      if (!user) {
        setItems(initialOpportunities);
        setLoading(false);
        return;
      }

      try {
        const trackerRef = collection(
          db,
          "users",
          user.uid,
          "tracker"
        );

        const snapshot = await getDocs(trackerRef);

        if (snapshot.empty) {
          // First time user opens tracker
          // Save the sample opportunities to Firebase
          for (const opportunity of initialOpportunities) {
            await setDoc(
              doc(
                db,
                "users",
                user.uid,
                "tracker",
                String(opportunity.id)
              ),
              {
                ...opportunity,
                userId: user.uid,
              }
            );
          }

          setItems(initialOpportunities);
        } else {
          const firebaseItems = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: Number(doc.id),
          }));

          setItems(firebaseItems);
        }
      } catch (error) {
        console.error("Error loading tracker:", error);

        // If Firebase fails, still show the tracker
        setItems(initialOpportunities);
      }

      setLoading(false);
    };

    loadTracker();
  }, []);

  // MOVE OPPORTUNITY TO NEXT STATUS
  const moveStatus = async (id) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in first.");
      return;
    }

    const currentItem = items.find(
      (item) => item.id === id
    );

    if (!currentItem) return;

    const currentStatusIndex = statuses.indexOf(
      currentItem.status
    );

    if (currentStatusIndex === statuses.length - 1) {
      return;
    }

    const newStatus =
      statuses[currentStatusIndex + 1];

    const updatedItem = {
      ...currentItem,
      status: newStatus,
      progress: Math.min(
        100,
        currentItem.progress + 25
      ),
      updatedAt: new Date(),
    };

    // Update UI immediately
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? updatedItem : item
      )
    );

    // Save to Firebase
    try {
      await setDoc(
        doc(
          db,
          "users",
          user.uid,
          "tracker",
          String(id)
        ),
        {
          ...updatedItem,
          userId: user.uid,
        },
        { merge: true }
      );
    } catch (error) {
      console.error(
        "Error updating tracker:",
        error
      );

      alert("Unable to save tracker update.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Interested":
        return "text-slate-300 bg-slate-800";

      case "Team Formed":
        return "text-cyan-300 bg-cyan-500/10";

      case "Applied":
        return "text-purple-300 bg-purple-500/10";

      case "Result":
        return "text-emerald-300 bg-emerald-500/10";

      default:
        return "text-slate-300 bg-slate-800";
    }
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-8 py-10 text-white">
        <div className="mx-auto max-w-6xl">

          <div className="flex min-h-[60vh] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />

              <p className="text-slate-400">
                Loading your opportunities...
              </p>

            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-8 py-10 text-white">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-10">

          <div className="mb-3 flex items-center gap-2 text-emerald-400">

            <Sparkles size={20} />

            <span className="text-sm font-semibold tracking-wider">
              OPPORTUNITY TRACKER
            </span>

          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <h1 className="text-4xl font-bold">
                Track Your Opportunities
              </h1>

              <p className="mt-2 text-slate-400">
                Keep applications, teams and deadlines in one place.
              </p>

            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">

              <Bell size={17} />

              2 upcoming deadlines

            </div>

          </div>

        </div>


        {/* STATS */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Stat
            icon={<CalendarDays size={20} />}
            label="Tracked"
            value={items.length}
          />

          <Stat
            icon={<Users size={20} />}
            label="Teams Formed"
            value={
              items.filter(
                (item) =>
                  item.status === "Team Formed"
              ).length
            }
          />

          <Stat
            icon={<CheckCircle2 size={20} />}
            label="Applications"
            value={
              items.filter(
                (item) =>
                  item.status === "Applied"
              ).length
            }
          />

          <Stat
            icon={<Trophy size={20} />}
            label="Completed"
            value={
              items.filter(
                (item) =>
                  item.status === "Result"
              ).length
            }
          />

        </div>


        {/* TRACKED OPPORTUNITIES */}

        <div className="space-y-5">

          {items.map((item) => (

            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >

              {/* TOP */}

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                      {item.category}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                  </div>

                  <h2 className="mt-3 text-xl font-bold">
                    {item.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Organized by {item.organizer}
                  </p>

                </div>


                {/* DEADLINE */}

                <div className="rounded-xl bg-slate-950 px-5 py-4 text-right">

                  <div className="flex items-center justify-end gap-2 text-xs text-slate-500">

                    <CalendarDays size={14} />

                    Deadline

                  </div>

                  <p className="mt-1 font-semibold">
                    {item.deadline}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-orange-400">
                    {item.daysLeft} days left
                  </p>

                </div>

              </div>


              {/* PROGRESS */}

              <div className="mt-7">

                <div className="mb-2 flex justify-between text-xs">

                  <span className="text-slate-500">
                    Application progress
                  </span>

                  <span className="font-semibold text-emerald-400">
                    {item.progress}%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${item.progress}%`,
                    }}
                  />

                </div>

              </div>


              {/* PIPELINE */}

              <div className="mt-7 flex items-center">

                {statuses.map((status, index) => {

                  const currentIndex =
                    statuses.indexOf(
                      item.status
                    );

                  const completed =
                    index <= currentIndex;

                  return (
                    <div
                      key={status}
                      className="flex flex-1 items-center"
                    >

                      <div className="flex flex-col items-center">

                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            completed
                              ? "border-emerald-400 bg-emerald-500 text-slate-950"
                              : "border-slate-700 bg-slate-950 text-slate-600"
                          }`}
                        >

                          {completed ? (
                            <CheckCircle2 size={17} />
                          ) : (
                            <span className="text-xs">
                              {index + 1}
                            </span>
                          )}

                        </div>

                        <span
                          className={`mt-2 text-[10px] sm:text-xs ${
                            completed
                              ? "text-slate-300"
                              : "text-slate-600"
                          }`}
                        >
                          {status}
                        </span>

                      </div>

                      {index <
                        statuses.length - 1 && (
                        <div
                          className={`mx-2 h-px flex-1 ${
                            index <
                            currentIndex
                              ? "bg-emerald-500"
                              : "bg-slate-800"
                          }`}
                        />
                      )}

                    </div>
                  );

                })}

              </div>


              {/* ACTION */}

              {item.status !== "Result" && (

                <div className="mt-7 flex justify-end">

                  <button
                    onClick={() =>
                      moveStatus(item.id)
                    }
                    className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold transition hover:bg-emerald-500 hover:text-slate-950"
                  >

                    Move to{" "}

                    {
                      statuses[
                        statuses.indexOf(
                          item.status
                        ) + 1
                      ]
                    }

                    <ArrowRight size={16} />

                  </button>

                </div>

              )}


              {/* COMPLETED */}

              {item.status === "Result" && (

                <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/5 p-4 text-sm text-emerald-400">

                  <Trophy size={18} />

                  Application completed. Add your result when available.

                </div>

              )}

            </div>

          ))}

        </div>


        {/* DEADLINE ALERT */}

        <div className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">

          <div className="flex items-start gap-3">

            <Clock
              className="mt-0.5 text-orange-400"
              size={20}
            />

            <div>

              <h3 className="font-semibold text-orange-300">
                Deadline Alert
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Genesis Hackathon is approaching. Make sure your
                team and project submission are ready before the
                deadline.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


function Stat({ icon, label, value }) {

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-slate-800 p-3 text-emerald-400">
          {icon}
        </div>

        <div>

          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


export default Tracker;