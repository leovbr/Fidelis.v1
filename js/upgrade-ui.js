(function () {
  "use strict";

  let modal = null;

  function close() {
    if (modal) {
      modal.remove();
      modal = null;
    }
  }

  function open() {
    close();

    modal =
      document.createElement("div");

    modal.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99999;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(0,0,0,.76);
      backdrop-filter:blur(12px);
      font-family:system-ui,sans-serif;
    `;

    modal.innerHTML = `
      <div style="
        width:min(100%,460px);
        padding:28px;
        border:1px solid #303039;
        border-radius:22px;
        background:#101014;
        color:#f5f5f7;
        box-shadow:0 30px 100px rgba(0,0,0,.6);
      ">

        <div style="
          font-size:10px;
          font-weight:900;
          letter-spacing:3px;
          color:#777783;
        ">
          FIDELIS
        </div>

        <h2 style="
          margin-top:8px;
          font-size:30px;
        ">
          VVIP
        </h2>

        <p style="
          margin-top:10px;
          color:#9999a5;
          line-height:1.6;
          font-size:13px;
        ">
          Unlock the full FIDELIS enhancement
          system.
        </p>

        <div style="
          margin-top:20px;
          padding:16px;
          border:1px solid #292930;
          border-radius:14px;
          line-height:2;
          font-size:13px;
          color:#d0d0d7;
        ">
          ✓ Ultra 4× AI enhancement<br>
          ✓ Advanced video AI<br>
          ✓ 60 FPS processing<br>
          ✓ 120 FPS processing<br>
          ✓ Larger media limits<br>
          ✓ Priority processing
        </div>

        <button
          id="fidelisUpgradeAction"
          type="button"
          style="
            width:100%;
            margin-top:18px;
            padding:14px;
            border:0;
            border-radius:11px;
            background:#f5f5f7;
            color:#08080b;
            font-weight:900;
          "
        >
          VVIP COMING SOON
        </button>

        <button
          id="fidelisUpgradeClose"
          type="button"
          style="
            width:100%;
            margin-top:8px;
            padding:12px;
            border:1px solid #292930;
            border-radius:11px;
            background:transparent;
            color:#aaaab4;
          "
        >
          Close
        </button>

      </div>
    `;

    document.body.appendChild(modal);

    document
      .getElementById(
        "fidelisUpgradeClose"
      )
      .onclick = close;

    document
      .getElementById(
        "fidelisUpgradeAction"
      )
      .onclick = function () {
        alert(
          "FIDELIS VVIP payment system will be connected later."
        );
      };

    modal.onclick = function (event) {
      if (event.target === modal) {
        close();
      }
    };
  }

  window.FidelisUpgradeUI = {
    open,
    close
  };
})();
