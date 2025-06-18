chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "START_PREDICTION") {
    const reviews = Array.from(
      document.querySelectorAll("div[data-hook='review-collapsed'] span")
    ).map((el) => el.textContent.trim());

    console.log("Found reviews:", reviews);

    for (const review of reviews) {
      const rating = await getPredictedRating(review);
      injectRating(review, rating);
    }
  }
});

async function getPredictedRating(reviewText) {
  try {
    const response = await fetch(
      "https://amazon-review-predictor.onrender.com/predict",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reviewText }),
      }
    );

    const result = await response.json();
    console.log("Prediction result:", result);

    const label = result?.result?.[0]?.label;
    const score = result?.result?.[0]?.score;
    console.log("Label:", label, "Score:", score);

    if (label === "LABEL_0") {
      // Negative review: Map score [0.5,1] -> rating [4,1]
      const rating = Math.round(4 - (score - 0.5) * 6);
      return Math.min(Math.max(rating, 1), 4);
    } else if (label === "LABEL_1") {
      // Positive review: Map score [0.5,1] -> rating [7,10]
      const rating = Math.round(7 + (score - 0.5) * 6);
      return Math.min(Math.max(rating, 7), 10);
    }
  } catch (err) {
    console.error("Error fetching prediction:", err);
  }

  // Fallback if something fails
  return 5;
}

function injectRating(reviewText, rating) {
  const reviewElements = document.querySelectorAll(
    "div[data-hook='review-collapsed'] span"
  );

  reviewElements.forEach((el) => {
    if (el.textContent.trim() === reviewText) {
      if (!el.querySelector(".predicted-rating")) {
        // Create container for the badge
        const badgeContainer = document.createElement("div");
        badgeContainer.className = "predicted-rating";
        badgeContainer.style.display = "flex";
        badgeContainer.style.alignItems = "center";
        badgeContainer.style.marginTop = "8px";

        // Create label element
        const labelElement = document.createElement("span");
        labelElement.innerText = "Review Rating : ";
        labelElement.style.fontWeight = "bold";
        labelElement.style.marginRight = "6px";

        // Create rating badge
        const badge = document.createElement("span");
        badge.innerText = rating;
        badge.style.backgroundColor = "#4CAF50"; // green
        badge.style.color = "#fff";
        badge.style.borderRadius = "50%";
        badge.style.width = "24px";
        badge.style.height = "24px";
        badge.style.display = "inline-flex";
        badge.style.alignItems = "center";
        badge.style.justifyContent = "center";
        badge.style.fontWeight = "bold";
        badge.style.fontSize = "14px";

        // Append to container
        badgeContainer.appendChild(labelElement);
        badgeContainer.appendChild(badge);

        el.appendChild(badgeContainer);
      }
    }
  });
}
