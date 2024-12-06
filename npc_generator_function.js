// npc_generator_function.js

// Function to randomly generate values for different attributes
function generateNPC() {
    if (!window.npcLocationData || !window.speciesData || !window.pronounsData || !window.occupationsData || !window.renownData || !window.religiousnessData || !window.patronsData) {
        console.error('Data not loaded yet. Cannot generate NPC.');
        return;
    }
    window.npcLocation = fetchRandomValue(window.npcLocationData.locations.map(item => item.value));
    window.species = fetchRandomValue(window.speciesData.map(item => item.value));
    window.pronouns = fetchRandomValue(window.pronounsData.default.map(item => item.value));
    window.age = Math.floor(16 + Math.pow(Math.random(), 2) * 84); // Bell curve around 30
    window.occupation = fetchRandomValue(window.occupationsData.occupations.map(item => item.value));
    window.renown = fetchRandomRenown();
    window.religiousness = fetchRandomValue(Object.keys(window.religiousnessData));
    window.patron = fetchRandomPatron();
}

// Function to regenerate a single value without modifying other attributes
function regenerateValue(attribute) {
    if (!window.npcLocationData || !window.speciesData || !window.pronounsData || !window.occupationsData || !window.renownData || !window.religiousnessData || !window.patronsData) {
        console.error('Data not loaded yet. Cannot regenerate value.');
        return;
    }
    switch (attribute) {
        case 'npc-location':
            window.npcLocation = fetchRandomValue(window.npcLocationData.locations.map(item => item.value));
            document.getElementById('npc-location').textContent = window.npcLocation;
            break;
        case 'npc-species':
            window.species = fetchRandomValue(window.speciesData.map(item => item.value));
            document.getElementById('npc-species').textContent = window.species;
            break;
        case 'npc-pronouns':
            window.pronouns = fetchRandomValue(window.pronounsData.default.map(item => item.value));
            document.getElementById('npc-pronouns').textContent = window.pronouns;
            break;
        case 'npc-age':
            window.age = Math.floor(16 + Math.pow(Math.random(), 2) * 84); // Bell curve around 30
            document.getElementById('npc-age').textContent = window.age;
            break;
        case 'npc-occupation':
            window.occupation = fetchRandomValue(window.occupationsData.occupations.map(item => item.value));
            document.getElementById('npc-occupation').textContent = window.occupation;
            break;
        case 'npc-renown':
            window.renown = fetchRandomRenown();
            document.getElementById('npc-renown').textContent = `${window.renown.local} (local), ${window.renown.wider} (wider)`;
            break;
        case 'npc-religiousness':
            window.religiousness = fetchRandomValue(Object.keys(window.religiousnessData));
            document.getElementById('npc-religiousness').textContent = window.religiousness;
            break;
        case 'npc-patron':
            window.patron = fetchRandomPatron();
            document.getElementById('npc-patron').textContent = `${window.patron.primary} - ${window.patron.secondary}`;
            break;
    }
}

// Helper function to fetch a random value from an array
function fetchRandomValue(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

// Function to fetch random renown
function fetchRandomRenown() {
    const localRenownIndex = Math.floor(Math.random() * window.renownData.renown.length);
    const localRenown = window.renownData.renown[localRenownIndex].value;
    const widerRenownIndex = Math.floor(Math.random() * (localRenownIndex + 1)); // Cannot be higher than local
    const widerRenown = window.renownData.renown[widerRenownIndex].value;
    return { local: localRenown, wider: widerRenown };
}

// Function to fetch random patron based on religiousness level
function fetchRandomPatron() {
    let primary;
    if (window.religiousness === 'Hostile' || window.religiousness === 'Opposed' || window.religiousness === 'Skeptical') {
        primary = 'Atheist';
    } else {
        primary = fetchRandomValue(Object.keys(window.patronsData));
    }
    const secondaryList = window.patronsData[primary];
    const secondary = secondaryList.secondary ? fetchRandomValue(secondaryList.secondary).value : 'None';
    return { primary, secondary };
}

// Function to initialize and display NPC data
function displayNPC() {
    document.getElementById('npc-location').textContent = window.npcLocation;
    document.getElementById('npc-species').textContent = window.species;
    document.getElementById('npc-pronouns').textContent = window.pronouns;
    document.getElementById('npc-age').textContent = window.age;
    document.getElementById('npc-occupation').textContent = window.occupation;
    document.getElementById('npc-renown').textContent = `${window.renown.local} (local), ${window.renown.wider} (wider)`;
    document.getElementById('npc-religiousness').textContent = window.religiousness;
    document.getElementById('npc-patron').textContent = `${window.patron.primary} - ${window.patron.secondary}`;
}

// Event listener for the randomize button
document.getElementById('randomize-button').addEventListener('click', function () {
    generateNPC();
    displayNPC();
});

// Wait for all data to be loaded before generating and displaying NPC data
document.addEventListener('dataLoaded', () => {
    generateNPC();
    displayNPC();
});
