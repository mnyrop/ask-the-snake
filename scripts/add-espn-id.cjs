// Usage: node scripts/add-espn-id.js
// Adds espnID to each player in src/lib/players.js using src/lib/athletes.json
// If multiple athletes match a name, use the one with the latest dateOfBirth

const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../src/lib/players.js');
const athletesPath = path.join(__dirname, '../src/lib/athletes.json');
const outputPath = playersPath;

// Load athletes.json
const athletesRaw = fs.readFileSync(athletesPath, 'utf8');
const athletes = JSON.parse(athletesRaw).items;

// Build a map from fullName to array of athlete objects
const nameToAthletes = new Map();
for (const a of athletes) {
  if (a.fullName && a.id) {
    const name = a.fullName.trim();
    if (!nameToAthletes.has(name)) nameToAthletes.set(name, []);
    nameToAthletes.get(name).push(a);
  }
}

// Load players.js as JS, not JSON
let playersRaw = fs.readFileSync(playersPath, 'utf8');
const playersArrMatch = playersRaw.match(/export const players = (\[.*\]);/s);
if (!playersArrMatch) {
  throw new Error('Could not find players array in players.js');
}
let playersArrStr = playersArrMatch[1];
let playersArr = eval(playersArrStr); // playersArr is now an array of objects

// Add espnID to each player, prioritizing latest dateOfBirth
for (const p of playersArr) {
  const athletes = nameToAthletes.get(p.player);
  if (athletes && athletes.length > 0) {
    // Sort by dateOfBirth descending (latest first)
    athletes.sort((a, b) => {
      if (!a.dateOfBirth) return 1;
      if (!b.dateOfBirth) return -1;
      return new Date(b.dateOfBirth) - new Date(a.dateOfBirth);
    });
    p.espnID = athletes[0].id;
  } else {
    p.espnID = null;
  }
}

// Rebuild the file
const newPlayersArrStr = JSON.stringify(playersArr, null, 2)
  .replace(/"(\w+)":/g, '$1:') // remove quotes from keys
  .replace(/\"/g, '"'); // keep quotes in strings
const newFile = `export const players = ${newPlayersArrStr};\n`;

fs.writeFileSync(outputPath, newFile);

console.log('espnID added to all players (where found, prioritizing latest dateOfBirth).');
