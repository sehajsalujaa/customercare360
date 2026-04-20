const ROLE_PRIORITY = [
  "ROLE_ADMIN",
  "ROLE_AGENT",
  "ROLE_BILLING_ANALYST",
  "ROLE_FIELD_COORDINATOR",
  "ROLE_CUSTOMER",
];

function pickPrimaryRole(roles = []) {
  if (!Array.isArray(roles) || roles.length === 0) return null;
  return ROLE_PRIORITY.find((r) => roles.includes(r)) || roles[0];
}

export const getUserRole = () => {
  const token = localStorage.getItem("cc360_access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return pickPrimaryRole(payload.roles || []);
  } catch (e) {
    return null;
  }
};

export const getUserEmail = () => {
  const token = localStorage.getItem("cc360_access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub; // email
  } catch (e) {
    return null;
  }
};
 
export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("cc360_user")); } catch { return null; }
}