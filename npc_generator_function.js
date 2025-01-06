// npc_generator_function.js

// Function to randomly generate values for different attributes
function generateNPC() {
    if (!window.npcLocationData || !window.speciesData || !window.pronounsData || !window.occupationsData || !window.renownData || !window.religiousnessData || !window.patronsData || !window.namesData) {
        console.error('Data not loaded yet. Cannot generate NPC.');
        return;
    }

    setLockedOrRandomValue('npc-location');
    setLockedOrRandomValue('species');
    setLockedOrRandomValue('pronouns'); // dependent on species
    setLockedOrRandomValue('age');
    setLockedOrRandomValue('occupation');
    setLockedOrRandomValue('renown');
    setLockedOrRandomValue('religiousness');
    setLockedOrRandomValue('patron'); // dependent on species and religiousness
    setLockedOrRandomValue('name'); // dependent on species, age, and pronouns
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
            break;
        case 'pronouns':
            setField('pronouns', getRandomPronouns());
            break;
        case 'age':
            setField('age', getRandomAge());
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
            break;
        case 'patron':
            const patron = getRandomPatron();
            setField('patron', `${patron.primary} - ${patron.secondary}`);
            break;
        case 'name':
            setField('name', getRandomName());
            break;
    }
}

// Helper function to get a locked value from a dropdown or generate a random value
function setLockedOrRandomValue(field) {
    const dropdown = document.getElementById(field + '-dropdown');
    const selectedValue = dropdown?.value ?? 'Random';
    if(selectedValue === 'Random') {
        regenerateValue(field);
    } else {
        setField(field, selectedValue);
    }
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
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Helper functions to get a random name based on species
function getRandomThreeGenderName(speciesNames, pronouns){
    const male = speciesNames['He/him'];
    const female = speciesNames['She/her'];
    const enby = speciesNames['They/them'];
    let names = [];
    if (pronouns.includes('He')) {
        names = names.concat(male);
    }
    if (pronouns.includes('She')) {
        names = names.concat(female);
    }
    if (pronouns.includes('They') || pronouns.includes('they')) {
        names = names.concat(enby);
    }
    return names[Math.floor(Math.random() * names.length)];
}
function getRandomName() {
    const species = window.species;
    const pronouns = window.pronouns;
    const allNames = window.namesData;
    const speciesNames = allNames[species];

    if (species === 'Condrak' || species === 'Puddlefolk') {
        return speciesNames[Math.floor(Math.random() * speciesNames.length)];
    } else if (species === 'Scinomorph') {
        const syllables = Math.floor(Number(window.age) / 15 );
        let name = '';
        for(let i=0; i <= syllables; i++) {
            name += speciesNames[Math.floor(Math.random() * speciesNames.length)];
        }
        return name;
    } else if (species === "Arbran" || species === "Osteant" || species === "Wanderer") {
        return getRandomThreeGenderName(speciesNames, pronouns) + ' '+ speciesNames['lastName'][Math.floor(Math.random() * speciesNames['lastName'].length)];
    } else if (species === "Ziphodont") {
        return getRandomThreeGenderName(speciesNames, pronouns) + ' ' + speciesNames['middleName'][Math.floor(Math.random() * speciesNames['middleName'].length)] + ' '+ speciesNames['lastName'][Math.floor(Math.random() * speciesNames['lastName'].length)];
    }

    return getRandomThreeGenderName(speciesNames, pronouns);
}

// Helper function to get a random age (min 16, peak at 30, longer taper towards 100)
function getRandomAge() {
    function generateRandomFromWeights(weights) {
        const cdf = [];
        let cumulativeSum = 0;
        weights.forEach(item => {
            cumulativeSum += item.weight;
            cdf.push({ age: item.age, cumulative: cumulativeSum });
        });
    
        const random = Math.random();
        for (let i = 0; i < cdf.length; i++) {
            if (random <= cdf[i].cumulative) {
                return cdf[i].age;
            }
        }
    
        // Fallback (should not occur if weights are normalized properly)
        return cdf[cdf.length - 1].age;
    }
    
    function asymmetricCurve(x, peak = 30, k1 = 5, k2 = 25) {
        if (x < peak) {
            return Math.exp(-(peak - x) / k1);
        } else {
            return Math.exp(-(x - peak) / k2);
        }
    }
    
    // Example: Generate weights for ages between 16 and 100
    const weights = [];
    for (let age = 16; age <= 100; age++) {
        weights.push({ age, weight: asymmetricCurve(age) });
    }
    
    // Normalize the weights to sum to 1
    function normalizeWeights(weights) {
        const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
        return weights.map(item => ({ ...item, weight: item.weight / totalWeight }));
    }
    const normalizedWeights = normalizeWeights(weights);
    
    return generateRandomFromWeights(normalizedWeights);
}

// Function to get random renown
function getRandomRenown() {
    const renown = window.renownData;
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

    const localRenown = window.renownData[localRenownIndex].value;
    const widerRenown = window.renownData[widerRenownIndex].value;
    return { local: localRenown, wider: widerRenown };
}

// Helper function to get random pronouns
function getRandomPronouns() {
    if (window.species === "Puddlefolk") {
        return "They/them";
    } else {
        return getRandomValue(window.pronounsData);
    }
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
                ? setLockedOrRandomValue(valueFieldId) : selectedValue;
        })
    });
});
