
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";

import {
  Heart,
  X,
  Sparkles,
  MapPin,
  Clock,
  RotateCcw,
  MessageCircle,
  Send,
  ArrowLeft,
  Lightbulb,
  Plus,
  ThumbsUp,
  Users,
  RefreshCw,
} from "lucide-react";

function TeamMatch() {
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [liking, setLiking] = useState(false);
  const [likeMessage, setLikeMessage] = useState("");
  const [isMutualMatch, setIsMutualMatch] = useState(false);
  const [showMatch, setShowMatch] = useState(false);

  const [view, setView] = useState("swipe");
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatError, setChatError] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [ideaText, setIdeaText] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);

  const [ideas, setIdeas] = useState([
    { id: 1, title: "AI-powered campus sustainability", votes: 1 },
    { id: 2, title: "Smart public transport solution", votes: 0 },
    { id: 3, title: "Healthcare accessibility platform", votes: 0 },
  ]);

  const current = teammates[currentIndex];

  // LOAD STUDENT PROFILES
  const loadTeammates = async (user) => {
    setLoading(true);
    setLoadError("");

    try {
      if (!user) {
        setTeammates([]);
        setLoadError("Please log in to find teammates.");
        return;
      }

      const snapshot = await getDocs(collection(db, "teamProfiles"));

      const profiles = snapshot.docs
        .map((profileDoc) => ({
          uid: profileDoc.id,
          ...profileDoc.data(),
        }))
        .filter((profile) => profile.uid !== user.uid && profile.name)
        .map((profile) => ({
          uid: profile.uid,
          name: profile.name || "Student",
          branch: profile.branch || "Branch not specified",
          year: profile.year || "Year not specified",
          location: profile.location || "Location not specified",
          availability: profile.availability || "Flexible availability",
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          interests: Array.isArray(profile.interests) ? profile.interests : [],
          lookingFor: Array.isArray(profile.lookingFor) ? profile.lookingFor : [],
          bio: profile.bio || "",
        }));

      setTeammates(profiles);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Error loading team profiles:", error);
      setLoadError(
        error.code === "permission-denied"
          ? "Firebase denied access to student profiles. Check your Firestore rules."
          : "Unable to load student profiles. Check your Firestore rules and connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // WAIT FOR AUTHENTICATION
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      loadTeammates(user);
    });

    return () => unsubscribe();
  }, []);

  // OPEN A VERIFIED MATCH
  const openMatchedChat = (student, matchId) => {
    setActiveChat({ ...student, matchId });
    setMessages([]);
    setMessageText("");
    setChatError("");
    setShowMatch(false);
    setIsMutualMatch(true);
    setView("chat");
  };

  // LIKE A STUDENT AND CHECK FOR A MUTUAL MATCH
  const sendLike = async () => {
    const user = auth.currentUser;
    const student = current;

    if (!user || !student || liking) return;

    setLiking(true);
    setLikeMessage("");
    setChatError("");

    try {
      const myLikeId = `${user.uid}_${student.uid}`;
      const theirLikeId = `${student.uid}_${user.uid}`;

      const myLikeRef = doc(db, "likes", myLikeId);
      const theirLikeRef = doc(db, "likes", theirLikeId);

      const participantUids = [user.uid, student.uid].sort();
      const matchId = participantUids.join("_");
      const matchRef = doc(db, "matches", matchId);

      // Save our like if it doesn't already exist.
      const myLikeSnapshot = await getDoc(myLikeRef);

      if (!myLikeSnapshot.exists()) {
        await setDoc(myLikeRef, {
          senderUid: user.uid,
          recipientUid: student.uid,
          createdAt: serverTimestamp(),
        });
      }

      // Check both the reverse like and the existing match.
      const [reverseLikeSnapshot, matchSnapshot] = await Promise.all([
        getDoc(theirLikeRef),
        getDoc(matchRef),
      ]);

      const hasReverseLike = reverseLikeSnapshot.exists();
      const hasExistingMatch = matchSnapshot.exists();

      if (!hasReverseLike && !hasExistingMatch) {
        setIsMutualMatch(false);
        setLikeMessage(
          `Your like has been saved. You'll match if ${student.name} likes you back.`
        );
        setShowMatch(true);
        return;
      }

      // Validate the other student's like, if present.
      if (hasReverseLike) {
        const reverseData = reverseLikeSnapshot.data();

        if (
          reverseData.senderUid !== student.uid ||
          reverseData.recipientUid !== user.uid
        ) {
          throw new Error("The reverse like data is invalid.");
        }
      }

      // Validate an existing match before using it.
      if (hasExistingMatch) {
        const savedParticipants =
          matchSnapshot.data().participantUids || [];

        if (
          savedParticipants.length !== 2 ||
          !savedParticipants.includes(user.uid) ||
          !savedParticipants.includes(student.uid)
        ) {
          throw new Error(
            "The existing match has invalid participant details."
          );
        }
      } else {
        // A reverse like exists, so create the shared match.
        await setDoc(matchRef, {
          participantUids,
          createdAt: serverTimestamp(),
        });
      }

      // Open the chat only after the match is confirmed.
      openMatchedChat(student, matchId);
    } catch (error) {
      console.error("Error sending like or opening match:", error);

      setIsMutualMatch(false);
      setLikeMessage(
        error.code === "permission-denied"
          ? "Firebase denied this action. Check your Firestore rules for likes and matches."
          : error.message || "Unable to complete the match. Please try again."
      );
      setShowMatch(true);
    } finally {
      setLiking(false);
    }
  };

  // MOVE TO THE NEXT PROFILE
  const nextCard = () => {
    setDragX(0);
    setStartX(null);
    setIsDragging(false);
    setShowMatch(false);
    setLikeMessage("");
    setIsMutualMatch(false);

    if (teammates.length > 0) {
      setCurrentIndex((previous) => (previous + 1) % teammates.length);
    }
  };

  // SWIPE HANDLERS
  const handleStart = (clientX) => {
    if (!current || showMatch || liking) return;
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX) => {
    if (!isDragging || startX === null) return;
    setDragX(clientX - startX);
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const finalDragX = dragX;
    setIsDragging(false);
    setStartX(null);

    if (finalDragX > 120) {
      setDragX(0);
      sendLike();
    } else if (finalDragX < -120) {
      nextCard();
    } else {
      setDragX(0);
    }
  };

  const handleMouseDown = (event) => handleStart(event.clientX);
  const handleMouseMove = (event) => handleMove(event.clientX);
  const handleMouseUp = () => handleEnd();
  const handleTouchStart = (event) => handleStart(event.touches[0].clientX);
  const handleTouchMove = (event) => handleMove(event.touches[0].clientX);
  const handleTouchEnd = () => handleEnd();

  // OPEN CHAT FROM THE CURRENT PROFILE
  const startChat = async () => {
    const user = auth.currentUser;
    const student = current;

    if (!user || !student) return;

    setChatError("");

    try {
      const participantUids = [user.uid, student.uid].sort();
      const matchId = participantUids.join("_");

      const matchSnapshot = await getDoc(doc(db, "matches", matchId));

      if (!matchSnapshot.exists()) {
        setChatError(
          "You can chat only after both students have liked each other."
        );
        return;
      }

      const savedParticipants =
        matchSnapshot.data().participantUids || [];

      if (
        savedParticipants.length !== 2 ||
        !savedParticipants.includes(user.uid) ||
        !savedParticipants.includes(student.uid)
      ) {
        setChatError("You do not have access to this conversation.");
        return;
      }

      openMatchedChat(student, matchId);
    } catch (error) {
      console.error("Error opening chat:", error);

      setChatError(
        error.code === "permission-denied"
          ? "Firebase denied access to this match. Check your Firestore rules."
          : "Couldn't open the chat. Please try again."
      );
    }
  };

  // REAL-TIME CHAT LISTENER
  useEffect(() => {
    if (view !== "chat" || !activeChat?.matchId) return undefined;

    const messagesQuery = query(
      collection(db, "matches", activeChat.matchId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const currentUid = auth.currentUser?.uid;

        const loadedMessages = snapshot.docs.map((messageDoc) => {
          const data = messageDoc.data();

          return {
            id: messageDoc.id,
            from: data.senderUid === currentUid ? "me" : "them",
            text: data.text || "",
          };
        });

        setMessages(loadedMessages);
        setChatError("");
      },
      (error) => {
        console.error("Error listening to chat:", error);

        setChatError(
          error.code === "permission-denied"
            ? "You don't have permission to read this chat. Check your Firestore rules."
            : "Couldn't load messages. Check your connection and try again."
        );
      }
    );

    return () => unsubscribe();
  }, [view, activeChat?.matchId]);

  // SEND A MESSAGE
  const sendMessage = async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    const text = messageText.trim();

    if (!user || !activeChat?.matchId || !text || sendingMessage) return;

    if (text.length > 2000) {
      setChatError("Messages must be 2000 characters or fewer.");
      return;
    }

    setSendingMessage(true);
    setChatError("");

    try {
      await addDoc(
        collection(db, "matches", activeChat.matchId, "messages"),
        {
          senderUid: user.uid,
          text,
          createdAt: serverTimestamp(),
        }
      );

      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);

      setChatError(
        error.code === "permission-denied"
          ? "Firebase denied this message. Check your Firestore chat rules."
          : "Message not sent. Please try again."
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // ADD A PROBLEM STATEMENT (LOCAL DEMO)
  const addIdea = (event) => {
    event.preventDefault();
    const title = ideaText.trim();

    if (!title) return;

    setIdeas((previous) => [
      ...previous,
      { id: Date.now(), title, votes: 0 },
    ]);

    setIdeaText("");
  };

  // VOTE FOR A PROBLEM STATEMENT (LOCAL DEMO)
  const voteForIdea = (ideaId) => {
    setIdeas((previous) =>
      previous.map((idea) => {
        if (idea.id === selectedIdeaId) {
          return { ...idea, votes: Math.max(0, idea.votes - 1) };
        }

        if (idea.id === ideaId) {
          return { ...idea, votes: idea.votes + 1 };
        }

        return idea;
      })
    );

    setSelectedIdeaId(ideaId === selectedIdeaId ? null : ideaId);
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <RefreshCw
            size={35}
            className="mx-auto animate-spin text-emerald-400"
          />
          <h2 className="mt-5 text-xl font-bold">
            Finding your teammates...
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Loading student profiles from Firebase.
          </p>
        </div>
      </div>
    );
  }

  // ERROR OR EMPTY STATE
  if (loadError || teammates.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Users size={30} className="text-emerald-400" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {loadError ? "Couldn't load profiles" : "No teammates yet"}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {loadError ||
              "No other students have published their team-matching profiles yet. Ask your friends to log in, complete their profiles, and click Save Profile."}
          </p>

          <button
            onClick={() => loadTeammates(auth.currentUser)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // CHAT + PROBLEM STATEMENT WORKSPACE
  if (view === "chat" && activeChat) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => {
              setView("swipe");
              setChatError("");
            }}
            className="mb-5 flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={19} />
            Back to matching
          </button>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* REAL-TIME CHAT */}
            <section className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 lg:col-span-3">
              <div className="flex items-center gap-3 border-b border-slate-800 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xl font-bold text-slate-950">
                  {(activeChat.name || "S").charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-bold">{activeChat.name}</h2>
                  <p className="text-xs text-slate-400">
                    {activeChat.branch} · Team workspace
                  </p>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Live chat
                </span>
              </div>

              <div className="border-b border-slate-800 bg-emerald-500/5 px-5 py-3 text-xs text-slate-400">
                <Sparkles
                  size={14}
                  className="mr-2 inline text-emerald-400"
                />
                Messages sync through Firebase in real time.
              </div>

              {chatError && (
                <div
                  role="alert"
                  className="mx-4 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {chatError}
                </div>
              )}

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.length === 0 && !chatError && (
                  <div className="py-12 text-center">
                    <MessageCircle
                      size={32}
                      className="mx-auto text-slate-600"
                    />
                    <p className="mt-3 text-sm text-slate-400">
                      No messages yet. Start the conversation!
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Your messages will appear here automatically.
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.from === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.from === "me"
                          ? "rounded-br-sm bg-emerald-500 text-slate-950"
                          : "rounded-bl-sm bg-slate-800 text-slate-200"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={sendMessage}
                className="flex gap-2 border-t border-slate-800 p-4"
              >
                <input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Discuss your idea..."
                  maxLength={2000}
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={sendingMessage || !messageText.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <RefreshCw size={19} className="animate-spin" />
                  ) : (
                    <Send size={19} />
                  )}
                </button>
              </form>
            </section>

            {/* PROBLEM STATEMENT WORKSPACE */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                  <Lightbulb size={23} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Choose your PS</h2>
                  <p className="text-xs text-slate-400">
                    Problem statement workspace
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Suggest a project direction and vote for the idea you want to build.
              </p>

              <form onSubmit={addIdea} className="mt-5 flex gap-2">
                <input
                  value={ideaText}
                  onChange={(event) => setIdeaText(event.target.value)}
                  placeholder="Suggest a problem statement..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-xs outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  aria-label="Add idea"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                >
                  <Plus size={20} />
                </button>
              </form>

              <div className="mt-5 space-y-3">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`rounded-2xl border p-4 transition ${
                      selectedIdeaId === idea.id
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-slate-700 bg-slate-950/60"
                    }`}
                  >
                    <p className="text-sm font-medium leading-relaxed">
                      {idea.title}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {idea.votes} {idea.votes === 1 ? "vote" : "votes"}
                      </span>
                      <button
                        type="button"
                        onClick={() => voteForIdea(idea.id)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                          selectedIdeaId === idea.id
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        <ThumbsUp size={14} />
                        {selectedIdeaId === idea.id ? "Voted" : "Vote"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-700 p-4">
                <p className="text-xs leading-relaxed text-slate-400">
                  <Sparkles
                    size={14}
                    className="mr-1 inline text-emerald-400"
                  />
                  Choose a problem that fits your combined skills and can be
                  prototyped during a hackathon.
                </p>
              </div>

              <p className="mt-4 text-center text-xs text-slate-600">
                Demo workspace · Changes are not shared with other users.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  const rotation = dragX / 15;

  // SWIPE CARDS
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-emerald-400">
            <Sparkles size={20} />
            <span className="text-sm font-semibold tracking-wider">
              AI TEAM MATCHING
            </span>
          </div>

          <h1 className="text-4xl font-bold">Find Your Team</h1>
          <p className="mt-2 text-slate-400">
            Discover real student profiles and find potential teammates.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Profile {currentIndex + 1} of {teammates.length}
          </p>
        </div>

        <div className="relative mx-auto h-[600px] w-full max-w-md">
          <div className="absolute inset-0 scale-[0.96] rounded-3xl border border-slate-800 bg-slate-900 opacity-60" />

          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDragging) handleEnd();
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDragStart={(event) => event.preventDefault()}
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.3s ease",
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "pan-y",
            }}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl select-none"
          >
            {dragX > 40 && (
              <div className="absolute left-6 top-8 z-20 rotate-[-12deg] rounded-xl border-4 border-emerald-400 px-5 py-2 text-2xl font-bold text-emerald-400">
                LIKE
              </div>
            )}

            {dragX < -40 && (
              <div className="absolute right-6 top-8 z-20 rotate-[12deg] rounded-xl border-4 border-red-400 px-5 py-2 text-2xl font-bold text-red-400">
                PASS
              </div>
            )}

            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-500/20 to-transparent" />

            <div className="relative p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-3xl font-bold text-slate-950 sm:h-24 sm:w-24">
                  {(current.name || "S").charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-bold sm:text-3xl">
                    {current.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {current.year} · {current.branch}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    <Users size={14} />
                    Student profile
                  </div>
                </div>
              </div>

              {current.bio && (
                <p className="mt-7 text-sm leading-relaxed text-slate-300">
                  {current.bio}
                </p>
              )}

              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <Sparkles size={16} />
                  Team up
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Explore this student's skills and availability to see if you
                  could work well together.
                </p>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {current.skills.length > 0 ? (
                    current.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-300"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      No skills added yet
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Interests
                </p>
                <div className="flex flex-wrap gap-2">
                  {current.interests.length > 0 ? (
                    current.interests.map((interest, index) => (
                      <span
                        key={`${interest}-${index}`}
                        className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      No interests added yet
                    </span>
                  )}
                </div>
              </div>

              {current.lookingFor.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Looking for
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {current.lookingFor.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-5 border-t border-slate-800 pt-5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock size={15} />
                  {current.availability}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} />
                  {current.location}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SWIPE CONTROLS */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">Drag the card left or right</p>

          <div className="mt-4 flex justify-center gap-6">
            <button
              onClick={nextCard}
              aria-label="Skip student"
              disabled={liking}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-red-400 transition hover:scale-110 hover:border-red-400 disabled:opacity-50"
            >
              <X size={25} />
            </button>

            <button
              onClick={sendLike}
              aria-label="Like student"
              disabled={liking}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {liking ? (
                <RefreshCw size={23} className="animate-spin" />
              ) : (
                <Heart size={24} fill="currentColor" />
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
            <RotateCcw size={13} />
            Swipe right to like · Swipe left to pass
          </div>

          <button
            onClick={() => loadTeammates(auth.currentUser)}
            className="mt-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400"
          >
            <RefreshCw size={14} />
            Refresh profiles
          </button>
        </div>
      </div>

      {/* LIKE AND MATCH CONFIRMATION */}
      {showMatch && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-4xl">
              {isMutualMatch ? "💚" : "💌"}
            </div>

            <h2 className="mt-5 text-3xl font-bold">
              {isMutualMatch ? "It's a Match!" : "Like Sent!"}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {likeMessage}
            </p>

            {!isMutualMatch && (
              <div className="mt-6 rounded-2xl bg-slate-800 p-4 text-left">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles size={16} className="text-emerald-400" />
                  Conversation starter
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Hey {current.name}! What kind of hackathon project would you
                  like to build?
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {isMutualMatch && (
                <button
                  onClick={startChat}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  <MessageCircle size={17} />
                  Open Live Chat
                </button>
              )}

              <button
                onClick={nextCard}
                className="w-full rounded-xl border border-slate-700 py-3 font-semibold hover:bg-slate-800"
              >
                Keep Swiping
              </button>
            </div>

            {chatError && (
              <p role="alert" className="mt-4 text-sm text-red-300">
                {chatError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamMatch;