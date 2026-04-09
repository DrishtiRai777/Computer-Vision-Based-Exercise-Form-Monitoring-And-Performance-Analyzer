export const loginWithGoogle = async (googleToken) => {
  const res = await fetch("https://exercise-kvpe.onrender.com/users/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: googleToken })
  });

  if (!res.ok) {
    throw new Error("Backend error");
  }

  const data = await res.json();

  if (!data.access_token) {
    throw new Error("No token received");
  }

  // store token
  localStorage.setItem("token", data.access_token);

  return data;
};