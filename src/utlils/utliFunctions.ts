import Cookies from "js-cookie";

export const setToken = (key: string, token: string) => {
  try {
    // Attempt to use localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, token);
    } else {
      throw new Error("LocalStorage not available");
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.warn("Falling back to cookies:", error.message);
    Cookies.set(key, token, { secure: true, sameSite: "Strict" });
  }
};

export const getToken = (key: string) => {
  try {
    // Attempt to get token from localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(key);
    } else {
      throw new Error("LocalStorage not available");
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.warn("Falling back to cookies:", error?.message);
    return Cookies.get(key);
  }
};

export const removeToken = (key: string) => {
  try {
    // Attempt to remove token from localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(key);
    } else {
      throw new Error("LocalStorage not available");
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.warn("Falling back to cookies:", error?.message);
    Cookies.remove(key);
  }
};