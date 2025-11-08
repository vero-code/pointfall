
export const survivorsData = [
  { name: 'axton', 
    pos: [-1.5, 0.4, -2], 
    color: 0x6a4a8a, 
    type: 'standing'
  },
  { 
    name: 'martha', 
    pos: [-1.5, 0, 2], 
    type: 'model', 
    modelPath: '/models/grandma.fbx', 
    scale: 0.4
  },
  { 
    name: 'gladwin', 
    pos: [-0.8, 0.8, -4], 
    type: 'model', 
    modelPath: '/models/grandpa.glb', 
    scale: 0.4, 
    elderly: true },
  { 
    name: 'david', 
    pos: [1, 0.4, -3], 
    color: 0x6a4a8a, 
    type: 'standing'
  },
  { 
    name: 'volt', 
    pos: [1.2, 0.15, -2.5], 
    color: 0xf4a460, 
    type: 'injured',
    child: true
  },
  { 
    name: 'maya',
    pos: [1.5, 0.3, 1],
    color: 0x6a4a8a, 
    type: 'standing'
  }
];