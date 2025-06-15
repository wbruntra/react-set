// Simple test to verify Set game logic
const { isSet, makeDeck, nameThird } = require('./src/utils/helpers.ts');

console.log('Testing Set game logic...');

// Test makeDeck
const deck = makeDeck();
console.log('Deck created with', deck.length, 'cards');
console.log('First few cards:', deck.slice(0, 5));

// Test isSet function with known valid set
const validSet = ['0000', '1111', '2222'];
console.log('Testing valid set:', validSet, 'is set:', isSet(validSet));

// Test invalid set
const invalidSet = ['0000', '1111', '0222'];
console.log('Testing invalid set:', invalidSet, 'is set:', isSet(invalidSet));

// Test nameThird
const a = '0000';
const b = '1111';
const c = nameThird(a, b);
console.log('nameThird of', a, 'and', b, 'is', c);
console.log('Is [a, b, c] a valid set?', isSet([a, b, c]));
