document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('userInput');
    const submitBtn = document.getElementById('submitBtn');
    const loader = document.getElementById('loader');
    const responseContainer = document.getElementById('responseContainer');
    const aiResponse = document.getElementById('aiResponse');
    const btnText = submitBtn.querySelector('span');

    const toggleLoading = (isLoading) => {
        submitBtn.disabled = isLoading;
        loader.style.display = isLoading ? 'block' : 'none';
        btnText.style.display = isLoading ? 'none' : 'block';
    };

    const generateResponse = async () => {
        const message = userInput.value.trim();
        if (!message) return;

        toggleLoading(true);
        responseContainer.classList.add('hidden');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle OpenAI-compatible response structure
                const content = data.choices[0].message.content;
                aiResponse.textContent = content;
                responseContainer.classList.remove('hidden');
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Error:', error);
            aiResponse.textContent = `Error: ${error.message}`;
            responseContainer.classList.remove('hidden');
        } finally {
            toggleLoading(false);
        }
    };

    submitBtn.addEventListener('click', generateResponse);

    // Allow Ctrl+Enter to submit
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            generateResponse();
        }
    });
});
