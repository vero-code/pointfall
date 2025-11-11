// src/data/dialogues.js
export const OBJECTIVES = {
  1: "Talk to survivors",
  2: "Find the doctor",
  3: "Share a lollipop",
  4: "Open the door",
  5: "Carry Maya"
};

export const DIALOGUES = { 
  crashed: {
    axton: {
      name: "AXTON",
      // Lvl 1 Clue
      text_lvl1: "That guy, David... he wants to clear the way with brute force. Strong, sure — he’s a trainer, after all. But muscle alone won’t save us down here.",
      clue_choice1: "[1] I see.",
      // Lvl 2 Water
      water_prompt: "I can't breathe... the dust... water...",
      water_choice1: "[1] Give water.",
      water_choice2: "[2] Save it for another.",
      // Lvl 3 Lollipop
      lollipop_prompt: "I can't breathe... the dust... water...",
      lollipop_choice1: "[1] Share the lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Lvl 4 Door
      door_prompt: "Thanks for the lollipop. My throat isn't sore anymore...",
      door_choice1: "[1] Ask to open the door.",
      door_choice2: "[2] Keep silent.",
      // Lvl 5 Carry
      carry_prompt: "Let's go, quickly... before it closes again.",
      carry_choice1: "[1] Ask for help with MAYA.",
      carry_choice2: "[2] (Nevermind)",
      // Default
      text: "(Coughing violently from the dust)"
    },
    david: {
      name: "DAVID",
      // Lvl 1 Clue
      text_lvl1: "That girl... Maya... she said she’s a med student. Not a real doctor yet, but it’s something. I’d trust her with first aid more than anyone else here.",
      choice1_lvl1: "[1] I'll find someone to help.",
      // Lvl 2 Water
      water_prompt: "Help me find a doctor for my daughter...",
      water_choice1: "[1] Give water.",
      water_choice2: "[2] Save it for another.",
      // Lvl 3 Lollipop
      lollipop_prompt: "Thanks for finding a doctor. Come on, Lexa, come back to us!",
      lollipop_choice1: "[1] Share the lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Lvl 4 Door
      door_prompt: "Thanks for your help. Let me help you with the door.",
      door_choice1: "[1] Ask to open the door.",
      door_choice2: "[2] Keep silent.",
      // Lvl 5 Carry
      carry_prompt: "Yes, good thing we didn't break the door. A head can be useful sometimes...",
      carry_choice1: "[1] Ask for help with MAYA.",
      carry_choice2: "[2] (Nevermind)",
      // Default
      text: "Find a doctor for my daughter! Please!"
    },
    lexa: {
      name: "LEXA",
      // Lvl 1 Clue
      text_lvl1: "I saw that woman — Martha… She moved fast, helped a man before the crash. The way she held his arm... She knows medicine... she’s a nurse. I can see it.",
      clue_choice1: "[1] I see.",
      // Lvl 2 Water
      water_prompt: "I don't feel good... my head is spinning… is my astronaut okay?...",
      water_choice1: "[1] Give water.",
      water_choice2: "[2] Save it for another.",
      // Lvl 3 Lollipop
      lollipop_prompt: "...",
      lollipop_choice1: "[1] Share the lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Lvl 4 Door
      door_prompt: "My astronaut thinks the exit is over there!",
      door_choice1: "[1] Ask to open the door.",
      door_choice2: "[2] Keep silent.",
      // Lvl 5 Carry
      carry_prompt: "It's getting closer, let's get out of this horrible place...",
      carry_choice1: "[1] Ask for help with MAYA.",
      carry_choice2: "[2] (Nevermind)",
      // Default
      text: "My astronaut..."
    },
    martha: {
      name: "MARTHA",
      // Lvl 1 Clue
      text_lvl1: "Poor Lexa... that girl’s vision is too sharp for this world. She keeps staring into the dark. Says she sees things we don’t. Maybe she’s right... maybe she’s not.",
      clue_choice1: "[1] I see.",
      // Lvl 2 Water
      water_prompt: "Don't waste it on me... save her... I beg you, give it to the child…",
      water_choice1: "[1] Give water.",
      water_choice2: "[2] Save it for another.",
      // Lvl 3 Lollipop
      lollipop_prompt: "...",
      lollipop_choice1: "[1] Share the lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Lvl 4 Door
      door_prompt: "It seems the girl saw something we couldn't...",
      door_choice1: "[1] Ask to open the door.",
      door_choice2: "[2] Keep silent.",
      // Lvl 5 Carry
      carry_prompt: "This is our chance to get out... But what about Maya, we need to help her!",
      carry_choice1: "[1] Ask for help with MAYA.",
      carry_choice2: "[2] (Nevermind)",
      // Default
      text: "Save the child..."
    },
    maya: {
      name: "MAYA",
      // Lvl 1 Clue
      text_lvl1: "Axton… that engineer… he tried to help me earlier. He’s not just muscles — he’s smart, calculating. If anyone can rebuild something down here, it’s him.",
      clue_choice1: "[1] I see.",
      // Lvl 2 Water
      water_prompt: "My leg... ugh... I'm a med student, but I can't even look at it…",
      water_choice1: "[1] Give water.",
      water_choice2: "[2] Save it for another.",
      // Lvl 3 Lollipop
      lollipop_prompt: "My leg... ugh... I'm a med student, but I can't even look at it…",
      lollipop_choice1: "[1] Share the lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Lvl 4 Door
      door_prompt: "My leg... ugh... I'm a med student, but I can't even look at it…",
      door_choice1: "[1] Ask to open the door.",
      door_choice2: "[2] Keep silent.",
      // Lvl 5 Carry
      carry_prompt: "I want to go with you, but my leg hurts like crazy. Help me!",
      carry_choice1: "[1] I'll help you. Grab me!",
      carry_choice2: "[2] (Nevermind)",
      // Default
      text: "My leg... it hurts so much...",
    },
    lexa_toy: {
      name: "ASTRONAUT TOY",
      text_lvl1: "Lexa's astronaut... She was holding it so tightly.",
      clue_choice1: "[1] I see."
    }
  }
};