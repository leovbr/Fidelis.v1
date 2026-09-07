(function () {
  "use strict";

  function checkImage(file, quality) {
    const result =
      FidelisTierManager.checkFile(
        file,
        "image"
      );

    if (!result.allowed) {
      return result;
    }

    if (
      !FidelisTierManager.canUseQuality(
        quality
      )
    ) {
      return {
        allowed: false,
        reason:
          "Ultra 4× enhancement requires FIDELIS VVIP."
      };
    }

    return {
      allowed: true,
      reason: ""
    };
  }

  function checkVideo(file) {
    return FidelisTierManager.checkFile(
      file,
      "video"
    );
  }

  function checkFPS(fps) {
    if (
      !FidelisTierManager.canUseFPS(fps)
    ) {
      return {
        allowed: false,
        reason:
          `${fps} FPS processing requires FIDELIS VVIP.`
      };
    }

    return {
      allowed: true,
      reason: ""
    };
  }

  function requireVVIP(message) {
    if (
      FidelisTierManager.isVVIP()
    ) {
      return true;
    }

    if (
      window.FidelisUpgradeUI
    ) {
      FidelisUpgradeUI.open();
    }

    if (message) {
      console.warn(
        "[FIDELIS]",
        message
      );
    }

    return false;
  }

  window.FidelisProcessingGuard = {
    checkImage,
    checkVideo,
    checkFPS,
    requireVVIP
  };
})();
