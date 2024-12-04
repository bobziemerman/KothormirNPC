document.addEventListener('DOMContentLoaded', () => {
    let speciesData, pronounsData, namesData, religiousnessData, patronsData, occupationsData, renownData, reputationData;

    // Fetch all the data files
    Promise.all([
        fetch('data/species.json').then(response => response.json()),
        fetch('data/pronouns.json').then(response => response.json()),
        fetch('data/names.json').then(response => response.json()),
        fetch('data/religiousness.json').then(response => response.json()),
        fetch('data/patrons.json').then(response => response.json()),
        fetch('data/occupations.json').then(response => response.json()),
        fetch('data/renown.json').then(response => response.json()),
        fetch('data/reputation.json').then(response => response.json())
    ])
    .then(([species, pronouns, names, religiousness, patrons, occupations, renown, reputation]) => {
        // Assign data to variables
        speciesData = species;
        pronounsData = pronouns;
        namesData = names;
        religiousnessData = religiousness;
        patronsData = patrons;
        occupationsData = occupations;
        renownData = renown;
        reputationData = reputation;

        // Populate dropdowns with JSON data
        populateSpeciesDropdown('species-dropdown', speciesData);
        populatePronounsDropdown('pronouns-dropdown', pronounsData.default);
        populateDropdown('religiousness-dropdown', Object.keys(religiousnessData));
        populateDropdown('patron-dropdown', Object.keys(patronsData));
        populateOccupationDropdown('occupation-dropdown', occupationsData.occupations);
        populateDropdown('renown-dropdown', renownData.renown.map(item => item.value));

        // Generate NPC initially
        generateNPC();

        // Add event listener for the randomize button
        document.getElementById('randomize-button').addEventListener('click', generateNPC);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

    function generateNPC() {
        // Select a random species using weighted selection
        const randomSpecies = weightedRandomSelection(speciesData);

        // Set the species on the page
        document.getElementById('npc-species').innerText = randomSpecies;

        // Determine pronouns based on species with weighted selection
        const pronounsOptions = pronounsData[`species-${randomSpecies}`] || pronounsData["default"];
        const randomPronoun = weightedRandomSelection(pronounsOptions);

        // Set the pronouns on the page
        document.getElementById('npc-pronouns').innerText = randomPronoun;

        // Determine name based on species and pronouns
        const speciesNames = namesData[`species-${randomSpecies}`] || namesData["default"];
        const nameOptions = speciesNames[randomPronoun] || [];

        // Randomly select a name from the filtered options
        const randomName = nameOptions[Math.floor(Math.random() * nameOptions.length)];

        // Set the name on the page
        document.getElementById('npc-name').innerText = randomName;

        // Determine religiousness using weighted selection
        const religiousnessOptions = Object.entries(religiousnessData).map(([key, value]) => ({ value: key, weight: value.weight }));
        const randomReligiousness = weightedRandomSelection(religiousnessOptions);

        // Set the religiousness on the page
        document.getElementById('npc-religiousness').innerText = randomReligiousness;

        // Determine patron based on religiousness
        let patronText = "N/A";
        if (randomReligiousness !== "Indifferent") {
            let patronOptions;
            if (randomReligiousness === "Hostile" || randomReligiousness === "Opposed" || randomReligiousness === "Skeptical") {
                patronOptions = [{ value: "Atheist", weight: patronsData["Atheist"].weight }];
            } else {
                patronOptions = Object.entries(patronsData).filter(([key]) => key !== "Atheist").map(([key, value]) => ({ value: key, weight: value.weight }));
            }

            const randomPatron = weightedRandomSelection(patronOptions);

            // Determine secondary patron
            const secondaryOptions = patronsData[randomPatron].secondary;
            const randomSecondary = weightedRandomSelection(secondaryOptions);

            patronText = `${randomPatron} - ${randomSecondary}`;
        }

        // Set the patron on the page
        document.getElementById('npc-patron').innerText = patronText;

        // Generate a random age with a bell curve peak around 30
        const randomAge = generateBellCurveAge(16, 100, 30, 10);

        // Set the age on the page
        document.getElementById('npc-age').innerText = randomAge;

        // Determine occupation using weighted selection
        const occupationOptions = occupationsData.occupations;
        const randomOccupation = weightedRandomSelection(occupationOptions);

        // Determine secondary occupation if clergy
        let occupationText = randomOccupation;
        if (randomOccupation === "Clergy") {
            const secondaryOccupationOptions = occupationsData.occupations.find(occupation => occupation.value === "Clergy").secondary;
            const randomSecondaryOccupation = weightedRandomSelection(secondaryOccupationOptions);
            occupationText = `${randomOccupation} - ${randomSecondaryOccupation}`;
        }

        // Set the occupation on the page
        document.getElementById('npc-occupation').innerText = occupationText;

        // Determine reputation using weighted selection
        const reputationOptions = reputationData.reputation;
        const randomReputation = weightedRandomSelection(reputationOptions);

        // Determine local and wider renown
        const renownOptions = renownData.renown;
        const randomLocalRenown = weightedRandomSelection(renownOptions);

        // Filter the renown options for wider selection
        const widerRenownOptions = renownOptions.slice(0, renownOptions.findIndex(option => option.value === randomLocalRenown) + 1);
        const randomWiderRenown = weightedRandomSelection(widerRenownOptions);

        // Set the renown on the page with reputation prefix
        const renownText = `${randomReputation} - ${randomLocalRenown} (local), ${randomWiderRenown} (wider)`;
        document.getElementById('npc-renown').innerText = renownText;
    }

    // Function to populate species dropdown
    function populateSpeciesDropdown(elementId, speciesData) {
        const dropdown = document.getElementById(elementId);
        speciesData.forEach(species => {
            const opt = document.createElement('option');
            opt.value = species.value;
            opt.textContent = species.value;
            dropdown.appendChild(opt);
        });
    }

    // Function to populate pronouns dropdown
    function populatePronounsDropdown(elementId, pronounsData) {
        const dropdown = document.getElementById(elementId);
        pronounsData.forEach(pronoun => {
            const opt = document.createElement('option');
            opt.value = pronoun.value;
            opt.textContent = pronoun.value;
            dropdown.appendChild(opt);
        });
    }

    // Function to populate occupation dropdown
    function populateOccupationDropdown(elementId, occupationsData) {
        const dropdown = document.getElementById(elementId);
        occupationsData.forEach(occupation => {
            const opt = document.createElement('option');
            opt.value = occupation.value;
            opt.textContent = occupation.value;
            dropdown.appendChild(opt);
        });
    }

    // Function to populate general dropdowns with simple string options
    function populateDropdown(elementId, options) {
        const dropdown = document.getElementById(elementId);
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });
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
});
