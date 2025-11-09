// src/data/dialogues.js
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
      prompt: "Don't waste it on me... save her... please, give it to the child...",
      choice1: "[1] Give her the water anyway.",
      choice2: "[2] Save it.",
      text_no_water: "Please... the child... she's not breathing right..."
    },
    maya: {
      name: "MAYA",
      prompt: "My leg... please... it hurts so much...",
      choice1: "[1] Give water.",
      choice2: "[2] Save it for someone else.",
      text_no_water: "It hurts... please, someone help..."
    },
    axton: {
      name: "AXTON",
      prompt: "I can't breathe... the dust... water...",
      choice1: "[1] Give water.",
      choice2: "[2] 'I don't have any.' (Lie)",
      text_no_water: "(He's coughing violently, unable to speak.)"
    },
    lexa: {
      name: "LEXA",
      prompt: "I don't feel good... my head is spinning... is my astronaut okay?...",
      choice1: "[1] Give water.",
      choice2: "[2] Save it for someone else.",
      text_no_water: "(She's unconscious.)"
    },
    david: {
      name: "DAVID",
      text: "Find a doctor for my daughter! Please!",
    },
    lexa_toy: {
      name: "ASTRONAUT TOY",
      text: "Lexa's astronaut... She was holding it so tightly."
    }
  }
};