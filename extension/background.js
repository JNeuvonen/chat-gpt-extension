const injectContentScript = async (tab) => {
  chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ["./content.js"],
    })
    .then(() => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, "init");
        }
      );
    })
    .catch((err) => console.log(err));
};

chrome.runtime.onInstalled.addListener(() => {
  // default state goes here
  // this runs ONE TIME ONLY
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "query") {
    let result;
    try {
      [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => getSelection().toString(),
      });

      let width;
      let height;

      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        async function (tabs) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            "prompt_made",
            async function (response) {
              width = response.width;
              height = response.height;
            }
          );
        }
      );

      const res = await fetch("http://localhost:8081/prompt", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: result,
        }),
      });
      const data = await res.json();

      const serverRes = data.choices[0].text;

      if (serverRes) {
        chrome.tabs.query(
          {
            active: true,
            currentWindow: true,
          },
          function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, "prompt_finished");
          }
        );

        const padding = Math.round(width * 0.3);

        chrome.windows.create({
          left: Math.round(padding),
          top: Math.round(height * 0.2),
          width: Math.round(width - padding * 2),
          height: Math.round(height * 0.6),
          type: "panel",
          url: "./toast.html",
        });

        chrome.storage.local.set({
          "chatgpt-extension-popup-content": serverRes,
        });
      }
    } catch (e) {
      console.log(e);

      return; // ignoring an unsupported page like chrome://extensions
    }
  }
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
    injectContentScript(tab);
  }
});
