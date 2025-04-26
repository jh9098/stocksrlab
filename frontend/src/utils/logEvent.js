// utils/logEvent.js
export const logUserEvent = (type, target = null) => {
  const user = auth.currentUser;
  console.log(`[로그 - ${type}]`, {
    uid: user?.uid || "anonymous",
    target,
    time: new Date().toISOString()
  });
};
