// app.js - Coding Buddy
// Main JS for handling chat, Claude API, and UI updates
// Follows SOLID, clean architecture, and is fully commented

/**
 * MessageRenderer handles rendering chat messages to the UI.
 * Single Responsibility: Only handles DOM updates for messages.
 */
class MessageRenderer {
  constructor(chatArea) {
    this.chatArea = chatArea;
  }

  /**
   * Render a message in the chat area.
   * @param {string} text - The message text.
   * @param {string} sender - 'user' or 'bot'.
   */
  renderMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    // Avatar for user/bot
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = sender === "user" ? "🧑" : "🤖";

    // Message bubble
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = this._formatText(text);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    this.chatArea.appendChild(messageDiv);
    this.chatArea.scrollTop = this.chatArea.scrollHeight;
  }

  /**
   * Format text for display (basic markdown/code support).
   * @param {string} text
   * @returns {string}
   */
  _formatText(text) {
    // Simple code block formatting
    return text
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/\n/g, "<br>");
  }
}

/**
 * ClaudeService abstracts Claude API calls via Puter.js.
 * Single Responsibility: Only handles communication with Claude.
 */
class ClaudeService {
  constructor(model = "claude-sonnet-4") {
    this.model = model;
  }

  /**
   * Send a prompt to Claude and stream the response.
   * @param {string} prompt
   * @param {function(string):void} onStream - Called with each chunk.
   * @returns {Promise<void>}
   */
  async sendMessage(prompt, onStream) {
    // Defensive: Check for Puter.js
    if (!window.puter || !puter.ai) {
      throw new Error("Puter.js is not loaded.");
    }
    const response = await puter.ai.chat(prompt, {
      model: this.model,
      stream: true,
    });
    let fullText = "";
    for await (const part of response) {
      if (part?.text) {
        fullText += part.text;
        onStream(fullText);
      }
    }
  }
}

/**
 * ChatController orchestrates user input, API calls, and UI updates.
 * Single Responsibility: Only coordinates between UI and services.
 */
class ChatController {
  constructor(form, input, chatArea, sendBtn) {
    this.form = form;
    this.input = input;
    this.sendBtn = sendBtn;
    this.clearBtn = document.getElementById("clear-btn");
    this.exportBtnContainer = document.getElementById("export-btn-container");
    this.renderer = new MessageRenderer(chatArea);
    this.claude = new ClaudeService();
    this._setupListeners();
    this._renderExportBtn(); // Initial render
  }

  /**
   * Set up event listeners for the chat form and clear button.
   */
  _setupListeners() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._handleUserInput();
    });
    // Add clear button event
    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => {
        this._handleClearChat();
        this._renderExportBtn(); // Hide export button on clear
      });
    }
  }

  /**
   * Handle user input and trigger Claude response.
   */
  async _handleUserInput() {
    const userText = this.input.value.trim();
    if (!userText) return;
    this.renderer.renderMessage(userText, "user");
    this.input.value = "";
    this.input.disabled = true;
    this.sendBtn.disabled = true;

    // Show bot message placeholder
    let botMsg = "";
    const botMsgId = `bot-msg-${Date.now()}`;
    this.renderer.renderMessage("...", "bot");
    const botBubble = this._getLastBotBubble();

    try {
      await this.claude.sendMessage(userText, (text) => {
        if (botBubble) botBubble.innerHTML = this.renderer._formatText(text);
      });
    } catch (err) {
      if (botBubble)
        botBubble.innerHTML = `<span style='color:red;'>${err.message}</span>`;
    } finally {
      this.input.disabled = false;
      this.sendBtn.disabled = false;
      this.input.focus();
      this._renderExportBtn(); // Show export button if bot response exists
    }
  }

  /**
   * Clear the chat area.
   */
  _handleClearChat() {
    this.renderer.chatArea.innerHTML = "";
    this.input.focus();
    this._renderExportBtn(); // Hide export button on clear
  }

  /**
   * Export the chat as a Markdown (.md) file.
   * Follows SRP: Only handles export logic.
   */
  _handleExportChat() {
    // Gather all messages from chat area
    const messages = Array.from(
      this.renderer.chatArea.querySelectorAll(".message")
    );
    if (messages.length === 0) {
      alert("No chat to export.");
      return;
    }
    // Format messages as markdown
    const lines = messages.map((msg) => {
      const sender = msg.classList.contains("user") ? "User" : "Bot";
      const bubble = msg.querySelector(".bubble");
      let text = bubble ? bubble.innerText : "";
      // If message looks like code, wrap in code block
      if (
        /^\s*([A-Za-z0-9_\-]+\s*=|function\s+|class\s+|#include|<\w+>|def |console\.|let |const |var |import |export |public |private |protected )/m.test(
          text
        )
      ) {
        text = `\n\n\n\n${text}\n\n`;
      }
      return `### ${sender}\n${text}`;
    });
    const content = lines.join("\n\n");
    // Create a Blob and trigger download
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coding-buddy-chat-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  /**
   * Render the Export Chat button if there is at least one bot response.
   */
  _renderExportBtn() {
    if (!this.exportBtnContainer) return;
    // Check if there is at least one bot message
    const hasBot = !!this.renderer.chatArea.querySelector(".message.bot");
    this.exportBtnContainer.innerHTML = "";
    if (hasBot) {
      // Create the button
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "export-btn";
      btn.setAttribute("aria-label", "Export chat");
      btn.textContent = "Export Chat";
      btn.className = "export-btn";
      btn.onclick = () => this._handleExportChat();
      this.exportBtnContainer.appendChild(btn);
    }
  }

  /**
   * Get the last bot message bubble in the chat area.
   * @returns {HTMLElement|null}
   */
  _getLastBotBubble() {
    const bubbles = document.querySelectorAll(".message.bot .bubble");
    return bubbles.length ? bubbles[bubbles.length - 1] : null;
  }
}

// Initialize the app when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatArea = document.getElementById("chat-area");
  const sendBtn = document.getElementById("send-btn");
  // Instantiate controller (entry point)
  new ChatController(form, input, chatArea, sendBtn);

  // Modal logic: show greeting modal on load
  const modal = document.getElementById("greeting-modal");
  const closeBtn = document.getElementById("close-greeting-modal");
  if (modal && closeBtn) {
    modal.style.display = "flex";
    // Trap focus inside modal for accessibility
    closeBtn.focus();
    // Close modal on button click
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (
        modal.style.display !== "none" &&
        (e.key === "Escape" || e.key === "Esc")
      ) {
        modal.style.display = "none";
      }
    });
  }
});
