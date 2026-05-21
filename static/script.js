document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.replace();
  }

  const form = document.getElementById('prediction-form');
  const yearInput = document.getElementById('year');
  const kmsInput = document.getElementById('kms_driven');
  const resultCard = document.getElementById('result-card');
  const amountNode = document.getElementById('predicted-amount');
  const loadingOverlay = document.getElementById('loading-overlay');
  const messageNode = document.getElementById('form-message');
  const suggestionNode = document.getElementById('model-suggestion');
  const resultTextNode = document.querySelector('.result-text');

  const displayMessage = (message, isError = true) => {
    messageNode.textContent = message;
    messageNode.style.color = isError ? '#fda4af' : '#86efac';
  };

  const animateCounter = (start, end, duration = 1400) => {
    const startTime = performance.now();
    const frame = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const value = start + (end - start) * easeOutQuad(progress);
      amountNode.textContent = formatINR(value);
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  };

  const easeOutQuad = (t) => t * (2 - t);

  const formatINR = (value) => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const toggleLoading = (show) => {
    loadingOverlay.classList.toggle('active', show);
  };

  const validate = () => {
    const year = parseInt(yearInput.value, 10);
    const kms = parseFloat(kmsInput.value);
    if (!year || year < 1900 || year > 2035) {
      displayMessage('Please enter a valid year between 1900 and 2035.');
      return false;
    }
    if (Number.isNaN(kms) || kms < 0) {
      displayMessage('Please enter a valid kilometers driven value.');
      return false;
    }
    displayMessage('', false);
    return true;
  };

  document.querySelectorAll('.primary-button, .nav-links a').forEach((button) => {
    button.addEventListener('click', (event) => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = button.getBoundingClientRect();
      ripple.style.left = event.clientX - rect.left + 'px';
      ripple.style.top = event.clientY - rect.top + 'px';
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      year: yearInput.value,
      kms_driven: kmsInput.value,
    };

    toggleLoading(true);
    displayMessage('Processing prediction...', false);

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to predict price');
      }

      const predictedValue = parseFloat(result.prediction);
      const suggestion = result.model_suggestion || 'Explore top resale models based on your input.';
      suggestionNode.textContent = `Suggested models: ${suggestion}`;
      resultTextNode.textContent = predictedValue > 0 ? 'Estimated resale price for your car based on input trends.' : 'No significant resale value detected; double-check your details.';
      animateCounter(0, predictedValue);
      resultCard.classList.add('active');
      displayMessage('Prediction complete!', false);
    } catch (error) {
      suggestionNode.textContent = '';
      amountNode.textContent = '0.00';
      resultTextNode.textContent = 'There was an issue generating the price. Please adjust the values and try again.';
      displayMessage(error.message || 'Something went wrong.');
    } finally {
      toggleLoading(false);
    }
  });

  yearInput.addEventListener('focus', () => yearInput.parentElement.classList.add('focus'));
  yearInput.addEventListener('blur', () => yearInput.parentElement.classList.remove('focus'));
  kmsInput.addEventListener('focus', () => kmsInput.parentElement.classList.add('focus'));
  kmsInput.addEventListener('blur', () => kmsInput.parentElement.classList.remove('focus'));
});
