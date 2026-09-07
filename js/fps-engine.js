(function () {
  "use strict";

  const TARGETS = [60, 120];

  function supported(fps) {
    return TARGETS.includes(
      Number(fps)
    );
  }

  function check(fps) {
    fps = Number(fps);

    if (!supported(fps)) {
      return {
        allowed: false,
        reason:
          "Unsupported target FPS."
      };
    }

    if (
      !FidelisTierManager.canUseFPS(
        fps
      )
    ) {
      return {
        allowed: false,
        reason:
          `${fps} FPS requires FIDELIS VVIP.`
      };
    }

    return {
      allowed: true,
      reason: ""
    };
  }

  async function interpolate(
    frames,
    sourceFPS,
    targetFPS
  ) {
    const result =
      check(targetFPS);

    if (!result.allowed) {
      throw new Error(
        result.reason
      );
    }

    /*
     * Real interpolation requires a temporal
     * frame-interpolation model.
     *
     * We intentionally do not duplicate frames
     * and call that AI interpolation.
     */

    throw new Error(
      "Real AI frame interpolation model is not installed yet."
    );
  }

  function getTargets() {
    return [...TARGETS];
  }

  window.FidelisFPSEngine = {
    supported,
    check,
    interpolate,
    getTargets
  };
})();
