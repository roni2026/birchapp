export type BridgeMessage = {
  type: string;
  detail?: Record<string, unknown>;
};

export const uiBridgeScript = `
  (function () {
    var events = [
      "birchstreet:login",
      "birchstreet:refresh",
      "birchstreet:sync",
      "birchstreet:request-order-sheet-entries",
      "birchstreet:select-order-sheet-entry",
      "birchstreet:print-with-details"
    ];
    events.forEach(function (type) {
      window.addEventListener(type, function (event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: type,
          detail: event.detail || {}
        }));
      });
    });
    true;
  })();
`;

const safe = (value: unknown) => JSON.stringify(String(value ?? ""));

export function loginScript(loginID: string, password: string) {
  return `
    (function () {
      var login = document.getElementById("loginID");
      var pass = document.getElementById("password");
      var subscriber = document.getElementById("subscriberID");
      var submit = document.getElementById("submitLogin");
      if (login && pass && submit && !window.__outriggerLoginSubmitted) {
        window.__outriggerLoginSubmitted = true;
        login.value = ${safe(loginID)};
        pass.value = ${safe(password)};
        if (subscriber) subscriber.value = "458";
        submit.click();
      }
      true;
    })();
  `;
}

export const extractOrderEntriesScript = `
  (function () {
    function documents(root) {
      var result = [root];
      try {
        for (var i = 0; i < root.frames.length; i++) {
          result = result.concat(documents(root.frames[i].document));
        }
      } catch (_) {}
      return result;
    }
    var entries = [];
    documents(document).some(function (doc) {
      var select = doc.getElementById("FavoriteID") || doc.querySelector("select[name='FavoriteID']");
      if (!select) return false;
      entries = Array.prototype.map.call(select.options, function (option) {
        return { value: option.value, label: (option.textContent || "").trim() };
      }).filter(function (option) {
        return option.value && option.label && option.label !== "Select Entry";
      });
      return true;
    });
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: "portal:order-sheet-entries",
      detail: { entries: entries }
    }));
    true;
  })();
`;

export function selectOrderEntryScript(entry: string) {
  return `
    (function () {
      function choose(root) {
        var select = root.getElementById("FavoriteID") || root.querySelector("select[name='FavoriteID']");
        if (select) {
          var target = ${safe(entry)};
          for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].value === target || select.options[i].text.trim() === target) {
              select.selectedIndex = i;
              select.dispatchEvent(new Event("change", { bubbles: true }));
              return true;
            }
          }
        }
        try {
          for (var j = 0; j < root.defaultView.frames.length; j++) {
            if (choose(root.defaultView.frames[j].document)) return true;
          }
        } catch (_) {}
        return false;
      }
      choose(document);
      true;
    })();
  `;
}

export function printDetailsScript(documentNumber: string) {
  return `
    (function () {
      function allDocuments(root) {
        var result = [root];
        try {
          for (var i = 0; i < root.defaultView.frames.length; i++) {
            result = result.concat(allDocuments(root.defaultView.frames[i].document));
          }
        } catch (_) {}
        return result;
      }
      var docs = allDocuments(document);
      docs.forEach(function (doc) {
        var rows = doc.querySelectorAll("tr");
        for (var i = 0; i < rows.length; i++) {
          if ((rows[i].textContent || "").indexOf(${safe(documentNumber)}) !== -1) {
            var selector = rows[i].querySelector("input[type='radio'], input[type='checkbox']");
            if (selector && !selector.checked) selector.click();
            rows[i].click();
            break;
          }
        }
      });
      setTimeout(function () {
        docs.some(function (doc) {
          var controls = doc.querySelectorAll("button, a, input[type='button']");
          for (var i = 0; i < controls.length; i++) {
            var text = (controls[i].textContent || controls[i].value || "").trim();
            if (/print\\s*w\\/\\s*details/i.test(text) || /print\\s*\\/\\s*view\\s*\\/\\s*edit/i.test(text)) {
              controls[i].click();
              return true;
            }
          }
          return false;
        });
      }, 250);
      true;
    })();
  `;
}
