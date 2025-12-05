import { supaUrl } from "../constants/supabase";
const getFunctionsBase = () => `${supaUrl}/functions/v1`;

export const requestResetCode = async (email) => {
  try {
    const base = getFunctionsBase();
    const res = await fetch(`${base}/send-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const confirmResetWithCode = async (email, code, newPassword) => {
  try {
    const base = getFunctionsBase();
    const res = await fetch(`${base}/confirm-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
