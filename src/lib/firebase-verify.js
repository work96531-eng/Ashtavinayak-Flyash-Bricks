// Server-side Firebase token verification using Firebase REST API
// No service account needed — uses the Web API key
export async function verifyFirebaseToken(idToken) {
  const apiKey = "AIzaSyDPdr3rnb3euBVlNNfMakj1ZAZ1RdOQ4cw";
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.users || data.users.length === 0) return null;
    const user = data.users[0];
    return { uid: user.localId, email: user.email };
  } catch {
    return null;
  }
}
