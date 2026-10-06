
let pokedex = [];

const setPokedex = (data) => {
    pokedex = data;
};

const respondJSON = (request, response, status, object) => {
    const content = JSON.stringify(object);
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    });
    if (request.method !== 'HEAD') {
        response.write(content);
    }
    response.end();
};


const getPokemon = (request, response, parsedUrl) => {
    let results = [...pokedex];

    const type = parsedUrl.searchParams.get('type');
    const name = parsedUrl.searchParams.get('name');
    const limit = parsedUrl.searchParams.get('limit');

    if (type) {
        results = results.filter((pokemon) =>
            pokemon.type.some((pokemonType) =>
                pokemonType.toLowerCase() === type.toLowerCase()
            )
        );
    }

    if (name) {
        results = results.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    if (limit) {
        const numberLimit = Number(limit);

        if (!Number.isInteger(numberLimit) || numberLimit < 1) {
            return respondJSON(request, response, 400, {
                message: 'Limit must be a positive whole number.',
                id: 'invalidLimit',
            });
        }

        results = results.slice(0, numberLimit);
    }

    return respondJSON(request, response, 200, results);
};



const notFound = (request, response) => {
    const responseJSON = {
        message: 'PAge wanst found',
        id: 'pageNotFound'
    };
    respondJSON(request, response, 404, responseJSON);
};

const getPokemonById = (request, response, id) => {
    const pokemon = pokedex.find((item) => item.id === id);

    if (!pokemon) {
        return respondJSON(request, response, 404, {
            message: 'Pokemon not found.',
            id: 'pokemonNotFound',
        });
    }

    return respondJSON(request, response, 200, pokemon);
};

const getTypes = (request, response) => {
    const types = [];

    pokedex.forEach((pokemon) => {
        pokemon.type.forEach((type) => {
            if (!types.includes(type)) {
                types.push(type);
            }
        });
    });

    return respondJSON(request, response, 200, types);
};

const getWeaknesses = (request, response) => {
    const weaknesses = [];

    pokedex.forEach((pokemon) => {
        pokemon.weaknesses.forEach((weakness) => {
            if (!weaknesses.includes(weakness)) {
                weaknesses.push(weakness);
            }
        });
    });

    return respondJSON(request, response, 200, weaknesses);
};

const addPokemon = (request, response) => {

  const responseJSON = {
    message: 'Name, type, height, weight and weaknesses are all required.',
  };

  const {
    name,
    type,
    height,
    weight,
    weaknesses
  } = request.body;

  if (!name || !type || !height || !weight || !weaknesses) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
 
  let responseCode = 204;
  if(!pokedex[name]) {
  const newPokemon = {
    id: pokedex.length + 1,
    name,
    type,
    height,
    weight,
    weaknesses
  };


  pokedex.push(newPokemon);

  responseJSON.message = 'Created Successfully';

  return respondJSON(request, response, 201, newPokemon);
};
return respondJSON(request, response, responseCode, responseJSON);
};

const editPokemon = (request, response) => {

  const responseJSON = {
    message: 'ID is required.',
  };

  const id = Number(request.body.id);

  if (!id) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  if (id < 1 || id > pokedex.length) {
    responseJSON.id = 'invalidId';
    return respondJSON(request, response, 400, responseJSON);
  }

    const index = pokedex.findIndex((pokemon) => pokemon.id === id);// from online mention in documentation findIndex method

  if (pokemonIndex === -1) {
    responseJSON.message = 'Pokemon not found.';
    responseJSON.id = 'pokemonNotFound';

    return respondJSON(request, response, 404, responseJSON);
  }

  pokedex[pokemonIndex] = { //from online mention in documentation ... syntax
    ...pokedex[pokemonIndex],
    ...request.body,
    id: id,
  };

  return respondJSON(request, response, 204, null);
};




module.exports = {
    getPokemon,
    getPokemonById,
    getWeaknesses,
    getTypes,
    setPokedex,
    notFound
};

