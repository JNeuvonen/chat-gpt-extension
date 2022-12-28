//document.addEventListener(
//  "DOMContentLoaded",
//  function () {
//    const checkPageButton = document.getElementById("checkPage");
//    checkPageButton.addEventListener(
//      "click",
//      async function () {
//        const res = await fetch("http://localhost:8081/prompt", {
//          method: "POST",
//          mode: "cors",
//          headers: {
//            "Content-Type": "application/json",
//          },
//          body: JSON.stringify({
//            prompt: "Do humans suffer from anxiety?",
//          }),
//        });
//
//        const data = await res.json();
//        console.log(data);
//      },
//      false
//    );
//  },
//  false
//);
