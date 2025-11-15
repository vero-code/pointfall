// src/utils/uiManager.js

let elements = {};

/**
 * Initializes the manager by getting all the required DOM elements.
 */
function init(uiElements) {
  elements = uiElements;
}

function updateObjective(level, text, totalLevels) {
  if (elements.levelEl) {
    elements.levelEl.textContent = `${level} / ${totalLevels}`;
  }
  if (elements.objectiveTextEl) {
    elements.objectiveTextEl.innerHTML = text;
  }
}

function updateInventoryUI(inventory) {
  if (!elements.inventoryItemsEl) return;
  elements.inventoryItemsEl.innerHTML = "";
  let itemsFound = false;

  if (inventory.water > 0) {
    elements.inventoryItemsEl.innerHTML += `
      <div class="item">
        <span class="item-icon">💧</span>
        <span class="item-name">Water Bottle (1)</span>
      </div>`;
    itemsFound = true;
  }
  if (inventory.lollipop > 0) {
    elements.inventoryItemsEl.innerHTML += `
      <div class="item">
        <span class="item-icon">🍭</span>
        <span class="item-name">Lollipop (1)</span>
      </div>`;
    itemsFound = true;
  }
  if (!itemsFound) {
    elements.inventoryItemsEl.innerHTML = `<div class="item"><span class="item-name">(empty)</span></div>`;
  }
}

function showChoiceBox(
  speaker,
  prompt,
  btn1Text,
  btn1Callback,
  btn2Text,
  btn2Callback
) {
  elements.crosshair.classList.add("hidden");

  elements.choiceSpeaker.textContent = speaker;
  elements.choicePrompt.textContent = prompt;

  elements.choiceBtn1.textContent = btn1Text;
  elements.choiceBtn1.onclick = btn1Callback;

  if (btn2Text) {
    elements.choiceBtn2.textContent = btn2Text;
    elements.choiceBtn2.onclick = btn2Callback;
    elements.choiceBtn2.classList.remove("hidden");
  } else {
    elements.choiceBtn2.classList.add("hidden");
  }

  elements.choiceBox.classList.add("active");
}

function hideChoiceBox(controls) {
  elements.choiceBox.classList.remove("active");
  elements.crosshair.classList.remove("hidden");
  controls.lock();
}

function showEnding(title, subtitle) {
  elements.endTitle.textContent = title;
  elements.endSubtitle.textContent = subtitle;
  elements.endScreen.classList.remove("hidden");
  elements.crosshair.classList.add("hidden");
}

function showDialogue(name, text) {
  elements.dialogueSpeaker.textContent = name;
  elements.dialogueText.textContent = text || "(The character is silent)";
  elements.dialogueBox.classList.add("active");
}

function hideDialogue() {
  elements.dialogueBox.classList.remove("active");
}

function showPauseMenu() {
  elements.pauseMenu.classList.remove("hidden");
  elements.crosshair.classList.add("hidden");
}

function hidePauseMenu() {
  elements.pauseMenu.classList.add("hidden");
  elements.crosshair.classList.remove("hidden");
}

export const uiManager = {
  init,
  updateObjective,
  updateInventoryUI,
  showChoiceBox,
  hideChoiceBox,
  showEnding,
  showDialogue,
  hideDialogue,
  showPauseMenu,
  hidePauseMenu,
};
