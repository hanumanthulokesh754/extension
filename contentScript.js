// contentScript.js — lightweight page marker injected before translation.
// The actual translation logic lives in popup.js (inPageTranslate),
// which is injected as a function via chrome.scripting.executeScript.
// This file is kept for compatibility and future use.
(function () {
  // Mark the page so we know translation has been triggered
  document.body.setAttribute('data-sumly-translated', 'true');
  return { ready: true };
})();
