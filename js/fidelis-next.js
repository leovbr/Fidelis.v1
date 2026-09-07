(function () {
  "use strict";

  const FILES = [
    "tier-manager.js",
    "storage.js",
    "history.js",
    "upgrade-ui.js",
    "profile-ui.js",
    "processing-guard.js",
    "video-ai.js",
    "fps-engine.js"
  ];

  function getBasePath() {
    const current =
      document.currentScript;

    if (current && current.src) {
      return current.src
        .substring(
          0,
          current.src.lastIndexOf("/") + 1
        );
    }

    return new URL(
      "./",
      window.location.href
    ).href;
  }

  function loadScript(src) {
    return new Promise(
      (resolve, reject) => {
        const existing =
          document.querySelector(
            `script[src="${src}"]`
          );

        if (existing) {
          resolve();
          return;
        }

        const script =
          document.createElement("script");

        script.src = src;
        script.async = false;

        script.onload = resolve;

        script.onerror = () =>
          reject(
            new Error(
              "Failed to load: " + src
            )
          );

        document.head.appendChild(
          script
        );
      }
    );
  }

  async function loadAll() {
    const base =
      getBasePath();

    for (const file of FILES) {
      await loadScript(
        base + file
      );
    }
  }

  function showError(message) {
    console.error(
      "[FIDELIS NEXT]",
      message
    );

    const box =
      document.getElementById(
        "errorBox"
      );

    if (box) {
      box.textContent =
        "FIDELIS system error: " +
        message;

      box.classList.remove(
        "hidden"
      );
    }
  }

  function status(text, percent) {
    const statusBox =
      document.getElementById(
        "status"
      );

    const statusText =
      document.getElementById(
        "statusText"
      );

    const statusPercent =
      document.getElementById(
        "statusPercent"
      );

    const progress =
      document.getElementById(
        "progressBar"
      );

    if (statusBox) {
      statusBox.classList.remove(
        "hidden"
      );
    }

    if (statusText) {
      statusText.textContent =
        text;
    }

    if (statusPercent) {
      statusPercent.textContent =
        Math.round(percent) + "%";
    }

    if (progress) {
      progress.style.width =
        percent + "%";
    }
  }

  function wireQuality() {
    document
      .querySelectorAll(".quality")
      .forEach(button => {

        button.addEventListener(
          "click",
          function () {

            const quality =
              this.dataset.quality;

            if (
              quality === "ultra" &&
              !FidelisTierManager.isVVIP()
            ) {
              FidelisUpgradeUI.open();
            }

          }
        );
      });
  }

  function wireUpgradeButtons() {
    document
      .querySelectorAll(
        "[data-upgrade]"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            FidelisUpgradeUI.open();
          }
        );
      });
  }

  function wireTier() {
    FidelisTierManager.loadTier();

    window.addEventListener(
      "fidelis:tierchange",
      event => {
        console.log(
          "[FIDELIS] Tier:",
          event.detail.tier
        );

        FidelisTierManager.updateUI();
        FidelisProfileUI.render();
      }
    );
  }

  function wireHistory() {
    window.addEventListener(
      "fidelis:historychange",
      event => {
        console.log(
          "[FIDELIS] History updated:",
          event.detail
        );
      }
    );
  }

  function wireProfile() {
    FidelisProfileUI.init();
  }

  async function initialize() {
    try {
      await loadAll();

      wireTier();
      wireQuality();
      wireUpgradeButtons();
      wireHistory();
      wireProfile();

      window.FidelisNext = {
        ready: true,
        version: "1.1.0",
        tier:
          FidelisTierManager.getTier()
      };

      window.dispatchEvent(
        new CustomEvent(
          "fidelis:ready"
        )
      );

      console.log(
        "%cFIDELIS NEXT READY",
        "font-weight:900"
      );

    } catch (error) {
      showError(
        error.message ||
        String(error)
      );
    }
  }

  initialize();

})();
