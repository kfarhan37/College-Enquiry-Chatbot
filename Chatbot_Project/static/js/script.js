
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;

const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {


  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi;
};


function typeWriter(text, i, element) {
  if (i < text.length) {
    element.textContent += text.charAt(i);
    i++;
    setTimeout(function () {
      typeWriter(text, i, element);
    }, 15); // typing speed here (lower value means faster typing)
  }
}


const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  const incomingChatLi = createChatLi("Thinking...", "incoming");
  chatbox.appendChild(incomingChatLi);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: userMessage }),
  })
    .then((response) => response.json())
    .then((data) => {
      const botResponse = data.message;
      const botResponseTextElement = incomingChatLi.querySelector("p");

      // Clear the "Thinking..." text before typing the actual response
      botResponseTextElement.textContent = "";

      // Start the typewriter effect for the bot's response
      typeWriter(botResponse, 0, botResponseTextElement);

      chatbox.scrollTo(0, chatbox.scrollHeight);
    })
    .catch(() => {
      incomingChatLi.classList.add("error");
      incomingChatLi.querySelector("p").textContent =
        "Sorry! I am not trained to answer this question";
      chatbox.scrollTo(0, chatbox.scrollHeight);
    });
};


chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {

  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));



let typed = new Typed('.auto-type', {
  strings: ["Say Hi to our GPREC bot!"],
  typeSpeed: 150,
  loop: false
})
