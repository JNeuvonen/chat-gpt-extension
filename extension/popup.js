const idsOfCheckBoxes = [
  "raw",
  "bullet-points",
  "summarize",
  "translate",
  "rephrase",
  "custom",
];

const uncheckAllOtherCheckboxes = (checkedId) => {
  idsOfCheckBoxes.forEach((item) => {
    if (item !== checkedId) {
      const domElem = document.getElementById(item);
      domElem.checked = false;
    }
  });
};

const formatSelectedTemplateName = (item) => {
  return (
    item.substring(0, 1).toUpperCase() +
    item.substring(1, item.length).replace("-", " ")
  );
};

document.addEventListener(
  "DOMContentLoaded",
  function () {
    chrome.storage.local.get("selected-template", function (items) {
      const selectedTemplate = items["selected-template"];
      const elem = document.getElementById(selectedTemplate);
      elem.checked = true;
    });

    document
      .getElementById("template-save-btn")
      .addEventListener("click", () => {
        chrome.storage.local.get("edited-template", function (items) {
          const textarea = document.getElementById("edit-template-textarea");
          const selectedTemplate = items["edited-template"];
          const keyValuePair = {};
          keyValuePair[selectedTemplate] = textarea.value;
          chrome.storage.local.set(keyValuePair);
        });
      });

    idsOfCheckBoxes.forEach((item) => {
      const domElem = document.getElementById(item);
      const iconElem = document.getElementById(item + "-icon");
      const templateReturnBtn = document.getElementById(
        "template-editor-return-btn"
      );

      templateReturnBtn.addEventListener("click", () => {
        const templatePopup = document.getElementById("template-editor");
        templatePopup.style.display = "none";
      });

      domElem.addEventListener("change", (event) => {
        if (event.currentTarget.checked) {
          uncheckAllOtherCheckboxes(item);
          chrome.storage.local.set({
            "selected-template": item,
          });
        }
      });

      iconElem.addEventListener("click", () => {
        const templatePopup = document.getElementById("template-editor");
        const title = document.getElementById("template-editor-title");
        templatePopup.style.display = "initial";
        title.innerText = formatSelectedTemplateName(item);

        chrome.storage.local.set({
          "edited-template": item,
        });

        chrome.storage.local.get(item, function (items) {
          const textarea = document.getElementById("edit-template-textarea");
          textarea.value = items[item];
          textarea.blur();
        });
      });
    });
  },
  false
);
