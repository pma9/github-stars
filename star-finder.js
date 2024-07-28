async function main() {
  console.log("Star Finder is running");

  const createBadge = (stars) => {
    let badgeColor;
    switch (true) {
      case stars < 100:
        badgeColor = "gray";
        break;
      case stars >= 100 && stars < 1000:
        badgeColor = "yellow";
        break;
      case stars >= 1000 && stars < 2000:
        badgeColor = "blue";
        break;
      case stars >= 2000 && stars < 5000:
        badgeColor = "green";
        break;
      case stars >= 5000:
        badgeColor = "red";
        break;
    }

    return `
      <div class="star-badge">
        <div class="star-badge-name">
          <span>⭐️</span>
        </div>
        <div class="star-badge-count ${badgeColor}">
          <span>${stars}</span>
        </div>
      </div>
    `;
  };

  const { pat } = await chrome.storage.local.get("pat");

  if (pat == null) {
    alert("Github Stars: No PAT found in storage, but you can add it in the extension options");
    console.log("Github Stars: No PAT found in storage");
    return;
  }

  const anchorTags = document.querySelectorAll("a");

  const promises = [];
  anchorTags.forEach((anchorTag) => {
    // To deal with badges
    if (anchorTag.children.length > 0) {
      return;
    }

    const anchorHref = (() => {
      try {
        return new URL(anchorTag.href);
      } catch (e) {
        return null;
      }
    })();

    if (anchorHref?.hostname === "github.com") {
      pathSplit = anchorHref.pathname.split("/");
      if (pathSplit.length >= 3) {
        promises.push(
          (async () => {
            const response = await fetch(`https://api.github.com/repos/${pathSplit[1]}/${pathSplit[2]}`, {
              headers: {
                Authorization: `Bearer ${pat}`,
              },
            });
            if (response.ok) {
              const data = await response.json();
              anchorTag.insertAdjacentHTML("beforebegin", createBadge(data.stargazers_count));
            }
          })()
        );
      }
    }
  });

  const results = await Promise.allSettled(promises);
  console.log("All stars found");
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(result.reason);
    }
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["star-finder.css"],
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: main,
  });
});
