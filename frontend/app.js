// JavaScript App Logic
console.log("Dashboard Loaded");

// === RAG Q&A Connection ===
document.addEventListener("DOMContentLoaded", () => {
  const questionEl = document.getElementById("question");
  const askBtn = document.getElementById("ask-btn");
  const answerEl = document.getElementById("answer");
  const chatBoxSidebar = document.getElementById("chat-history");
  const chatBoxInline = document.getElementById("chat-history-inline");
  const clearChatBtn = document.getElementById("clear-chat-btn");
  const exportBtn = document.getElementById("export-chat-btn");
  const scrollBtn = document.getElementById("scroll-bottom");
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggle-sidebar");
  const darkToggle = document.getElementById("dark-mode-toggle");
  const micBtn = document.getElementById("mic-btn");
  const waveform = document.getElementById("waveform");

  /* Language map */
  const langMap = {
    eng: "en-US",
    spa: "es-ES",
    fra: "fr-FR",
    deu: "de-DE",
    ita: "it-IT",
    por: "pt-PT",
    rus: "ru-RU",
    amh: "am-ET",
    ara: "ar-SA",
    som: "so-SO",
    tgl: "tl-PH",
  };

  /* Suggested questions */
  document.querySelectorAll(".suggestion").forEach((item) => {
    item.addEventListener("click", () => {
      questionEl.value = item.textContent;
    });
  });

  /* Autocomplete */
  const autocompleteList = [
    "What is the equity score?",
    "How do you calculate transit access?",
    "Which datasets are used?",
    "What are the limitations?",
  ];

  questionEl.addEventListener("input", () => {
    const value = questionEl.value.toLowerCase();
    const match = autocompleteList.find((q) =>
      q.toLowerCase().startsWith(value),
    );
    if (match && value.length > 2) {
      questionEl.value = match;
    }
  });

  /* Dark mode */
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  /* Sidebar */
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  /* Scroll to bottom */
  chatBoxSidebar.addEventListener("scroll", () => {
    scrollBtn.style.display =
      chatBoxSidebar.scrollTop < chatBoxSidebar.scrollHeight - 400
        ? "block"
        : "none";
  });

  scrollBtn.addEventListener("click", () => {
    chatBoxSidebar.scrollTop = chatBoxSidebar.scrollHeight;
  });

  /* Clear chat */
  clearChatBtn.addEventListener("click", () => {
    chatBoxSidebar.innerHTML = "";
    chatBoxInline.innerHTML = "";
    answerEl.innerHTML = "";
  });

  /* Export chat */
  exportBtn.addEventListener("click", () => {
    const text = chatBoxSidebar.innerText;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_history.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  /* Noise reduction */
  let noiseReducedStream = null;

  async function initNoiseReducedAudio() {
    try {
      noiseReducedStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      console.warn("Noise reduction not supported.");
    }
  }
  initNoiseReducedAudio();

  /* Auto-detect language */
  async function detectLanguageFromAudio() {
    if (!noiseReducedStream || typeof franc === "undefined") return "en-US";

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(noiseReducedStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    return new Promise((resolve) => {
      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const signature = Array.from(input.slice(0, 2000))
          .map((v) => String.fromCharCode(Math.floor((v + 1) * 50)))
          .join("");

        const detected = franc(signature);
        const lang = langMap[detected] || "en-US";

        resolve(lang);

        processor.disconnect();
        source.disconnect();
        audioContext.close();
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    });
  }

  /* Translate to English (Mode A) */
  async function translateToEnglish(text, sourceLang) {
    try {
      const response = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: sourceLang.split("-")[0],
          target: "en",
          format: "text",
        }),
      });

      const data = await response.json();
      return data.translatedText || text;
    } catch {
      console.warn("Translation failed, using original text.");
      return text;
    }
  }

  /* Speech recognition */
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isRecording = false;
  let keyRecording = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    if (noiseReducedStream) recognition.stream = noiseReducedStream;

    recognition.onresult = (event) => {
      let liveTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        liveTranscript += event.results[i][0].transcript;
      }
      questionEl.value = liveTranscript;
    };

    recognition.onerror = () => {
      micBtn.textContent = "🎤";
      waveform.classList.add("hidden");
    };

    recognition.onend = () => {
      if (isRecording || keyRecording) recognition.start();
    };
  }

  /* Push-to-talk (mouse) */
  if (recognition) {
    micBtn.addEventListener("mousedown", async () => {
      isRecording = true;
      micBtn.textContent = "🎙️";
      waveform.classList.remove("hidden");

      const detectedLang = await detectLanguageFromAudio();
      recognition.lang = detectedLang;

      recognition.start();
    });

    micBtn.addEventListener("mouseup", () => {
      isRecording = false;
      micBtn.textContent = "🎤";
      waveform.classList.add("hidden");
      recognition.stop();
    });

    micBtn.addEventListener("mouseleave", () => {
      if (isRecording) {
        isRecording = false;
        micBtn.textContent = "🎤";
        waveform.classList.add("hidden");
        recognition.stop();
      }
    });

    /* Mobile touch */
    micBtn.addEventListener("touchstart", async (e) => {
      e.preventDefault();
      isRecording = true;
      micBtn.textContent = "🎙️";
      waveform.classList.remove("hidden");

      const detectedLang = await detectLanguageFromAudio();
      recognition.lang = detectedLang;

      recognition.start();
    });

    micBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      isRecording = false;
      micBtn.textContent = "🎤";
      waveform.classList.add("hidden");
      recognition.stop();
    });

    micBtn.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      isRecording = false;
      micBtn.textContent = "🎤";
      waveform.classList.add("hidden");
      recognition.stop();
    });

    /* Keyboard push-to-talk */
    document.addEventListener("keydown", (e) => {
      if (keyRecording) return;
      if (["Space", "ShiftLeft", "ShiftRight"].includes(e.code)) {
        keyRecording = true;
        micBtn.textContent = "🎙️";
        waveform.classList.remove("hidden");
        recognition.start();
      }
    });

    document.addEventListener("keyup", (e) => {
      if (["Space", "ShiftLeft", "ShiftRight"].includes(e.code)) {
        keyRecording = false;
        micBtn.textContent = "🎤";
        waveform.classList.add("hidden");
        recognition.stop();
      }
    });
  }

  /* Enter-to-send */
  questionEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") askBtn.click();
  });

  /* Ask button */
  askBtn.addEventListener("click", async () => {
    let question = questionEl.value.trim();
    if (!question) {
      answerEl.textContent = "Please enter a question.";
      return;
    }

    // Show thinking indicator
    answerEl.innerHTML = `<span class="typing-indicator">Thinking…</span>`;

    // Determine detected language from recognition (if available)
    let detectedLang = recognition ? recognition.lang : "en-US";

    // Auto-translate to English if not already English
    if (detectedLang !== "en-US") {
      const originalQuestion = question;
      question = await translateToEnglish(question, detectedLang);

      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Show original + translated question in sidebar chat
      chatBoxSidebar.innerHTML += `
        <div class="msg-row">
          <div class="chat-message">
            <div class="chat-question">(${detectedLang}) ${originalQuestion}</div>
            <div class="timestamp">${now}</div>
          </div>
        </div>
        <div class="msg-row">
          <div class="chat-message">
            <div class="chat-answer">Translated to English: ${question}</div>
            <div class="timestamp">${now}</div>
          </div>
        </div>
      `;
      chatBoxSidebar.scrollTop = chatBoxSidebar.scrollHeight;
      chatBoxInline.innerHTML = chatBoxSidebar.innerHTML;
    }

    // Typing indicator in chat
    const typingId = "typing-indicator";
    chatBoxSidebar.innerHTML += `<div id="${typingId}" class="typing-indicator">Assistant is typing…</div>`;
    chatBoxSidebar.scrollTop = chatBoxSidebar.scrollHeight;

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question,
          top_k: 3,
        }),
      });

      const data = await response.json();
      const answer = data.answer || "No answer returned.";

      // Remove typing indicator
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Add final Q&A to chat
      chatBoxSidebar.innerHTML += `
        <div class="msg-row">
          <div class="chat-message">
            <div class="chat-question">You: ${question}</div>
            <div class="timestamp">${now}</div>
          </div>
        </div>
        <div class="msg-row">
          <div class="chat-message">
            <div class="chat-answer">${answer.replace(/\n/g, "<br>")}</div>
            <div class="timestamp">${now}</div>
          </div>
        </div>
      `;
      chatBoxSidebar.scrollTop = chatBoxSidebar.scrollHeight;

      // Mirror in inline chat
      chatBoxInline.innerHTML = chatBoxSidebar.innerHTML;

      // Show answer in main panel
      answerEl.innerHTML = `<p>${answer.replace(/\n/g, "<br>")}</p>`;
    } catch (err) {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();
      answerEl.textContent = "Could not reach the RAG API.";
    }
  });
});
