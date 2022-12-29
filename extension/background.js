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
  const defaultTemplates = [
    {
      name: "raw",
      template: "{prompt}",
    },

    {
      name: "bullet-points",
      template: "Give me a list of bullet points.\n\n{prompt}",
    },

    {
      name: "summarize",
      template: "{prompt}\n\nWrite a short summarization regarding this topic",
    },

    {
      name: "translate",
      template: "{prompt}\n\nTranslate this to {target_language}",
    },

    {
      name: "rephrase",
      template: "{prompt}\n\nRephrase text above. Try to be creative.",
    },

    {
      name: "custom",
      template: "{prompt}",
    },
  ];
  defaultTemplates.forEach((item) => {
    const keyValue = {};
    keyValue[item.name] = item.template;
    chrome.storage.local.set(keyValue);
  });

  chrome.storage.local.set({ "selected-template": "raw" });
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

      chrome.storage.local.get("selected-template", async function (items) {
        const selectedTemplate = items["selected-template"];
        chrome.storage.local.get(selectedTemplate, async function (items) {
          const savedTemplate = items[selectedTemplate].replace(
            "{prompt}",
            result
          );

          const res = await fetch("http://localhost:8081/prompt", {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: savedTemplate,
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
        });
      });
    } catch (e) {}
  }

  setTimeout(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, "prompt_finished");
      }
    );

    return;
  }, 5000);
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
    injectContentScript(tab);
  }
});
