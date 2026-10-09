
const http = require('http');
const fs = require('fs');
const path = require('path');
const query = require('querystring');

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

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const type = request.headers['content-type'];
    if(type === 'application/x-www-form-urlencoded') {
      request.body = query.parse(bodyString);
    } else if (type === 'application/json') {
      request.body = JSON.parse(bodyString);
    } else {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'invalid data format' }));
      return response.end();
    }

    handler(request, response);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addPokemon') {
    return parseBody(request, response, jsonHandler.addPokemon);
  }

  if (parsedUrl.pathname === '/editPokemon') {
    return parseBody(request, response, jsonHandler.editPokemon);
  }

  return jsonHandler.notFound(request, response);
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

const onRequest = (request, response) => {

  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'GET') {
    return handleGet(request, response, parsedUrl);
  }

  if (request.method === 'HEAD') {
    return handleHead(request, response, parsedUrl);
  }

  if (request.method === 'POST') {
    return handlePost(request, response, parsedUrl);
  }


  return jsonHandler.notFound(request, response);
};



http.createServer(onRequest).listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});