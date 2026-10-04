
const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const jsonHandler = require('./jsonResponses.js');
const htmlHandler = require('./htmlResponses.js');

const pokedexPath = path.join(__dirname, '../json/pokedex.json');
const pokedex = JSON.parse(fs.readFileSync(pokedexPath, 'utf8'));
jsonHandler.setPokedex(pokedex);

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/getPokemon': jsonHandler.getPokemon,
  '/getTypes': jsonHandler.getTypes,
  '/getWeaknesses': jsonHandler.getWeaknesses,
  default: jsonHandler.notFound,
};

const handleGet = (request, response, parsedUrl) => {
  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response, parsedUrl);
  }

  const pokemonMatch = parsedUrl.pathname.match(/^\/getPokemon\/(\d+)$/);

  if (pokemonMatch) {
    const id = Number(pokemonMatch[1]);
    return jsonHandler.getPokemonById(request, response, id);
  }

  return jsonHandler.notFound(request, response);
};

const handleHead = (request, response, parsedUrl) => {
  if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response, parsedUrl);
  }

  const pokemonMatch = parsedUrl.pathname.match(/^\/getPokemon\/(\d+)$/);

  if (pokemonMatch) {
    const id = Number(pokemonMatch[1]);
    return jsonHandler.getPokemonById(request, response, id);
  }

  return jsonHandler.notFound(request, response);
};

/*const handlePost = (request, response, parsedUrl) => {

  if (parsedUrl.pathname === '/addUser') {
    return parseBody(request, response, jsonHandler.addUser);
  }

  return jsonHandler.notFound(request, response);
};*/
const onRequest = (request, response) => {

  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'GET') {
    return handleGet(request, response, parsedUrl);
  }

  if (request.method === 'HEAD') {
    return handleHead(request, response, parsedUrl);
  }

  //if (request.method === 'POST') {
  //  return handlePost(request, response, parsedUrl);
  //}


  return jsonHandler.notFound(request, response);
};



http.createServer(onRequest).listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});