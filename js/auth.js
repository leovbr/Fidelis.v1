(function () {

  window.FidelisAuth = {

    provider:
      "frontend-placeholder",

    isConfigured:
      false,

    login() {
      alert(
        "Production login requires a backend/auth provider. The FIDELIS frontend is ready to connect to one."
      );
    },

    logout() {
      return true;
    },

    getUser() {
      return null;
    }

  };

})();
