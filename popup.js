chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
  
    fetch("http://localhost:3000/analyze?deep=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    })
      .then(response => response.json())
      .then(data => {
        const resultEl = document.getElementById("result");
  
        if (!data.verdict) {
          resultEl.innerHTML = `
            <strong style="color:red;">ERROR</strong><br/>
            ${data.error || "Unexpected server response."}
          `;
          return;
        }
  
        const color = data.verdict === "safe" ? "green" : "red";
        resultEl.innerHTML = `
          <strong style="color:${color};">${data.verdict.toUpperCase()}</strong><br/>
          Score: ${data.score}<br/>
          Reasons:
          <ul>${data.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
        `;
      })
      .catch(error => {
        document.getElementById("result").innerHTML = `
          <strong style="color:red;">ERROR</strong><br/>
          ${error.message}
        `;
      });
  });
  