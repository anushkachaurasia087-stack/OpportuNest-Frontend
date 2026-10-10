export async function askAI(prompt) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "AI request failed"
    );
  }

  return data.result;
}