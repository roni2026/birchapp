export type BridgeMessage = {
  type: string;
  detail?: Record<string, unknown>;
};

export const uiBridgeScript = `
  (function () {
    var events = [
      "birchstreet:login",
      "birchstreet:logout",
      "birchstreet:refresh",
      "birchstreet:sync",
      "birchstreet:search",
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

const safe = (value: unknown) => JSON.stringify(value ?? "");

const portalHelpers = `
  function post(type, detail) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, detail: detail || {} }));
    } catch (error) {}
  }
  function norm(value) {
    return String(value == null ? "" : value).replace(/\\s+/g, " ").trim();
  }
  function windows(root) {
    var result = [root];
    try {
      for (var i = 0; i < root.frames.length; i++) {
        result = result.concat(windows(root.frames[i]));
      }
    } catch (error) {}
    return result;
  }
  function documents() {
    return windows(window).map(function (entry) {
      try { return entry.document; } catch (error) { return null; }
    }).filter(Boolean);
  }
  function welcome() {
    var hit = null;
    documents().some(function (doc) {
      hit = doc.querySelector(".WelcomeNP");
      return !!hit;
    });
    return hit ? norm(hit.textContent) : "";
  }
  function profile(raw) {
    var match = raw.match(/^\\s*(.*?)\\s*\\[([^\\]]+)\\]/);
    return {
      name: norm(match ? match[1] : raw),
      account: norm(match ? match[2] : "")
    };
  }
`;

export const portalMonitorScript = `
  (function () {
    if (window.__outriggerPortalMonitor) return true;
    window.__outriggerPortalMonitor = true;
    ${portalHelpers}
    var lastWelcome = "";
    function wireErrors(target) {
      try {
        if (target.__outriggerErrorWired) return;
        target.__outriggerErrorWired = true;
        target.addEventListener("error", function (event) {
          post("portal:log", {
            level: "error",
            message: "Portal script error: " + norm(event.message || "Unknown error"),
            url: String(target.location && target.location.href || "")
          });
        });
        target.addEventListener("unhandledrejection", function (event) {
          post("portal:log", {
            level: "error",
            message: "Portal promise error: " + norm(event.reason && (event.reason.message || event.reason) || "Unknown error"),
            url: String(target.location && target.location.href || "")
          });
        });
      } catch (error) {}
    }
    function inspect() {
      windows(window).forEach(wireErrors);
      var raw = welcome();
      if (raw && raw !== lastWelcome) {
        lastWelcome = raw;
        post("portal:authenticated", { raw: raw, user: profile(raw), url: String(location.href) });
      }
    }
    inspect();
    window.__outriggerPortalMonitorTimer = setInterval(inspect, 750);
    true;
  })();
`;

export function portalStateScript(checkLoginFailure: boolean) {
  return `
    (function () {
      ${portalHelpers}
      setTimeout(function () {
        var raw = welcome();
        if (raw) {
          post("portal:authenticated", { raw: raw, user: profile(raw), url: String(location.href) });
          return;
        }
        if (!${checkLoginFailure ? "true" : "false"}) return;
        var loginDoc = documents().find(function (doc) {
          return doc.getElementById("loginID") && doc.getElementById("password");
        });
        if (loginDoc) {
          var candidates = loginDoc.querySelectorAll(
            ".error, .Error, .errorMessage, .validation-summary-errors, font[color='red']"
          );
          var message = "";
          Array.prototype.some.call(candidates, function (entry) {
            message = norm(entry.textContent);
            return !!message;
          });
          post("portal:login-failed", {
            message: message || "BirchStreet did not accept the login. Check your Login ID and password."
          });
        }
      }, 900);
      true;
    })();
  `;
}

export function loginScript(loginID: string, password: string) {
  return `
    (function () {
      ${portalHelpers}
      var attempts = 0;
      var timer = setInterval(function () {
        attempts += 1;
        var loginDoc = documents().find(function (doc) {
          return doc.getElementById("loginID") && doc.getElementById("password");
        });
        if (!loginDoc) {
          if (attempts >= 40) {
            clearInterval(timer);
            post("portal:login-failed", { message: "BirchStreet login form was not found." });
          }
          return;
        }
        var login = loginDoc.getElementById("loginID");
        var pass = loginDoc.getElementById("password");
        var subscriber = loginDoc.getElementById("subscriberID");
        var submit = loginDoc.getElementById("submitLogin") ||
          loginDoc.querySelector("button[type='submit'], input[type='submit']");
        if (!submit) {
          clearInterval(timer);
          post("portal:login-failed", { message: "BirchStreet login button was not found." });
          return;
        }
        clearInterval(timer);
        login.value = ${safe(loginID)};
        pass.value = ${safe(password)};
        if (subscriber) subscriber.value = "458";
        ["input", "change"].forEach(function (name) {
          login.dispatchEvent(new Event(name, { bubbles: true }));
          pass.dispatchEvent(new Event(name, { bubbles: true }));
        });
        post("portal:login-submitted", { loginID: ${safe(loginID)} });
        submit.click();
      }, 250);
      true;
    })();
  `;
}

type SearchDetail = {
  section: "requests" | "orders" | "items" | "orderList";
  view?: string;
  column?: string;
  query?: string;
  entry?: string;
};

export function searchPortalScript(detail: SearchDetail) {
  return `
    (function () {
      ${portalHelpers}
      var request = ${JSON.stringify(detail)};
      var finished = false;
      function finish(type, detail) {
        if (finished) return;
        finished = true;
        post(type, detail);
      }
      function value(row, prefix) {
        var el = row.querySelector('[id^="' + prefix + '"]');
        return el ? norm(el.textContent || el.getAttribute("value")) : "";
      }
      function plainAfter(row, prefix) {
        var cells = Array.prototype.slice.call(row.children || []);
        var start = cells.findIndex(function (cell) {
          return String(cell.id || "").indexOf(prefix) === 0;
        });
        for (var i = start + 1; i < cells.length; i++) {
          if (cells[i].id) continue;
          var text = norm(cells[i].textContent);
          if (text) return text;
        }
        return "";
      }
      function dateValue(raw) {
        var text = norm(raw);
        var match = text.match(/^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
        return match
          ? match[3] + "-" + match[1].padStart(2, "0") + "-" + match[2].padStart(2, "0")
          : text;
      }
      function rows(doc, prefix) {
        return Array.prototype.map.call(doc.querySelectorAll('td[id^="' + prefix + '"]'), function (cell) {
          return cell.closest("tr");
        }).filter(function (row, index, all) {
          return row && all.indexOf(row) === index;
        });
      }
      function findListDoc() {
        return documents().find(function (doc) {
          var url = "";
          try { url = String(doc.location.href); } catch (error) {}
          if (request.section === "requests") {
            return /ListType=REQ(?:&|$)/i.test(url) || !!doc.getElementById("REQ_NUMBER_TH");
          }
          if (request.section === "orders") {
            return /ListType=BUYER_PO/i.test(url) || !!doc.getElementById("PO_NUMBER_TH");
          }
          if (request.section === "items") {
            return /ListType=IMM_ITEM_LIST/i.test(url) || !!doc.getElementById("SUPER_SKU_CODE_TH");
          }
          return !!(doc.getElementById("FavoriteID") || doc.querySelector("select[name='FavoriteID']"));
        }) || null;
      }
      function clickPortalTab() {
        var wanted = request.section === "items" ? "Item List" : "Order Sheet";
        var clicked = false;
        documents().some(function (doc) {
          var links = Array.prototype.slice.call(doc.querySelectorAll("a"));
          var link = links.find(function (entry) {
            return norm(entry.textContent).toLowerCase() === wanted.toLowerCase() &&
              entry.style.display !== "none";
          });
          if (!link) return false;
          link.click();
          clicked = true;
          post("portal:log", { level: "info", message: "Opened BirchStreet " + wanted + " tab" });
          return true;
        });
        return clicked;
      }
      function snapshot(doc) {
        var prefix = request.section === "requests" ? "REQ_NUMBER" :
          request.section === "orders" ? "PO_NUMBER" :
          request.section === "items" ? "SUPER_SKU_CODE" : "";
        if (!prefix) return norm(doc.body && doc.body.textContent).slice(-500);
        return rows(doc, prefix).map(function (row) { return value(row, prefix); }).join("|");
      }
      function selectByText(select, text) {
        if (!select || !text) return false;
        var option = Array.prototype.find.call(select.options, function (entry) {
          return norm(entry.text).toLowerCase() === norm(text).toLowerCase();
        });
        if (!option) return false;
        if (select.value === option.value) return false;
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      function configureAndSearch(doc) {
        var frameWindow = doc.defaultView;
        var view = doc.getElementById("dropdownMultiPanels");
        if (view && request.view) {
          var current = norm(view.options[view.selectedIndex] && view.options[view.selectedIndex].text);
          if (current.toLowerCase() !== norm(request.view).toLowerCase()) {
            var option = Array.prototype.find.call(view.options, function (entry) {
              return norm(entry.text).toLowerCase() === norm(request.view).toLowerCase();
            });
            if (!option) throw new Error('REQ/PO view "' + request.view + '" was not found');
            view.value = option.value;
            if (frameWindow && typeof frameWindow.funcPanelChanged === "function") {
              frameWindow.funcPanelChanged(view);
            } else {
              view.dispatchEvent(new Event("change", { bubbles: true }));
            }
            return "view";
          }
        }
        if (request.section === "orderList" && request.entry) {
          var favorite = doc.getElementById("FavoriteID") || doc.querySelector("select[name='FavoriteID']");
          selectByText(favorite, request.entry);
        }
        var field = doc.getElementById("SearchField");
        if (field && request.column) selectByText(field, request.column);
        var input = doc.getElementById("SearchValue");
        var button = doc.getElementById("searchButton");
        if (!input || !button) throw new Error("BirchStreet search controls were not found");
        input.focus();
        input.value = String(request.query || "");
        ["input", "keyup", "change"].forEach(function (name) {
          input.dispatchEvent(new Event(name, { bubbles: true }));
        });
        button.click();
        if (frameWindow && typeof frameWindow.DoQuickSearchDataType === "function") {
          setTimeout(function () {
            try {
              if (snapshot(doc) === beforeSnapshot) frameWindow.DoQuickSearchDataType(button);
            } catch (error) {}
          }, 800);
        }
        return "search";
      }
      function extract(doc) {
        if (request.section === "requests") {
          return rows(doc, "REQ_NUMBER").map(function (row) {
            return {
              id: value(row, "REQ_NUMBER"),
              title: value(row, "SUBJECT"),
              area: plainAfter(row, "SUBJECT"),
              amount: value(row, "TOTAL_LINE_HOME_AMT"),
              status: value(row, "STATUS"),
              tone: /approved|complete/i.test(value(row, "STATUS")) ? "green" :
                /pending|approval/i.test(value(row, "STATUS")) ? "amber" : "blue",
              date: dateValue(plainAfter(row, "REQ_NUMBER")),
              delivery: dateValue(value(row, "REQUIRED_DATE")),
              purchaseType: value(row, "PURCHASE_TYPE") || value(row, "REQ_TYPE")
            };
          });
        }
        if (request.section === "orders") {
          return rows(doc, "PO_NUMBER").map(function (row) {
            var subjectCell = row.querySelector('[id^="SUBJECT"]');
            var supplier = subjectCell && subjectCell.querySelector("b");
            var subject = subjectCell ? norm(
              Array.prototype.filter.call(subjectCell.childNodes, function (node) {
                return node.nodeType === 3;
              }).map(function (node) { return node.textContent; }).join(" ")
            ) : "";
            return {
              id: value(row, "PO_NUMBER"),
              supplier: supplier ? norm(supplier.textContent) : "",
              subject: subject || value(row, "SUBJECT"),
              amount: value(row, "TOTAL_HOME_AMT"),
              status: value(row, "STATUS"),
              date: dateValue(plainAfter(row, "PHASE_DESCRIPTION")),
              delivery: dateValue(value(row, "NEED_BY_DATE")),
              poType: value(row, "PO_TYPE")
            };
          });
        }
        if (request.section === "items") {
          return rows(doc, "SUPER_SKU_CODE").map(function (row) {
            return {
              part: value(row, "SUPER_SKU_CODE").replace(/^0+/, "") || "0",
              description: value(row, "SUPER_SKU_DESCRIPTION"),
              supplier: "",
              onHand: 0,
              invUom: value(row, "UOM_CODE") || value(row, "BASE_UOM"),
              orderUom: value(row, "BASE_UOM"),
              price: 0,
              category: value(row, "CATEGORY_NAME") || value(row, "PART_CATEGORY_ID"),
              date: ""
            };
          });
        }
        var genericRows = Array.prototype.slice.call(doc.querySelectorAll("tr.NavRow, tr[id^='row']"));
        return genericRows.map(function (row) {
          return {
            part: value(row, "SUPER_SKU_CODE") || value(row, "PART_NUMBER") || value(row, "ITEM_CODE"),
            description: value(row, "SUPER_SKU_DESCRIPTION") || value(row, "DESCRIPTION"),
            uom: value(row, "UOM_CODE") || value(row, "BASE_UOM"),
            quantity: Number(value(row, "QUANTITY").replace(/[^0-9.-]/g, "")) || 0,
            source: value(row, "SOURCE_TYPE"),
            location: request.entry || "",
            category: value(row, "CATEGORY_NAME"),
            date: ""
          };
        }).filter(function (row) { return row.part || row.description; });
      }
      var started = Date.now();
      var originalDoc = null;
      var beforeSnapshot = "";
      var phase = "locate";
      post("portal:search-status", { section: request.section, state: "loading" });
      var timer = setInterval(function () {
        try {
          var doc = findListDoc();
          if (!doc) {
            if ((request.section === "items" || request.section === "orderList") && phase === "locate") {
              clickPortalTab();
              phase = "opening";
            }
            if (Date.now() - started > 15000) {
              clearInterval(timer);
              finish("portal:search-error", {
                section: request.section,
                message: "BirchStreet " + request.section + " frame did not load"
              });
            }
            return;
          }
          if (phase === "locate" || phase === "opening") {
            beforeSnapshot = snapshot(doc);
            originalDoc = doc;
            var action = configureAndSearch(doc);
            phase = action === "view" ? "view-changing" : "searching";
            started = Date.now();
            return;
          }
          if (phase === "view-changing") {
            if (doc !== originalDoc || Date.now() - started > 2500) {
              beforeSnapshot = snapshot(doc);
              originalDoc = doc;
              configureAndSearch(doc);
              phase = "searching";
              started = Date.now();
            }
            return;
          }
          var changed = doc !== originalDoc || snapshot(doc) !== beforeSnapshot;
          if (phase === "searching" && (changed || Date.now() - started > 7000)) {
            clearInterval(timer);
            var result = extract(doc);
            finish("portal:search-results", {
              section: request.section,
              records: result,
              count: result.length
            });
          }
          if (Date.now() - started > 15000) {
            clearInterval(timer);
            finish("portal:search-error", {
              section: request.section,
              message: "BirchStreet search timed out while waiting for its iframe"
            });
          }
        } catch (error) {
          clearInterval(timer);
          finish("portal:search-error", {
            section: request.section,
            message: String(error && error.message || error)
          });
        }
      }, 250);
      true;
    })();
  `;
}

export const extractOrderEntriesScript = `
  (function () {
    ${portalHelpers}
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      var entries = [];
      var found = documents().some(function (doc) {
        var select = doc.getElementById("FavoriteID") || doc.querySelector("select[name='FavoriteID']");
        if (!select) return false;
        entries = Array.prototype.map.call(select.options, function (option) {
          return { value: option.value, label: norm(option.textContent) };
        }).filter(function (option) {
          return option.value && option.label && option.label !== "Select Entry";
        });
        return true;
      });
      if (found || attempts >= 60) {
        clearInterval(timer);
        post("portal:order-sheet-entries", { entries: entries });
        if (!found) {
          post("portal:log", {
            level: "error",
            message: "Order Sheet Select Entry control did not load"
          });
        }
      }
    }, 250);
    true;
  })();
`;

export function openPortalTabScript(label: string) {
  return `
    (function () {
      ${portalHelpers}
      var wanted = ${safe(label)};
      var clicked = false;
      documents().some(function (doc) {
        var link = Array.prototype.find.call(doc.querySelectorAll("a"), function (entry) {
          return norm(entry.textContent).toLowerCase() === wanted.toLowerCase() &&
            entry.style.display !== "none";
        });
        if (!link) return false;
        link.click();
        clicked = true;
        return true;
      });
      post("portal:log", {
        level: clicked ? "info" : "error",
        message: clicked ? "Opened BirchStreet " + wanted + " tab" : wanted + " tab was not found"
      });
      true;
    })();
  `;
}

export function selectOrderEntryScript(entry: string) {
  return `
    (function () {
      ${portalHelpers}
      documents().some(function (doc) {
        var select = doc.getElementById("FavoriteID") || doc.querySelector("select[name='FavoriteID']");
        if (!select) return false;
        var target = ${safe(entry)};
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].value === target || norm(select.options[i].text) === target) {
            select.selectedIndex = i;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            return true;
          }
        }
        return false;
      });
      true;
    })();
  `;
}

export function printDetailsScript(documentNumber: string) {
  return `
    (function () {
      ${portalHelpers}
      var docs = documents();
      docs.forEach(function (doc) {
        var rows = doc.querySelectorAll("tr");
        for (var i = 0; i < rows.length; i++) {
          if (norm(rows[i].textContent).indexOf(${safe(documentNumber)}) !== -1) {
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
            var text = norm(controls[i].textContent || controls[i].value);
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
