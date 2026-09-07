(function () {
  "use strict";

  const KEY = "history";
  const MAX_ITEMS = 30;

  function getAll() {
    return FidelisStorage.get(
      KEY,
      []
    );
  }

  function add(item) {
    const history = getAll();

    const entry = {
      id:
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .slice(2, 8),

      name: item.name || "Untitled",

      type:
        item.type || "image",

      quality:
        item.quality || "standard",

      scale:
        item.scale || 2,

      engine:
        item.engine || "FIDELIS AI",

      createdAt:
        new Date().toISOString()
    };

    history.unshift(entry);

    while (
      history.length > MAX_ITEMS
    ) {
      history.pop();
    }

    FidelisStorage.set(
      KEY,
      history
    );

    window.dispatchEvent(
      new CustomEvent(
        "fidelis:historychange",
        {
          detail: entry
        }
      )
    );

    return entry;
  }

  function remove(id) {
    const history =
      getAll().filter(
        item => item.id !== id
      );

    FidelisStorage.set(
      KEY,
      history
    );
  }

  function clear() {
    FidelisStorage.remove(KEY);

    window.dispatchEvent(
      new CustomEvent(
        "fidelis:historychange"
      )
    );
  }

  function count() {
    return getAll().length;
  }

  window.FidelisHistory = {
    getAll,
    add,
    remove,
    clear,
    count
  };
})();
