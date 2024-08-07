const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
let pokemonData = [];
let currentPage = 1;
const totalPages = 21;

// Fetch Pokemon data from PokeAPI with pagination
async function fetchPokemonData(page = 1) {
    try {
        const response = await fetch(`${baseUrl}?offset=${(page - 1) * 20}&limit=20`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const detailedDataPromises = data.results.map(pokemon => fetchPokemonInfo(pokemon.url));
        const detailedData = await Promise.all(detailedDataPromises);
        pokemonData = detailedData;
        return pokemonData;
    } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        return [];
    }
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

// Fetch evolution chain data
async function fetchEvolutionChain(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        return null;
    }
}

// Render list of Pokemon
async function renderPokemonList() {
    const pokemonList = document.getElementById('pokemonList');
    const data = await fetchPokemonData(currentPage);

    if (!data.length) {
        pokemonList.innerHTML = '<p class="text-center text-red-500">Failed to load Pokemon data.</p>';
        return;
    }

    pokemonList.innerHTML = ''; // Clear previous list

    data.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        pokemonList.appendChild(card);
    });

    renderPagination();
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
async function showPokemonDetails(pokemon) {
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

    // Fetch and display evolution chain
    const speciesResponse = await fetch(pokemon.species.url);
    const speciesData = await speciesResponse.json();
    const evolutionChain = await fetchEvolutionChain(speciesData.evolution_chain.url);

    if (evolutionChain) {
        const evolutionTitle = document.createElement('p');
        evolutionTitle.textContent = 'Evolution Chain:';
        evolutionTitle.classList.add('mt-4', 'text-sm', 'font-semibold');
        infoContainer.appendChild(evolutionTitle);

        const evolutionContainer = document.createElement('div');
        evolutionContainer.classList.add('text-sm', 'text-gray-600', 'mb-4');

        let currentEvolution = evolutionChain.chain;
        while (currentEvolution) {
            const evolutionName = document.createElement('p');
            evolutionName.textContent = currentEvolution.species.name;
            evolutionContainer.appendChild(evolutionName);
            currentEvolution = currentEvolution.evolves_to[0];
        }

        infoContainer.appendChild(evolutionContainer);
    }

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
    filterAndRenderPokemon();
});

// Handle type filter
const typeFilter = document.getElementById('typeFilter');
typeFilter.addEventListener('change', () => {
    filterAndRenderPokemon();
});

// Filter and render Pokemon list based on search and type filter
function filterAndRenderPokemon() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;

    const filteredPokemon = pokemonData.filter(pokemon => {
        const matchesType = selectedType ? pokemon.types.some(type => type.type.name === selectedType) : true;
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm) || pokemon.id.toString() === searchTerm;
        return matchesType && matchesSearch;
    });

    renderFilteredPokemonList(filteredPokemon);
}

// Render filtered Pokemon list
function renderFilteredPokemonList(filteredPokemon) {
    const pokemonList = document.getElementById('pokemonList');
    pokemonList.innerHTML = ''; // Clear previous list

    filteredPokemon.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        pokemonList.appendChild(card);
    });
}

// Render pagination buttons
function renderPagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = ''; // Clear previous buttons

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'px-4', 'py-2', 'rounded-md');
        if (i === currentPage) {
            pageButton.classList.add('bg-blue-700');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderPokemonList();
        });
        pageNumbers.appendChild(pageButton);
    }
}

// Event listeners for previous and next buttons
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPokemonList();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        renderPokemonList();
    }
});

// Initial render of Pokemon list with pagination
renderPokemonList();