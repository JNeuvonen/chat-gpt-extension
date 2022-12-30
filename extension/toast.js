let usedPrompt;
let promptHidden = true;

chrome.storage.local.get("used-prompt", function (items) {
  usedPrompt = items["used-prompt"];
});

document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("chatgpt-extension-popup-content", function (items) {
    const content = items["chatgpt-extension-popup-content"];
    const popup = document.getElementById("popup");
    popup.innerText = content;
  });

  const showPrompt = document.getElementById("show-prompt");
  const prompt = document.getElementById("prompt");
  const promptDiv = document.getElementById("prompt-div");
  showPrompt.addEventListener("click", () => {
    if (promptHidden) {
      prompt.innerText = usedPrompt;
      showPrompt.innerText = "Hide prompt";
      promptDiv.style.display = "block";
    } else {
      prompt.innerText = "";
      showPrompt.innerText = "Show prompt";
      promptDiv.style.display = "none";
    }
    promptHidden = !promptHidden;
  });
});
