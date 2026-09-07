(function () {
  "use strict";

  function getUser() {
    try {
      if (
        window.FidelisAuth &&
        typeof FidelisAuth.getUser ===
          "function"
      ) {
        return FidelisAuth.getUser();
      }
    } catch {}

    return null;
  }

  function getName() {
    const user = getUser();

    if (!user) {
      return "Guest";
    }

    return (
      user.name ||
      user.username ||
      user.email ||
      "User"
    );
  }

  function getEmail() {
    const user = getUser();

    if (!user) {
      return "";
    }

    return user.email || "";
  }

  function render() {
    document
      .querySelectorAll("[data-profile-name]")
      .forEach(el => {
        el.textContent = getName();
      });

    document
      .querySelectorAll("[data-profile-email]")
      .forEach(el => {
        el.textContent = getEmail();
      });

    document
      .querySelectorAll("[data-profile-tier]")
      .forEach(el => {
        el.textContent =
          FidelisTierManager
            .getTier()
            .toUpperCase();
      });
  }

  function init() {
    render();

    window.addEventListener(
      "fidelis:tierchange",
      render
    );

    window.addEventListener(
      "fidelis:authchange",
      render
    );
  }

  window.FidelisProfileUI = {
    getUser,
    getName,
    getEmail,
    render,
    init
  };
})();
