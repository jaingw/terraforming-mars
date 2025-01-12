require('dotenv').config();
require('console-stamp')(
  console,
  {format: ':date(yyyy-mm-dd HH:MM:ss Z)'},
);

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as raw_settings from '../genfiles/settings.json';
import * as prometheus from 'prom-client';
import * as responses from './server/responses';
// import * as ansi from 'ansi-escape-sequences';

import {runId, serverId} from './utils/server-ids';
import {processRequest} from './server/requestProcessor';
import {GameLoader} from './database/GameLoader';
import {globalInitialize} from './globalInitialize';

process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION', err);
});

function requestHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
  try {
    processRequest(req, res);
  } catch (error) {
    responses.internalServerError(req, res, error);
  }
}

const metrics = {
  startServer: new prometheus.Gauge({
    name: 'server_start_server',
    help: 'Time to initialize the server',
    registers: [prometheus.register],
  }),
  startDatabase: new prometheus.Gauge({
    name: 'server_start_database',
    help: 'Time to initialize the database',
    registers: [prometheus.register],
  }),

};
metrics;

function createServer(): http.Server | https.Server {
// If they've set up https
  if (process.env.KEY_PATH && process.env.CERT_PATH) {
    const httpsHowto =
  'https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/';
    if (!fs.existsSync(process.env.KEY_PATH)) {
      console.error(
        'TLS KEY_PATH is set in .env, but cannot find key! Check out ' +
    httpsHowto,
      );
    } else if (!fs.existsSync(process.env.CERT_PATH)) {
      console.error(
        'TLS CERT_PATH is set in .env, but cannot find cert! Check out' +
    httpsHowto,
      );
    }
    const options = {
      key: fs.readFileSync(process.env.KEY_PATH),
      cert: fs.readFileSync(process.env.CERT_PATH),
    };
    return https.createServer(options, requestHandler);
  } else {
    return http.createServer(requestHandler);
  }
}

// prometheus.register.setDefaultLabels({
//   app: 'terraforming-mars-app',
// });
// prometheus.collectDefaultMetrics();
globalInitialize();

export const server = createServer();

// await timeAsync(Database.getInstance().initialize())
//     .then((v) => {
//       metrics.startDatabase.set(v.duration);
//     });

GameLoader.getInstance().start(() => {
  console.log(`Starting ${raw_settings.head}, built at ${raw_settings.builtAt}`);

  console.log('Starting server on port ' + (process.env.PORT || 8081));

  server.listen(process.env.PORT || 8081);

  if (!process.env.SERVER_ID) {
    // console.log(`The secret serverId for this server is ${ansi.style.bold}${serverId}${ansi.style.reset}.`);
    console.log(`The secret serverId for this server is ${serverId}.`);
    console.log(`Administrative routes can be found at admin?id=${serverId}`);
  }
  console.log(`The public run ID is ${runId}`);
  console.log('Server is ready.');
});

