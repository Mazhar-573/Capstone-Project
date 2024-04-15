console.log("JavaScript file loaded!");
document.getElementById("startButton").addEventListener("click", function() {
  document.getElementById("homePage").style.display = "none";
  document.getElementsByClassName("container")[0].style.display = "block";
});
document.getElementById("chatbotAccessButton").addEventListener("click", function () {
  document.getElementById("filterContainer").style.display = "none";
  document.getElementById("chatbotContainer").style.display = "block";
});
document.getElementById("backToManualButton").addEventListener("click", function() {
  document.getElementById("chatbotContainer").style.display = "none";
  document.getElementById("filterContainer").style.display = "block";
});
document
  .getElementById("sendButton")
  .addEventListener("click", async function () {
    const chatbox = document.getElementById("chatbox");
    const userInput = document.getElementById("userInput");
    const loader = document.getElementById("loader");
    const question = userInput.value;
    userInput.value = "";
    chatbox.innerHTML += `<p><strong>You:</strong> ${question}</p>`;
    loader.style.display = "block";
    try {
      const response = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })
      if (response.ok) {
        const responseData = await response.text(); 
        chatbox.innerHTML += responseData; 
      } else {
        throw new Error('Request failed with status ' + response.status);
      }
    } catch (error) {
      chatbox.innerHTML += `<p><strong>Assistant:</strong> Sorry, an error occurred. Please try again later.</p>`;
    } finally {
      loader.style.display = "none";
    }
    chatbox.scrollTop = chatbox.scrollHeight;
  });
