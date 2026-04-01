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
    console.log("Backend response:", data); 

    if (!res.ok) {
      console.error("Failed request");
      return null;
    }

    return data;

  } catch (err) {
    console.error("Fetch error:", err);
  }
}