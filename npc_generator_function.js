// npc_generator_function.js

// Function to randomly generate values for different attributes
function generateNPC() {
    if (!window.npcLocationData || !window.speciesData || !window.pronounsData || !window.occupationsData || !window.renownData || !window.religiousnessData || !window.patronsData || !window.namesData) {
        console.error('Data not loaded yet. Cannot generate NPC.');
        return;
    }

    getLockedOrRandomValue('npc-location');
    getLockedOrRandomValue('species');
    getLockedOrRandomValue('name'); // dependent on species
    getLockedOrRandomValue('pronouns');
    getLockedOrRandomValue('age');
    getLockedOrRandomValue('occupation');
    getLockedOrRandomValue('renown');
    getLockedOrRandomValue('religiousness');
    getLockedOrRandomValue('patron'); // dependent on species and religiousness
}

function setField(field, value) {
    window[field] = value;
    document.getElementById(field).textContent = value;
}

// Function to regenerate a single value without modifying other attributes
function regenerateValue(attribute) {
    if (!window.npcLocationData || !window.speciesData || !window.pronounsData || !window.occupationsData || !window.renownData || !window.religiousnessData || !window.patronsData) {
        console.error('Data not loaded yet. Cannot regenerate value.');
        return;
    }
    switch (attribute) {
        case 'npc-location':
            setField('npc-location', getRandomValue(window.npcLocationData.locations));
            break;
        case 'species':
            setField('species', getRandomValue(window.speciesData));
            getLockedOrRandomValue('patron');
            getLockedOrRandomValue('name');
            break;
        case 'pronouns':
            setField('pronouns', getRandomValue(window.pronounsData.default));
            break;
        case 'age':
            setField('age', Math.floor(16 + Math.pow(Math.random(), 2) * 84)); // Bell curve around 30
            break;
        case 'occupation':
            setField('occupation', getRandomValue(window.occupationsData.occupations));
            break;
        case 'renown':
            const renown = getRandomRenown();
            setField('renown', `${renown.local} (local), ${renown.wider} (wider)`);
            break;
        case 'religiousness':
            setField('religiousness', getRandomValue(Object.keys(window.religiousnessData)));
            getLockedOrRandomValue('patron');
            break;
        case 'patron':
            const patron = getRandomPatron();
            setField('patron', `${window.patron.primary} - ${window.patron.secondary}`);
            break;
        case 'name':
            setField('name', getRandomName());
            break;
    }
}

// Helper function to get a locked value from a dropdown or generate a random value
function getLockedOrRandomValue(field) {
    const dropdown = document.getElementById(field + '-dropdown');
    const selectedValue = dropdown?.value ?? 'Random';
    if(selectedValue === 'Random') {
        regenerateValue(field);
    } else {
        setField(field, selectedValue);
    }
    return selectedValue === 'Random' ? regenerateValue(field) : selectedValue;
}

// Helper function to get a random value from an array
function getRandomValue(array) {
    if(array[0].weight !== undefined) {
        const total = array.reduce((count, e) => count + Number(e.weight), 0);
        const randomNumber = Math.floor(Math.random() * total);
        let count = 0;
        let index = 0;
        while(count + array[index].weight <= randomNumber) {
            count += array[index].weight;
            index ++;
        }
        return array[index].value;
    } else {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
}

// Helper function to get a random name based on species
function getRandomName() {
    return Math.floor(16 + Math.pow(Math.random(), 2) * 84);
}

// Helper function to get a random age
function getRandomAge() {
    return Math.floor(16 + Math.pow(Math.random(), 2) * 84);
}

// Function to get random renown
function getRandomRenown() {
    const renown = window.renownData.renown; // TODO get rid of the unnecessary 'renown' sub-field?
    const total = renown.reduce((count, e) => count + Number(e.weight), 0);

    // Local renown
    const localRandomNumber = Math.floor(Math.random() * total);
    let count = 0;
    let localRenownIndex = 0;
    while(count + renown[localRenownIndex].weight < localRandomNumber) {
        count += renown[localRenownIndex].weight;
        localRenownIndex ++;
    }
    
    // Wider renown
    let widerRandomNumber = Math.floor(Math.random() * total);
    while (widerRandomNumber > localRandomNumber) {
        widerRandomNumber = Math.floor(Math.random() * total);
    }
    count = 0;
    let widerRenownIndex = 0;
    while(count + renown[widerRenownIndex].weight < widerRandomNumber) {
        count += renown[widerRenownIndex].weight;
        widerRenownIndex ++;
    }

    const localRenown = window.renownData.renown[localRenownIndex].value;
    const widerRenown = window.renownData.renown[widerRenownIndex].value;
    return { local: localRenown, wider: widerRenown };
}

// Function to get random patron based on religiousness level
function getRandomPatron() {
    let primary;
    if (window.religiousness === 'Indifferent') {
        return {primary: 'N/A', secondary: 'N/A'};
    } else if (window.religiousness === 'Hostile' || window.religiousness === 'Opposed' || window.religiousness === 'Skeptical') {
        primary = 'Atheist';
    } else if (window.species === 'Azhdar') {
        primary = Math.random() < 0.8 ? 'Sun' : 'Atheist';
    } else if (window.species === 'Hatchless') {
        primary = Math.random() < 0.8 ? 'Atheist' : getRandomValue(Object.keys(window.patronsData));
    } else {
        primary = getRandomValue(Object.keys(window.patronsData));
    }
    const secondaryList = window.patronsData[primary];
    const secondary = secondaryList?.secondary ? getRandomValue(secondaryList.secondary) : 'None';
    return { primary, secondary };
}


// Event listener for the randomize button
document.getElementById('randomize-button').addEventListener('click', function () {
    generateNPC();
});

// Wait for all data to be loaded before generating and displaying NPC data
document.addEventListener('dataLoaded', () => {
    generateNPC();
});

// Create listeners for the dropdowns
document.addEventListener('DOMContentLoaded', () => {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', (event) => {
            const selectElement = event.target;
            const selectId = selectElement.id;
        
            // Derive the corresponding display field ID from the select's ID
            const valueFieldId = selectId.replace('-dropdown', '');
        
            const selectedValue = selectElement.value;
        
            // Update the corresponding display field
            document.getElementById(valueFieldId).textContent = selectedValue === 'Random'
                ? getLockedOrRandomValue(valueFieldId) : selectedValue;
        })
    });
});
