export async function requestBrowserNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export async function notifyUser(title, body) {
  if (!("Notification" in window)) return false;

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;

  if (permission !== "granted") return false;
  new Notification(title, {
    body,
    icon: "/favicon.svg",
    badge: "/favicon.svg",
  });
  return true;
}

export function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ error: "Geolocation is not supported by this browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) => resolve({ error: error.message }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
