(function () {
  "use strict";

  const PREFIX = "fidelis:";

  function set(key, value) {
    try {
      localStorage.setItem(
        PREFIX + key,
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.warn(
        "[FIDELIS Storage]",
        error
      );

      return false;
    }
  }

  function get(key, fallback = null) {
    try {
      const value =
        localStorage.getItem(
          PREFIX + key
        );

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(
        PREFIX + key
      );
    } catch {}
  }

  function clear() {
    try {
      Object.keys(localStorage)
        .filter(key =>
          key.startsWith(PREFIX)
        )
        .forEach(key =>
          localStorage.removeItem(key)
        );
    } catch {}
  }

  function setJSON(key, value) {
    return set(key, value);
  }

  function getJSON(key, fallback) {
    return get(key, fallback);
  }

  window.FidelisStorage = {
    set,
    get,
    remove,
    clear,
    setJSON,
    getJSON
  };
})();
