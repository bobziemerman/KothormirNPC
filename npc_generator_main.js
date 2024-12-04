// npc_generator_main.js

document.addEventListener('DOMContentLoaded', () => {
    // Fetch all the data files
    Promise.all([
        fetch('data/locations.json').then(response => response.json()),
        fetch('data/species.json').then(response => response.json()),
        fetch('data/pronouns.json').then(response => response.json()),
        fetch('data/names.json').then(response => response.json()),
        fetch('data/religiousness.json').then(response => response.json()),
        fetch('data/patrons.json').then(response => response.json()),
        fetch('data/occupations.json').then(response => response.json()),
        fetch('data/renown.json').then(response => response.json()),
        fetch('data/reputation.json').then(response => response.json())
    ])
    .then(([locations, species, pronouns, names, religiousness, patrons, occupations, renown, reputation]) => {
        // Assign data to variables
        window.locationsData = locations;
        window.speciesData = species;
        window.pronounsData = pronouns;
        window.namesData = names;
        window.religiousnessData = religiousness;
        window.patronsData = patrons;
        window.occupationsData = occupations;
        window.renownData = renown;
        window.reputationData = reputation;

        // Populate dropdowns with JSON data
        populateDropdown('location-dropdown', window.locationsData.locations.map(item => item.value));
        populateDropdown('species-dropdown', window.speciesData.map(item => item.value));
        populateDropdown('pronouns-dropdown', window.pronounsData.default.map(item => item.value));
        populateDropdown('religiousness-dropdown', Object.keys(window.religiousnessData));
        populateDropdown('patron-dropdown', Object.keys(window.patronsData));
        populateDropdown('occupation-dropdown', window.occupationsData.occupations.map(item => item.value));
        populateDropdown('renown-dropdown', window.renownData.renown.map(item => item.value));

        // Generate NPC initially
        generateNPC();

        // Add event listener for the randomize button
        document.getElementById('randomize-button').addEventListener('click', generateNPC);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

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
});
