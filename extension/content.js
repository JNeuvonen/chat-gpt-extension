chrome.runtime.onMessage.addListener(async function (
  request,
  _sender,
  sendResponse
) {
  if (request === "prompt_made") {
    document.body.style.cursor = "wait";
    const width = window.innerWidth;
    const height = window.innerHeight;
    sendResponse({
      width,
      height,
    });
  } else if (request === "prompt_finished") {
    document.body.style.cursor = "auto";
  }
});
