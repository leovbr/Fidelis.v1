(function () {
  "use strict";

  const FREE = {
    imageEnhancement: true,
    videoEnhancement: false,
    ultra4x: false,
    fps60: false,
    fps120: false,
    batchProcessing: false,
    maxImageSizeMB: 10,
    maxVideoSizeMB: 50
  };

  const VVIP = {
    imageEnhancement: true,
    videoEnhancement: true,
    ultra4x: true,
    fps60: true,
    fps120: true,
    batchProcessing: true,
    maxImageSizeMB: 100,
    maxVideoSizeMB: 1000
  };

  let tier = "free";

  function normalize(value) {
    value = String(value || "free").toLowerCase();

    if (
      value === "vvip" ||
      value === "premium" ||
      value === "pro"
    ) {
      return "vvip";
    }

    return "free";
  }

  function loadTier() {
    try {
      tier = normalize(
        localStorage.getItem("fidelis_tier")
      );
    } catch {
      tier = "free";
    }

    updateUI();
    return tier;
  }

  function setTier(value) {
    tier = normalize(value);

    try {
      localStorage.setItem(
        "fidelis_tier",
        tier
      );
    } catch {}

    updateUI();

    window.dispatchEvent(
      new CustomEvent("fidelis:tierchange", {
        detail: { tier }
      })
    );

    return tier;
  }

  function getTier() {
    return tier;
  }

  function isVVIP() {
    return tier === "vvip";
  }

  function getLimits() {
    return {
      ...(isVVIP() ? VVIP : FREE)
    };
  }

  function canUse(feature) {
    return getLimits()[feature] === true;
  }

  function canUseQuality(quality) {
    if (
      String(quality).toLowerCase() === "ultra"
    ) {
      return canUse("ultra4x");
    }

    return true;
  }

  function canUseFPS(fps) {
    fps = Number(fps);

    if (fps === 60) {
      return canUse("fps60");
    }

    if (fps === 120) {
      return canUse("fps120");
    }

    return true;
  }

  function checkFile(file, type) {
    if (!file) {
      return {
        allowed: false,
        reason: "No file selected."
      };
    }

    const limits = getLimits();
    const sizeMB =
      file.size / 1024 / 1024;

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
            `Image exceeds ${limits.maxImageSizeMB} MB limit.`
        };
      }
    }

    if (type === "video") {
      if (!limits.videoEnhancement) {
        return {
          allowed: false,
          reason:
            "Video AI enhancement requires FIDELIS VVIP."
        };
      }

      if (sizeMB > limits.maxVideoSizeMB) {
        return {
          allowed: false,
          reason:
            `Video exceeds ${limits.maxVideoSizeMB} MB limit.`
        };
      }
    }

    return {
      allowed: true,
      reason: ""
    };
  }

  function updateUI() {
    document
      .querySelectorAll("[data-tier-label]")
      .forEach(el => {
        el.textContent =
          tier.toUpperCase();
      });

    document
      .querySelectorAll("[data-vvip-feature]")
      .forEach(el => {
        el.dataset.locked =
          isVVIP() ? "false" : "true";
      });
  }

  function developmentSet(value) {
    console.warn(
      "[FIDELIS] Development tier only."
    );

    return setTier(value);
  }

  window.FidelisTierManager = {
    loadTier,
    setTier,
    getTier,
    isVVIP,
    getLimits,
    canUse,
    canUseQuality,
    canUseFPS,
    checkFile,
    updateUI,
    developmentSet
  };
})();
