document.addEventListener("DOMContentLoaded", () => {
  const userInput = document.getElementById("userInput");
  const submitBtn = document.getElementById("submitBtn");
  const loader = document.getElementById("loader");
  const responseContainer = document.getElementById("responseContainer");
  const aiResponse = document.getElementById("aiResponse");
  const btnText = submitBtn.querySelector("span");

  function setLoading(state) {
    submitBtn.disabled = state;
    loader.style.display = state ? "block" : "none";
    btnText.style.display = state ? "none" : "block";
  }

  async function generateResponse() {
    const message = userInput.value.trim();
    if (!message) return;

    setLoading(true);
    responseContainer.classList.add("hidden");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const raw = await res.text();
      let data;

      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Server returned non-JSON response");
      }

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      aiResponse.textContent = data.reply;
      responseContainer.classList.remove("hidden");
    } catch (err) {
      aiResponse.textContent = `Error: ${err.message}`;
      responseContainer.classList.remove("hidden");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  submitBtn.addEventListener("click", generateResponse);

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      generateResponse();
    }
  });
});