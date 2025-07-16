import * as admin from 'firebase-admin';

export const ROLES = {
  SOLO_RIA: 'solo_ria',
  SCALING_FIRM: 'scaling_firm',
  ADMIN: 'admin',
};

export const grantRole = async (uid: string, role: string) => {
  const user = await admin.auth().getUser(uid);
  const currentRoles = user.customClaims?.roles || [];
  if (!currentRoles.includes(role)) {
    return admin.auth().setCustomUserClaims(uid, { roles: [...currentRoles, role] });
  }
  return Promise.resolve();
};