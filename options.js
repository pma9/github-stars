// Saves options to chrome.storage
const saveOptions = () => {
  const pat = document.getElementById("pat").value;

  chrome.storage.local.set({ pat }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById("status");
    status.textContent = "Saved!";
    setTimeout(() => {
      status.textContent = "";
    }, 750);
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.local.get("pat", (items) => {
    if (items.pat != null) {
      const trun = "**********" + items.pat.slice(-10);
      document.getElementById("pat").value = trun;
    }
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
