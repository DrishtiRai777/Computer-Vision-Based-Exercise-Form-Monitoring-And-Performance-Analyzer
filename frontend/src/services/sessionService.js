const feedbackSnapshots = [];

export async function sendSessionSnapshot(snapshot) {

  const token = localStorage.getItem("token");
  const isFinalSnapshot = snapshot.exercise !== undefined;

  if (!isFinalSnapshot) {
    feedbackSnapshots.push(snapshot);
    return;
  }

  // Final snapshot
  feedbackSnapshots.push(snapshot);


  try {
    const res = await fetch("http://localhost:8000/sessions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(feedbackSnapshots),
    });


    const data = await res.json();
    console.log("Response data:", data);

    if (!res.ok) {
      console.error("Failed request");
      return;
    }

    console.log("Snapshots sent successfully");

    // Clear
    feedbackSnapshots.length = 0;

  } catch (err) {
    console.error("Fetch error:", err);
  }
}