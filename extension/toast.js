document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("chatgpt-extension-popup-content", function (items) {
    const content = items["chatgpt-extension-popup-content"];
    const popup = document.getElementById("popup");
    popup.innerText = content;
  });
});
