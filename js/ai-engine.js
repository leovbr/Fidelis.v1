(function () {

  function createInputTensor(
    imageData
  ) {
    const {
      width,
      height,
      data
    } = imageData;

    const pixelCount =
      width * height;

    const input =
      new Float32Array(
        pixelCount * 3
      );

    for (
      let i = 0;
      i < pixelCount;
      i++
    ) {
      const sourceIndex =
        i * 4;

      input[i] =
        data[sourceIndex] / 255;

      input[
        pixelCount + i
      ] =
        data[
          sourceIndex + 1
        ] / 255;

      input[
        pixelCount * 2 + i
      ] =
        data[
          sourceIndex + 2
        ] / 255;
    }

    return new ort.Tensor(
      "float32",
      input,
      [
        1,
        3,
        height,
        width
      ]
    );
  }

  function createOutputCanvas(
    tensor
  ) {
    const dims =
      tensor.dims;

    const values =
      tensor.data;

    if (dims.length !== 4) {
      throw new Error(
        "Unsupported AI output shape: " +
        JSON.stringify(dims)
      );
    }

    let width;
    let height;
    let nhwc = false;

    if (dims[1] === 3) {
      height = dims[2];
      width = dims[3];
    }

    else if (dims[3] === 3) {
      height = dims[1];
      width = dims[2];
      nhwc = true;
    }

    else {
      throw new Error(
        "Unsupported AI output shape: " +
        JSON.stringify(dims)
      );
    }

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext(
        "2d"
      );

    const output =
      context.createImageData(
        width,
        height
      );

    const pixels =
      output.data;

    const pixelCount =
      width * height;

    for (
      let i = 0;
      i < pixelCount;
      i++
    ) {
      let r;
      let g;
      let b;

      if (nhwc) {
        const index =
          i * 3;

        r = values[index];
        g = values[index + 1];
        b = values[index + 2];

      } else {
        r = values[i];

        g =
          values[
            pixelCount + i
          ];

        b =
          values[
            pixelCount * 2 + i
          ];
      }

      pixels[i * 4] =
        Math.max(
          0,
          Math.min(1, r)
        ) * 255;

      pixels[i * 4 + 1] =
        Math.max(
          0,
          Math.min(1, g)
        ) * 255;

      pixels[i * 4 + 2] =
        Math.max(
          0,
          Math.min(1, b)
        ) * 255;

      pixels[i * 4 + 3] =
        255;
    }

    context.putImageData(
      output,
      0,
      0
    );

    return canvas;
  }

  async function enhance(
    imageData,
    quality,
    onProgress
  ) {
    const session =
      await FidelisModelManager.createSession(
        quality,
        (progress) => {
          onProgress?.(
            progress * 0.6
          );
        }
      );

    const inputName =
      session.inputNames[0];

    const outputName =
      session.outputNames[0];

    const inputTensor =
      createInputTensor(
        imageData
      );

    const result =
      await session.run({
        [inputName]:
          inputTensor
      });

    onProgress?.(0.9);

    const output =
      result[outputName];

    if (!output) {
      throw new Error(
        "AI model returned no output."
      );
    }

    const canvas =
      createOutputCanvas(
        output
      );

    onProgress?.(1);

    return {
      canvas,
      aiProcessed: true,
      engine:
        "Real-ESRGAN ONNX / " +
        String(
          session.__fidelisBackend
        ).toUpperCase(),
      scale:
        FIDELIS_CONFIG
          .getModel(quality)
          .scale
    };
  }

  window.FidelisAIEngine = {
    enhance
  };

})();
