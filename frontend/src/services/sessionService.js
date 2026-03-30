export async function sendSessionSnapshot(snapshot) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("http://localhost:8000/sessions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(snapshot),
    });

    if (!res.ok) console.error("Failed to send snapshot");
  } catch (err) {
    console.error("Error sending snapshot:", err);
  }
}