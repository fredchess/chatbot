import Alpine from "https://cdn.skypack.dev/alpinejs@3.11.1";

//Demo variables
const mockTypingAfter = 1500;
const mockResponseAfter = 3000;
const mockOpeningMessage =
  "Hello there. I am Fredchess and I'm here to assist you for any request you'll have about Toolbrothers, our products and services.\nSo how can I help you today?";
const mockResponsePrefix = "Thanks for sending me: ";

document.addEventListener("alpine:init", () => {
  Alpine.data("chat", () => ({
    newMessage: "",
    showTyping: false,
    waitingOnResponse: true,
    hasError: false,
    messages: [],
    init() {
      this.mockResponse(mockOpeningMessage);
    },
    sendMessage() {
      if (this.waitingOnResponse) return;
      this.waitingOnResponse = true;


      this.messages.push({ role: "user", body: this.newMessage });
      let content = this.newMessage
      this.newMessage = "";
      this.showTyping = true
      // window.scrollTo(0, 0); //To fix weird iOS zoom on input

      $.ajax({
        url: 'http://localhost:8000/chat',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          messages: this.messages.map(x => ({ role: x.role, content: x.body }))
        }),
        success: (response) => {
          this.mockResponse(response.message);
        },
        error: (err) => {
          this.waitingOnResponse = false;
          this.showTyping = false
          this.messages[this.messages.length - 1].error = true
        }
      })
    },
    typeOutResponse(message) {
      this.messages.push({ role: "assistant", body: "", beingTyped: true });
      let responseMessage = this.messages[this.messages.length - 1];
      let i = 0;
      let interval = setInterval(() => {
        responseMessage.body += message.charAt(i);
        i++;
        if (i > message.length - 1) {
          this.waitingOnResponse = false;
          delete responseMessage.beingTyped;
          clearInterval(interval);
        }
      }, 30);
    },
    mockResponse(message) {
      setTimeout(() => {
        this.showTyping = true;
      }, mockTypingAfter);
      setTimeout(() => {
        this.showTyping = false;
        let responseMessage =
          message ??
          mockResponsePrefix + this.messages[this.messages.length - 1].body;
        this.typeOutResponse(responseMessage);
      }, mockResponseAfter);
    }
  }));
});

Alpine.start();
