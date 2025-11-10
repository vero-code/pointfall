// src/data/dialogues.js
export const OBJECTIVES = {
  1: "Talk to survivors",
  2: "Find the doctor",
  3: "Share a lollipop",
  4: "Open the door",
  5: "Carry Maya"
};

export const DIALOGUES = {
  // Normal scene dialogues
  normal: {
    lena_intro: {
      name: "LENA (You)",
      text: "Just another evening commute. Can't wait to get home..."
    },
    lexa: {
      name: "LEXA",
      text: "Look! My astronaut! Isn't he cool? I want to be like him when I grow up!"
    },
    david_normal: {
      name: "DAVID",
      text: "Easy there, champ. Hold on tight to your toy."
    },
    axton_normal: {
      name: "AXTON",
      text: "This train's running smooth today. Almost home."
    }
  },
  
  // Crashed scene dialogues
  crashed: {
    martha: {
      name: "MARTHA",
      // Level 1/2: Water
      water_prompt: "Don't waste it on me... save her... I beg you, give it to the child…",
      water_choice1: "[1] Give water bottle.",
      water_choice2: "[2] Save it for another.",
       // Level 3/4: Lollipop
      lollipop_prompt: "It seems the girl saw something we couldn't…",
      lollipop_choice1: "[1] Give lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Level 5: Carry
      carry_prompt: "This is our chance to get out…",
      carry_choice1: "[1] Go through the door.",
      carry_choice2: "[2] Ask for help with MAYA.",
      // Default text
      text: "Save the child..."
    },
    maya: {
      name: "MAYA",
      // Level 1/2: Water
      water_prompt: "My leg... please... it hurts so much...",
      water_choice1: "[1] Give water bottle.",
      water_choice2: "[2] Save it for another.",
      // Level 3/4: Lollipop
      lollipop_prompt: "My leg... please... it hurts so much...",
      lollipop_choice1: "[1] Share the lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Level 5: Carry
      carry_prompt: "My leg... please... it hurts so much...",
      carry_choice1: "[1] Help Maya to her feet.",
      carry_choice2: "[2] Find someone to help.",
      // Default text
      text: "My leg... it hurts so much..."
    },
    axton: {
      name: "AXTON",
      // Level 1/2: Water
      water_prompt: "I can't breathe... the dust... water...",
      water_choice1: "[1] Give water.",
      water_choice2: "[2] 'I have no water.' (Lie)",
      // Level 3/4: Lollipop
      lollipop_prompt: "I can't breathe... the dust... water...",
      lollipop_choice1: "[1] Give lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Level 5: Carry
      carry_prompt: "Let's go, quickly... before it closes again.",
      carry_choice1: "[1] Go through the door.",
      carry_choice2: "[2] Ask for help with MAYA.",
      // Default text
      text: "(Coughing violently from the dust)"
    },
    lexa: {
      name: "LEXA",
       // Level 1/2: Water
      water_prompt: "I don't feel good... my head is spinning… is my astronaut okay?...",
      water_choice1: "[1] Give water bottle.",
      water_choice2: "[2] Save it for another.",
       // Level 3/4: Lollipop
      lollipop_prompt: "My astronaut thinks the exit is over there... ",
      lollipop_choice1: "[1] Give lollipop.",
      lollipop_choice2: "[2] Save it for another.",
      // Level 5: Carry
      carry_prompt: "It's getting closer, let's get out of this horrible place... ",
      carry_choice1: "[1] Go through the door.",
      carry_choice2: "[2] Ask for help with MAYA.",
      // Default text
      text: "My astronaut..."
    },
    david: {
      name: "DAVID",
      // Level 1: Quest
      text_lvl1: "Find a doctor for my daughter! Please!",
      choice1_lvl1: "[1] Okay, I'll go ask the others.",
      // Level 3/4: Door choice
      door_prompt: "We have to break it down with force...",
      door_choice1: "[1] Agreed, it's the only way.",
      door_choice2: "[2] No, I'll look for an electrician.",
      // Level 5: Carry
      carry_prompt: "Yes, good thing we didn't break the door. A head can be useful sometimes...",
      carry_choice1: "[1] Go through the door.",
      carry_choice2: "[2] Ask for help with MAYA.",
      // Default text (on Level 1/2)
      text: "Find a doctor for my daughter! Please!"
    },
    lexa_toy: {
      name: "ASTRONAUT TOY",
      text: "Lexa's astronaut... She was holding it so tightly."
    }
  }
};