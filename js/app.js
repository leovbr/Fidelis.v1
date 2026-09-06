(function () {
  let mode = "image";
  let quality = "standard";
  let file = null;
  let resultBlob = null;

  const $ = (id) => document.getElementById(id);

  const tabs = [...document.querySelectorAll(".tab")];
  const qualities = [...document.querySelectorAll(".quality")];

  function setStatus(text, percent) {
    $("status").classList.remove("hidden");
    $("statusText").textContent = text;
    $("statusPercent").textContent = Math.round(percent) + "%";
    $("progressBar").style.width = percent + "%";
  }

  function showError(message) {
    $("errorBox").textContent = message;
    $("errorBox").classList.remove("hidden");
  }

  function reset() {
    file = null;
    resultBlob = null;

    $("fileInput").value = "";

    $("sourceArea").classList.add("hidden");
    $("resultPanel").classList.add("hidden");
    $("status").classList.add("hidden");
    $("errorBox").classList.add("hidden");

    $("enhanceButton").disabled = true;
  }

  function setMode(newMode) {
    mode = newMode;

    reset();

    tabs.forEach((tab) => {
      tab.classList.toggle(
        "active",
        tab.dataset.mode === newMode
      );
    });

    if (newMode === "image") {
      $("uploadIcon").textContent = "⌁";
      $("uploadTitle").textContent = "Upload your image";
      $("uploadText").innerHTML =
        "JPG, PNG, WEBP<br>Tap to choose or drag & drop";

      $("fileInput").accept = "image/*";
    } else {
      $("uploadIcon").textContent = "◉";
      $("uploadTitle").textContent = "Upload your video";
      $("uploadText").innerHTML =
        "MP4, WEBM, MOV<br>Tap to choose or drag & drop";

      $("fileInput").accept = "video/*";
    }
  }

  function previewFile(selectedFile) {
    if (!selectedFile) return;

    const expectedType =
      mode === "image" ? "image/" : "video/";

    if (!selectedFile.type.startsWith(expectedType)) {
      showError(
        "Please select a valid " +
        mode +
        " file."
      );

      return;
    }

    file = selectedFile;

    $("sourceName").textContent = selectedFile.name;
    $("sourceArea").classList.remove("hidden");
    $("resultPanel").classList.add("hidden");
    $("errorBox").classList.add("hidden");

    const preview = $("sourcePreview");

    preview.innerHTML = "";

    const objectURL =
      URL.createObjectURL(selectedFile);

    if (mode === "image") {
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(objectURL);
      };

      img.src = objectURL;

      preview.appendChild(img);
    } else {
      const video = document.createElement("video");

      video.src = objectURL;
      video.controls = true;
      video.playsInline = true;

      preview.appendChild(video);
    }

    $("enhanceButton").disabled = false;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setMode(tab.dataset.mode);
    });
  });

  qualities.forEach((button) => {
    button.addEventListener("click", () => {
      quality = button.dataset.quality;

      qualities.forEach((item) => {
        item.classList.toggle(
          "active",
          item === button
        );
      });
    });
  });

  $("fileInput").addEventListener(
    "change",
    (event) => {
      const selectedFile =
        event.target.files[0];

      if (selectedFile) {
        previewFile(selectedFile);
      }
    }
  );

  $("dropZone").addEventListener(
    "dragover",
    (event) => {
      event.preventDefault();
    }
  );

  $("dropZone").addEventListener(
    "drop",
    (event) => {
      event.preventDefault();

      const selectedFile =
        event.dataTransfer.files[0];

      if (selectedFile) {
        previewFile(selectedFile);
      }
    }
  );

  $("removeButton").addEventListener(
    "click",
    () => {
      setMode(mode);
    }
  );

  $("accountBtn").addEventListener(
    "click",
    () => {
      FidelisAuth.login();
    }
  );

  $("enhanceButton").addEventListener(
    "click",
    async () => {
      if (!file) return;

      $("enhanceButton").disabled = true;
      $("errorBox").classList.add("hidden");

      try {
        if (mode === "video") {
          setStatus(
            "Checking video pipeline...",
            5
          );

          await FidelisVideoEngine.enhance(
            file,
            quality
          );

          return;
        }

        setStatus(
          "Loading AI model...",
          2
        );

        const result =
          await FidelisImageEngine.enhance(
            file,
            quality,
            (progress) => {
              setStatus(
                "Enhancing image with AI...",
                progress * 100
              );
            }
          );

        if (!result || !result.aiProcessed) {
          throw new Error(
            "AI did not produce a valid result."
          );
        }

        $("resultPreview").innerHTML = "";

        $("resultPreview").appendChild(
          result.canvas
        );

        $("engineBadge").textContent =
          result.engine;

        resultBlob =
          await new Promise((resolve) => {
            result.canvas.toBlob(
              resolve,
              "image/png"
            );
          });

        if (!resultBlob) {
          throw new Error(
            "Could not create downloadable result."
          );
        }

        $("resultPanel").classList.remove(
          "hidden"
        );

        setStatus(
          "AI enhancement complete.",
          100
        );

      } catch (error) {
        console.error(
          "[FIDELIS]",
          error
        );

        showError(
          error.message ||
          String(error)
        );

        setStatus(
          "Processing failed.",
          0
        );

      } finally {
        $("enhanceButton").disabled =
          !file;
      }
    }
  );

  $("downloadButton").addEventListener(
    "click",
    () => {
      if (!resultBlob) return;

      const url =
        URL.createObjectURL(resultBlob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        (
          file?.name ||
          "image"
        ).replace(
          /\.[^/.]+$/,
          ""
        ) +
        "-fidelis.png";

      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  );

  setMode("image");
})();
