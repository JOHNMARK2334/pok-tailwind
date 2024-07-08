// src/app.js

const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
let pokemonData = [];

// Fetch Pokemon data from PokeAPI
async function fetchPokemonData() {
    try {
        const response = await fetch(`${baseUrl}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        pokemonData = data.results;
        return pokemonData;
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        return [];
    }
}

// Render list of Pokemon
async function renderPokemonList() {
    const pokemonList = document.getElementById('pokemonList');
    const data = await fetchPokemonData();

    if (!data.length) {
        pokemonList.innerHTML = '<p class="text-center text-red-500">Failed to load Pokemon data.</p>';
        return;
    }

    pokemonList.innerHTML = ''; // Clear previous list

    data.forEach(async (pokemon) => {
        const pokemonInfo = await fetchPokemonInfo(pokemon.url);
        const card = createPokemonCard(pokemonInfo);
        pokemonList.appendChild(card);
    });
}

// Fetch detailed Pokemon info
async function fetchPokemonInfo(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon info:', error);
        return null;
    }
}

// Create Pokemon card element
function createPokemonCard(pokemon) {
    if (!pokemon) return null;

    const card = document.createElement('div');
    card.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden');

    const image = document.createElement('img');
    image.src = pokemon.sprites.front_default;
    image.alt = pokemon.name;
    image.classList.add('w-full', 'h-40', 'object-cover');
    card.appendChild(image);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('p-4');

    const name = document.createElement('h2');
    name.textContent = pokemon.name;
    name.classList.add('text-lg', 'font-bold', 'mb-2');
    infoContainer.appendChild(name);

    const types = document.createElement('p');
    types.textContent = `Type(s): ${pokemon.types.map(type => type.type.name).join(', ')}`;
    types.classList.add('text-sm', 'text-gray-600', 'mb-2');
    infoContainer.appendChild(types);

    const viewDetailsBtn = document.createElement('button');
    viewDetailsBtn.textContent = 'View Details';
    viewDetailsBtn.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded-md', 'inline-block', 'mt-2');
    viewDetailsBtn.addEventListener('click', () => showPokemonDetails(pokemon));
    infoContainer.appendChild(viewDetailsBtn);

    card.appendChild(infoContainer);

    return card;
}

// Show detailed Pokemon information in a modal
function showPokemonDetails(pokemon) {
    const modal = document.getElementById('pokemonModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = ''; // Clear previous details

    const detailCard = document.createElement('div');
    detailCard.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'p-4');

    const image = document.createElement('img');
    image.src = pokemon.sprites.front_default;
    image.alt = pokemon.name;
    image.classList.add('w-full', 'h-60', 'object-cover');
    detailCard.appendChild(image);

    const infoContainer = document.createElement('div');
    infoContainer.classList.add('p-4');

    const name = document.createElement('h2');
    name.textContent = pokemon.name;
    name.classList.add('text-xl', 'font-bold', 'mb-2');
    infoContainer.appendChild(name);

    const abilities = document.createElement('p');
    abilities.textContent = `Abilities: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}`;
    abilities.classList.add('text-sm', 'text-gray-600', 'mb-4');
    infoContainer.appendChild(abilities);

    const statsTitle = document.createElement('p');
    statsTitle.textContent = 'Stats:';
    statsTitle.classList.add('mt-4', 'text-sm', 'font-semibold');
    infoContainer.appendChild(statsTitle);

    const statsContainer = document.createElement('div');
    statsContainer.classList.add('grid', 'grid-cols-2', 'gap-4');

    pokemon.stats.forEach(stat => {
        const statElement = document.createElement('div');
        statElement.innerHTML = `<p class="text-sm">${stat.stat.name}: ${stat.base_stat}</p>`;
        statsContainer.appendChild(statElement);
    });

    infoContainer.appendChild(statsContainer);
    detailCard.appendChild(infoContainer);

    modalContent.appendChild(detailCard);
    modal.classList.remove('hidden'); // Show modal
}

// Close modal function
function closeModal() {
    const modal = document.getElementById('pokemonModal');
    modal.classList.add('hidden'); // Hide modal
}

// Event listener for closing the modal
const closeModalBtn = document.getElementById('closeModal');
closeModalBtn.addEventListener('click', closeModal);

// Handle search input
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredPokemon = pokemonData.filter(pokemon => {
        return pokemon.name.toLowerCase().includes(searchTerm) || pokemon.id.toString() === searchTerm;
    });

    renderFilteredPokemonList(filteredPokemon);
});

// Render filtered Pokemon list
function renderFilteredPokemonList(filteredPokemon) {
    const pokemonList = document.getElementById('pokemonList');
    pokemonList.innerHTML = ''; // Clear previous list

    filteredPokemon.forEach(async (pokemon) => {
        const pokemonInfo = await fetchPokemonInfo(pokemon.url);
        const card = createPokemonCard(pokemonInfo);
        pokemonList.appendChild(card);
    });
}

// Initial render of Pokemon list
renderPokemonList();
