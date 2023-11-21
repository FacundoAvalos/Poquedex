const API = 'https://pokeapi.co/api/v2';
const PAGE_SIZE = 151;
let favoritos = [];
let cardAPI = {};



const getPokemon = async (offset = 0) => {
    try {
        const response = await fetch(`${API}/pokemon?offset=${offset}&limit=${PAGE_SIZE}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(error);
    }
}

const pokemonDetail = async (id) => {
    try {
        const response = await fetch(`${API}/pokemon/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

const mostrarTodasLasCartas = async () => {
    let pokemonList;

    try {
        pokemonList = obtenerDatosDesdeLocalStorage();

        if (!pokemonList) {
            pokemonList = await obtenerDatosDesdeAPI();
        }

        mostrarCartasEnDOM(pokemonList);
    } catch (error) {
        document.querySelector('#errorApi').classList.remove('d-none');
        console.error(error);
    } finally {
        console.info('ANDUVO');
    }
};

function obtainDetail(name){
    const pokemon = pokemonDetail(name)
    .then( pokemon=>{
        const pokemonElement = document.querySelector(".detallesPokemon");
        pokemonElement.innerHTML=`
        <div class="pokemonGrande">
            <div class="arribaImagen">
                <h3 class="nombrepokemon">${pokemon.name}</h3>
                <p class="numeroPokedex">Nº${pokemon.id}</p>
            </div>
            <div class="imagenMain">
                <img src="${pokemon.sprites.other.dream_world.front_default}" width="550px" alt="">
            </div>
        </div>

        <div class="fullinfo">
            <div class="listamapliada">
               <div class="listapok">
                    <img src="poke.png" width="50" alt="">
                    <img src="${pokemon.sprites.front_shiny}" alt="">
                    <img src="${pokemon.sprites.back_shiny}" alt="">
                    <p>${pokemon.types.map((type) => type.type.name).join(', ')}</p>
                    </div>
            </div>
            <div class="InfoCompleta">
                <div class="tipoPokemon">
                    <p>${pokemon.name} </p>
                </div>
                <div class="informacionCentral">
                    <div>
                        <p>Tipo</p>
                        <p>${pokemon.types.map((type) => type.type.name).join(', ')}</p>
                    </div>
                    <div>
                        <p>Altura</p>
                        <p>${pokemon.height} dm</p>
                    </div>
                    <div>
                        <p>Peso</p>
                        <p>${pokemon.weight} hg</p>
                    </div>
                </div>
                <div class="infoExtra">
                    <h4>Habilidades</h4>
                    <ul>
                        ${pokemon.abilities.map((ability) => `
                            <li>${ability.ability.name}</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="botonClass">
                    <button class="botonFav" onclick="addToFavorites('${pokemon.name}')">Favoritos⭐</button>
                    <button class="botonFav" onclick="quitFavorites('${pokemon.name}')">Eliminar💔</button>
                </div>
            </div>
        </div>
        `
    })
    .catch(error => console.error(error))
}

function addToFavorites(pokemonName) {
    const existsInFavorites = favoritos.some((pokemon) => pokemon.name === pokemonName);

    if (!existsInFavorites) {
        pokemonDetail(pokemonName)
            .then((pokemonData) => {
                favoritos.push({
                    name: pokemonData.name,
                    imageUrl: pokemonData.sprites.front_default,
                    type: pokemonData.types.map((type) => type.type.name).join(', ')
                });

                localStorage.setItem('favoritos', JSON.stringify(favoritos));
            })
            .catch((error) => {
                console.error("Error al obtener información del Pokémon:", error);
            });
    } else {
        alert('Este Pokémon ya está en tus favoritos.');
    }
}

function quitFavorites(pokemonName) {
    const index = favoritos.findIndex((pokemon) => pokemon.name === pokemonName);

    if (index !== -1) {
        favoritos.splice(index, 1);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    } else {
        alert('Este Pokémon no está en tus favoritos.');
    }
}

function showFavorites() {
    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    const cardsContainer = document.querySelector('.cards');
    cardsContainer.innerHTML = '';

    favoritos.forEach((pokemon) => {
        const pokemonElement = document.createElement('a');
        pokemonElement.className = 'apokemon';
        pokemonElement.href = `details.html?id=${pokemon.name}`
        pokemonElement.innerHTML = `
            <div class="listamapliada">
                <div class="listapok">
                    <img src="poke.png" width="40px" alt="pokeball">
                    <img src="${pokemon.imageUrl}" alt="${pokemon.name}">
                    <p class="nombrepokemon">${pokemon.name}</p>
                    <p>${pokemon.type}</p>
                </div>
            </div>
        `;
        cardsContainer.appendChild(pokemonElement);
    });
}


function buscarPokemonPorNombre(nombre) {
    if (nombre.trim() !== '') {
        getPokemon()
            .then(async (pokemonList) => {
                const resultados = await Promise.all(
                    pokemonList.map(async (card) => {
                        const pokemon = await pokemonDetail(card.name);
                        return pokemon;
                    })
                );

                const filteredResults = resultados.filter((pokemon) =>
                    pokemon.name.toLowerCase().includes(nombre.toLowerCase())
                );

                if (filteredResults.length > 0) {
                    mostrarResultadosDeBusqueda(filteredResults);
                } else {
                    alert('No se encontraron Pokémon con ese nombre.');
                }
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
        alert('Ingresa un nombre de Pokémon para buscar.');
    }
}

function mostrarResultadosDeBusqueda(resultados) {
    const cardsContainer = document.querySelector('.pokemons');
    cardsContainer.innerHTML = '';

    resultados.forEach((pokemon) => {
        const pokemonElement = document.createElement('a');
        pokemonElement.className = 'apokemon';
        pokemonElement.href = `details.html?id=${pokemon.name}`
        pokemonElement.innerHTML = `
            <div class="listamapliada">
                <div class="listapok">
                    <img src="poke.png" width="40px" alt="pokeball">
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                    <p class="nombrepokemon">${pokemon.name}</p>
                    <p>${pokemon.types.map((type) => type.type.name).join(', ')}</p>
                </div>
            </div>
        `;
        cardsContainer.appendChild(pokemonElement);
    });
}


const obtenerDatosDesdeAPI = async () => {
    try {
        const pokemonList = await getPokemon();
        localStorage.setItem('datosIniciales', JSON.stringify(pokemonList));
        return pokemonList;
    } catch (error) {
        console.error('Error al obtener datos desde la API:', error);
        throw error;
    }
};


const obtenerDatosDesdeLocalStorage = () => {
    const datosGuardados = localStorage.getItem('datosIniciales');
    return datosGuardados ? JSON.parse(datosGuardados) : null;
};

const mostrarCartasEnDOM = (pokemonList) => {
    const pokemonsContainer = document.querySelector('.pokemons');
    pokemonsContainer.innerHTML = '';

    const promises = pokemonList.map((card) => {
        return pokemonDetail(card.name)
            .then((pokemon) => {
                const pokemonElement = document.createElement('a');
                pokemonElement.className = 'apokemon';
                pokemonElement.href = `details.html?id=${pokemon.name}`
                pokemonElement.innerHTML = `
                    <div class="listamapliada">
                        <div class="listapok">
                            <img src="poke.png" width="40px" alt="pokeball">
                            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                            <p>N.º ${pokemon.id}</p>
                            <p class="nombrepokemon">${pokemon.name}</p>
                            <p>${pokemon.types.map((type) => type.type.name).join(', ')}</p>
                        </div>
                    </div>
                `;

                pokemonsContainer.appendChild(pokemonElement);
            })
            .catch((error) => {
                console.error(`Error al obtener el Pokémon ${card.name}:`, error);
            });
    });

    Promise.all(promises)
        .catch((error) => {
            console.error(error);
        });
};

mostrarTodasLasCartas();
showFavorites();
