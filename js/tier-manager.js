(function () {
  "use strict";

  /*
   * FIDELIS TIER MANAGER
   * ---------------------
   * Handles FREE / VVIP feature access.
   *
   * Important:
   * This is frontend feature-gating only.
   * Real payment/subscription verification must
   * eventually be handled by a secure backend.
   */

  const FREE_LIMITS = {
    imageEnhancement: true,
    videoEnhancement: false,
    ultra4x: false,
    fps60: false,
    fps120: false,
    batchProcessing: false,
    priorityProcessing: false,
    maxImageSizeMB: 10,
    maxVideoSizeMB: 50
  };

  const VVIP_LIMITS = {
    imageEnhancement: true,
    videoEnhancement: true,
    ultra4x: true,
    fps60: true,
    fps120: true,
    batchProcessing: true,
    priorityProcessing: true,
    maxImageSizeMB: 100,
    maxVideoSizeMB: 1000
  };

  let currentTier = "free";

  function normalizeTier(value) {
    const tier = String(value || "free").toLowerCase();

    if (
      tier === "vvip" ||
      tier === "premium" ||
      tier === "pro"
    ) {
      return "vvip";
    }

    return "free";
  }

  function setTier(tier) {
    currentTier = normalizeTier(tier);

    try {
      localStorage.setItem(
        "fidelis_tier",
        currentTier
      );
    } catch (e) {
      console.warn("[FIDELIS] Could not save tier:", e);
    }

    updateUI();

    return currentTier;
  }

  function loadTier() {
    let saved = "free";

    try {
      saved = localStorage.getItem("fidelis_tier") || "free";
    } catch (e) {
      console.warn("[FIDELIS] Could not read saved tier:", e);
    }

    currentTier = normalizeTier(saved);

    updateUI();

    return currentTier;
  }

  function isVVIP() {
    return currentTier === "vvip";
  }

  function getTier() {
    return currentTier;
  }

  function getLimits() {
    return isVVIP()
      ? { ...VVIP_LIMITS }
      : { ...FREE_LIMITS };
  }

  function canUse(feature) {
    const limits = getLimits();

    return limits[feature] === true;
  }

  function canProcessFile(file, type) {
    if (!file) {
      return {
        allowed: false,
        reason: "No file selected."
      };
    }

    const limits = getLimits();

    const sizeMB =
      file.size / (1024 * 1024);

    if (type === "image") {
      if (!limits.imageEnhancement) {
        return {
          allowed: false,
          reason: "Image enhancement is unavailable."
        };
      }

      if (sizeMB > limits.maxImageSizeMB) {
        return {
          allowed: false,
          reason:
            "This image is too large for your current plan."
        };
      }

      return {
        allowed: true,
        reason: ""
      };
    }

    if (type === "video") {
      if (!limits.videoEnhancement) {
        return {
          allowed: false,
          reason:
            "Video AI enhancement is a VVIP feature."
        };
      }

      if (sizeMB > limits.maxVideoSizeMB) {
        return {
          allowed: false,
          reason:
            "This video is too large for your current plan."
        };
      }

      return {
        allowed: true,
        reason: ""
      };
    }

    return {
      allowed: false,
      reason: "Unsupported media type."
    };
  }

  function canUseFPS(fps) {
    const value = Number(fps);

    if (value === 60) {
      return canUse("fps60");
    }

    if (value === 120) {
      return canUse("fps120");
    }

    return true;
  }

  function canUseQuality(quality) {
    const q = String(
      quality || "standard"
    ).toLowerCase();

    if (q === "ultra") {
      return canUse("ultra4x");
    }

    return true;
  }

  function requireVVIP(featureName) {
    if (isVVIP()) {
      return true;
    }

    const message =
      featureName
        ? `${featureName} is available for FIDELIS VVIP.`
        : "This feature is available for FIDELIS VVIP.";

    if (typeof window.FidelisAuth?.showLoginRequired === "function") {
      window.FidelisAuth.showLoginRequired();
    }

    showUpgradeMessage(message);

    return false;
  }

  function showUpgradeMessage(message) {
    const existing =
      document.getElementById(
        "fidelisUpgradeMessage"
      );

    if (existing) {
      existing.remove();
    }

    const box =
      document.createElement("div");

    box.id = "fidelisUpgradeMessage";

    box.style.cssText = `
      position:fixed;
      left:50%;
      bottom:24px;
      transform:translateX(-50%);
      z-index:9999;
      width:min(92%,420px);
      padding:16px 18px;
      border:1px solid rgba(255,255,255,.14);
      border-radius:14px;
      background:#111116;
      color:#f5f5f7;
      box-shadow:0 20px 60px rgba(0,0,0,.45);
      font-family:system-ui,sans-serif;
      font-size:13px;
      line-height:1.5;
      text-align:center;
    `;

    box.innerHTML = `
      <strong style="
        display:block;
        margin-bottom:5px;
        letter-spacing:1px;
      ">
        FIDELIS VVIP
      </strong>

      <span style="
        display:block;
        color:#a5a5b0;
      ">
        ${escapeHTML(message)}
      </span>

      <button
        id="fidelisUpgradeButton"
        type="button"
        style="
          margin-top:12px;
          width:100%;
          padding:10px 14px;
          border:0;
          border-radius:9px;
          background:#f5f5f7;
          color:#09090c;
          font-weight:800;
          cursor:pointer;
        "
      >
        View VVIP
      </button>
    `;

    document.body.appendChild(box);

    const button =
      document.getElementById(
        "fidelisUpgradeButton"
      );

    if (button) {
      button.onclick = function () {
        if (
          typeof window.FidelisTierManager
            ?.openUpgrade === "function"
        ) {
          window.FidelisTierManager.openUpgrade();
        }

        box.remove();
      };
    }

    setTimeout(() => {
      if (box.parentNode) {
        box.remove();
      }
    }, 7000);
  }

  function openUpgrade() {
    /*
     * Payment integration will be connected here later.
     *
     * DO NOT fake payment confirmation.
     */

    const message =
      document.createElement("div");

    message.id =
      "fidelisVvipInfo";

    message.style.cssText = `
      position:fixed;
      inset:0;
      z-index:10000;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(0,0,0,.72);
      backdrop-filter:blur(8px);
      font-family:system-ui,sans-serif;
    `;

    message.innerHTML = `
      <div style="
        width:min(100%,430px);
        padding:26px;
        border:1px solid #292932;
        border-radius:20px;
        background:#101014;
        color:#f5f5f7;
        box-shadow:0 25px 80px rgba(0,0,0,.55);
      ">
        <div style="
          color:#777783;
          font-size:10px;
          font-weight:900;
          letter-spacing:2px;
        ">
          FIDELIS
        </div>

        <h2 style="
          margin-top:8px;
          font-size:28px;
        ">
          VVIP
        </h2>

        <p style="
          margin-top:10px;
          color:#9999a4;
          line-height:1.6;
          font-size:13px;
        ">
          Premium AI enhancement features,
          higher limits, advanced video processing
          and up to 120 FPS are planned for the
          FIDELIS VVIP system.
        </p>

        <div style="
          margin-top:18px;
          padding:14px;
          border:1px solid #292932;
          border-radius:12px;
          color:#c7c7cf;
          font-size:12px;
          line-height:1.7;
        ">
          ✓ Ultra 4× AI<br>
          ✓ Advanced enhancement<br>
          ✓ 60 FPS<br>
          ✓ 120 FPS<br>
          ✓ Higher processing limits
        </div>

        <button
          id="fidelisCloseVvip"
          type="button"
          style="
            width:100%;
            margin-top:18px;
            padding:12px;
            border:0;
            border-radius:10px;
            background:#f5f5f7;
            color:#08080b;
            font-weight:900;
            cursor:pointer;
          "
        >
          Close
        </button>
      </div>
    `;

    document.body.appendChild(message);

    document.getElementById(
      "fidelisCloseVvip"
    ).onclick = function () {
      message.remove();
    };
  }

  function updateUI() {
    document
      .querySelectorAll(
        "[data-vvip-feature]"
      )
      .forEach(element => {
        const feature =
          element.dataset.vvipFeature;

        const unlocked =
          isVVIP();

        element.classList.toggle(
          "vvip-locked",
          !unlocked
        );

        element.dataset.locked =
          unlocked ? "false" : "true";

        if (!unlocked) {
          element.title =
            "Available with FIDELIS VVIP";
        }
      });

    document
      .querySelectorAll(
        "[data-tier-label]"
      )
      .forEach(element => {
        element.textContent =
          currentTier.toUpperCase();
      });
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /*
   * Development helper.
   *
   * This should NOT be considered secure VVIP verification.
   * It exists so the frontend can be tested before the real
   * authentication/subscription backend is connected.
   */
  function setDevelopmentTier(tier) {
    console.warn(
      "[FIDELIS] Development tier changed locally. " +
      "This is NOT secure subscription verification."
    );

    return setTier(tier);
  }

  window.FidelisTierManager = {
    setTier,
    loadTier,
    getTier,
    isVVIP,
    getLimits,
    canUse,
    canProcessFile,
    canUseFPS,
    canUseQuality,
    requireVVIP,
    openUpgrade,
    updateUI,

    // Development/testing only
    setDevelopmentTier
  };

  document.addEventListener(
    "DOMContentLoaded",
    loadTier
  );

})();
