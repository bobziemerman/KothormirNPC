// npc_generator_function.js

function generateNPC() {
    // Get selected options
    const selectedLocation = document.getElementById('location-dropdown').value;
    const selectedSpecies = document.getElementById('species-dropdown').value;
    const selectedPronouns = document.getElementById('pronouns-dropdown').value;
    const selectedReligiousness = document.getElementById('religiousness-dropdown').value;
    const selectedPatron = document.getElementById('patron-dropdown').value;
    const selectedOccupation = document.getElementById('occupation-dropdown').value;
    const selectedRenown = document.getElementById('renown-dropdown').value;

    // Select a location, either randomly or from dropdown
    const location = selectedLocation === 'Random' ? weightedRandomSelection(window.locationsData.locations) : selectedLocation;
    let locationText = location;
    const locationDataItem = window.locationsData.locations.find(loc => loc.value === location);
    if (locationDataItem && locationDataItem.secondary) {
        const randomSecondaryLocation = weightedRandomSelection(locationDataItem.secondary);
        locationText = `${location} - ${randomSecondaryLocation}`;
    }
    document.getElementById('npc-location').innerText = locationText;

    // Select a species, either randomly or from dropdown
    const species = selectedSpecies === 'Random' ? weightedRandomSelection(window.speciesData) : selectedSpecies;
    document.getElementById('npc-species').innerText = species;

    // Determine pronouns, either randomly or from dropdown
    const pronounsOptions = window.pronounsData[`species-${species}`] || window.pronounsData['default'];
    const pronouns = selectedPronouns === 'Random' ? weightedRandomSelection(pronounsOptions) : selectedPronouns;
    document.getElementById('npc-pronouns').innerText = pronouns;

    // Determine name based on species and pronouns
    const speciesNames = window.namesData[`species-${species}`] || window.namesData['default'];
    const nameOptions = speciesNames[pronouns] || [];
    const randomName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
    document.getElementById('npc-name').innerText = randomName;

    // Determine religiousness, either randomly or from dropdown
    const religiousness = selectedReligiousness === 'Random' ? weightedRandomSelection(Object.entries(window.religiousnessData).map(([key, value]) => ({ value: key, weight: value.weight }))) : selectedReligiousness;
    document.getElementById('npc-religiousness').innerText = religiousness;

    // Determine patron, either randomly or from dropdown
    let patronText = 'N/A';
    if (religiousness !== 'Indifferent') {
        if (selectedPatron === 'Random') {
            let patronOptions;
            if (religiousness === 'Hostile' || religiousness === 'Opposed' || religiousness === 'Skeptical') {
                patronOptions = [{ value: 'Atheist', weight: window.patronsData['Atheist'].weight }];
            } else {
                patronOptions = Object.entries(window.patronsData).filter(([key]) => key !== 'Atheist').map(([key, value]) => ({ value: key, weight: value.weight }));
            }
            const randomPatron = weightedRandomSelection(patronOptions);
            const secondaryOptions = window.patronsData[randomPatron].secondary;
            const randomSecondary = weightedRandomSelection(secondaryOptions);
            patronText = `${randomPatron} - ${randomSecondary}`;
        } else {
            const secondaryOptions = window.patronsData[selectedPatron].secondary;
            const randomSecondary = weightedRandomSelection(secondaryOptions);
            patronText = `${selectedPatron} - ${randomSecondary}`;
        }
    }
    document.getElementById('npc-patron').innerText = patronText;

    // Generate a random age with a bell curve peak around 30
    const randomAge = generateBellCurveAge(16, 100, 30, 10);
    document.getElementById('npc-age').innerText = randomAge;

    // Determine occupation, either randomly or from dropdown
    const occupation = selectedOccupation === 'Random' ? weightedRandomSelection(window.occupationsData.occupations) : selectedOccupation;
    let occupationText = occupation;
    if (occupation === 'Clergy') {
        const secondaryOccupationOptions = window.occupationsData.occupations.find(occ => occ.value === 'Clergy').secondary;
        const randomSecondaryOccupation = weightedRandomSelection(secondaryOccupationOptions);
        occupationText = `${occupation} - ${randomSecondaryOccupation}`;
    }
    document.getElementById('npc-occupation').innerText = occupationText;

    // Determine reputation using weighted selection
    const reputationOptions = window.reputationData.reputation;
    const randomReputation = weightedRandomSelection(reputationOptions);

    // Determine renown, either randomly or from dropdown
    const localRenown = selectedRenown === 'Random' ? weightedRandomSelection(window.renownData.renown) : selectedRenown;
    const widerRenownOptions = window.renownData.renown.slice(0, window.renownData.renown.findIndex(option => option.value === localRenown) + 1);
    const widerRenown = weightedRandomSelection(widerRenownOptions);
    const renownText = `${randomReputation} - ${localRenown} (local), ${widerRenown} (wider)`;
    document.getElementById('npc-renown').innerText = renownText;
}

// Function to make a weighted random selection
function weightedRandomSelection(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        if (randomNum < items[i].weight) {
            return items[i].value;
        }
        randomNum -= items[i].weight;
    }
}

// Function to generate a random age with a bell curve around a given mean
function generateBellCurveAge(min, max, mean, deviation) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num * deviation + mean;
    num = Math.round(num);
    return Math.min(Math.max(num, min), max);
}
