(function () {
  "use strict";

  async function enhanceFrame(
    video,
    canvas,
    quality,
    progress
  ) {
    const ctx =
      canvas.getContext("2d", {
        willReadFrequently: true
      });

    const width =
      video.videoWidth;

    const height =
      video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    const imageData =
      ctx.getImageData(
        0,
        0,
        width,
        height
      );

    return FidelisAIEngine.enhance(
      imageData,
      quality,
      progress
    );
  }

  async function inspect(file) {
    if (
      !file ||
      !file.type.startsWith("video/")
    ) {
      throw new Error(
        "Selected file is not a video."
      );
    }

    const url =
      URL.createObjectURL(file);

    try {
      const video =
        document.createElement("video");

      video.src = url;
      video.preload = "metadata";

      await new Promise(
        (resolve, reject) => {
          video.onloadedmetadata =
            resolve;

          video.onerror = () =>
            reject(
              new Error(
                "Could not read video."
              )
            );
        }
      );

      return {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        fps: 30
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function enhance(
    file,
    quality,
    options = {}
  ) {
    const guard =
      FidelisProcessingGuard
        .checkVideo(file);

    if (!guard.allowed) {
      throw new Error(
        guard.reason
      );
    }

    const info =
      await inspect(file);

    const maxDuration =
      FidelisTierManager.isVVIP()
        ? 120
        : 15;

    if (
      info.duration > maxDuration
    ) {
      throw new Error(
        `Video duration exceeds ${maxDuration} seconds for your plan.`
      );
    }

    throw new Error(
      "Video frame processing engine is ready, but final video encoding is not enabled yet. No fake result was generated."
    );
  }

  window.FidelisVideoAI = {
    inspect,
    enhance,
    enhanceFrame
  };
})();
