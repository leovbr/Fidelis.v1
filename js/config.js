window.FIDELIS_CONFIG = {
  version: "1.0.0",

  models: {
    standard: {
      id: "real-esrgan-x2",
      scale: 2,
      tier: "free",
      url: "https://huggingface.co/SceneWorks/real-esrgan-onnx/resolve/main/real_esrgan_x2.onnx?download=true"
    },

    high: {
      id: "real-esrgan-x2-high",
      scale: 2,
      tier: "free",
      url: "https://huggingface.co/SceneWorks/real-esrgan-onnx/resolve/main/real_esrgan_x2.onnx?download=true"
    },

    ultra: {
      id: "real-esrgan-x4",
      scale: 4,
      tier: "vvip",
      url: "https://huggingface.co/SceneWorks/real-esrgan-onnx/resolve/main/real_esrgan_x4.onnx?download=true"
    }
  },

  getModel: function (quality) {
    return this.models[quality] || this.models.standard;
  }
};
