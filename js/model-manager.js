(function () {
  const buffers = new Map();
  const sessions = new Map();

  async function fetchModel(
    quality,
    onProgress
  ) {
    const model =
      FIDELIS_CONFIG.getModel(
        quality
      );

    if (buffers.has(model.id)) {
      onProgress?.(1);
      return buffers.get(model.id);
    }

    const response =
      await fetch(model.url, {
        mode: "cors",
        credentials: "omit",
        redirect: "follow",
        cache: "force-cache"
      });

    if (!response.ok) {
      throw new Error(
        "AI model download failed. HTTP " +
        response.status
      );
    }

    if (!response.body) {
      const buffer =
        await response.arrayBuffer();

      buffers.set(
        model.id,
        buffer
      );

      onProgress?.(1);

      return buffer;
    }

    const total =
      Number(
        response.headers.get(
          "content-length"
        )
      ) || 0;

    const reader =
      response.body.getReader();

    const chunks = [];

    let received = 0;

    while (true) {
      const chunk =
        await reader.read();

      if (chunk.done) break;

      chunks.push(chunk.value);

      received +=
        chunk.value.byteLength;

      if (total) {
        onProgress?.(
          received / total
        );
      } else {
        onProgress?.(
          Math.min(
            0.95,
            received / 70000000
          )
        );
      }
    }

    const output =
      new Uint8Array(received);

    let offset = 0;

    for (const chunk of chunks) {
      output.set(
        chunk,
        offset
      );

      offset +=
        chunk.byteLength;
    }

    buffers.set(
      model.id,
      output.buffer
    );

    onProgress?.(1);

    return output.buffer;
  }

  async function createSession(
    quality,
    onProgress
  ) {
    const model =
      FIDELIS_CONFIG.getModel(
        quality
      );

    if (sessions.has(model.id)) {
      return sessions.get(model.id);
    }

    if (!window.ort) {
      throw new Error(
        "ONNX Runtime failed to load."
      );
    }

    const modelData =
      await fetchModel(
        quality,
        (progress) => {
          onProgress?.(
            progress * 0.75
          );
        }
      );

    let session;
    let backend = "webgpu";

    try {
      session =
        await ort.InferenceSession.create(
          modelData,
          {
            executionProviders: [
              "webgpu"
            ],
            graphOptimizationLevel:
              "all"
          }
        );

    } catch (webgpuError) {
      console.warn(
        "WebGPU failed. Falling back to WASM.",
        webgpuError
      );

      backend = "wasm";

      session =
        await ort.InferenceSession.create(
          modelData,
          {
            executionProviders: [
              "wasm"
            ],
            graphOptimizationLevel:
              "all"
          }
        );
    }

    session.__fidelisBackend =
      backend;

    sessions.set(
      model.id,
      session
    );

    onProgress?.(1);

    return session;
  }

  window.FidelisModelManager = {
    fetchModel,
    createSession
  };
})();
