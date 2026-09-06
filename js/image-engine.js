(function () {

  function loadImage(file) {
    return new Promise(
      (resolve, reject) => {

        const url =
          URL.createObjectURL(
            file
          );

        const image =
          new Image();

        image.onload = () => {
          URL.revokeObjectURL(
            url
          );

          resolve(image);
        };

        image.onerror = () => {
          URL.revokeObjectURL(
            url
          );

          reject(
            new Error(
              "Could not read the image."
            )
          );
        };

        image.src = url;
      }
    );
  }

  async function enhance(
    file,
    quality,
    onProgress
  ) {
    if (
      !file ||
      !file.type.startsWith(
        "image/"
      )
    ) {
      throw new Error(
        "Selected file is not an image."
      );
    }

    const image =
      await loadImage(file);

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      image.naturalWidth;

    canvas.height =
      image.naturalHeight;

    const context =
      canvas.getContext(
        "2d"
      );

    context.drawImage(
      image,
      0,
      0
    );

    const imageData =
      context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

    return FidelisAIEngine.enhance(
      imageData,
      quality,
      onProgress
    );
  }

  window.FidelisImageEngine = {
    enhance
  };

})();
