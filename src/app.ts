import DB from './database/db';
import { configDB } from './database/dbHelpers';
import http from 'http';
import sendResponse from './utils/sendResponse';
import { BASE_URL, ErrorMessages, HttpStatusCodes } from './utils/constants';
import { validateUserData, validateUuid } from './utils/validation';

class App {
  constructor(private db: DB) {
    this.db = db;
  }

  async requestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      res.setHeader('Content-Type', 'application/json');

      const url = req.url;

      if (url && !url.startsWith(BASE_URL) && !/\/api\/users/.test(url)) {
        sendResponse(res, HttpStatusCodes.NOT_FOUND, { error: `${url} path does not exist` });
        return;
      }

      switch (req.method) {
        case 'GET':
          await this.getReqHandler(req, res);
          break;
        case 'POST':
          await this.postReqHandler(req, res);
          break;
        case 'PUT':
          await this.putReqHandler(req, res);
          break;
        default:
          sendResponse(res, HttpStatusCodes.NOT_SUPPORTED, {
            error: ErrorMessages.UNSUPPORTED_METHOD,
          });
      }
    } catch (error) {
      configDB.end();
      sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
        error: ErrorMessages.SERVER_ERROR,
      });
    }
  }

  async getReqHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = req.url ? this.parseRequest(req.url) : null;

    if (id) {
      await this.getUser(id, res);
    } else {
      await this.getUsers(res);
    }
  }

  async getUsers(res: http.ServerResponse) {
    const users = await this.db.getUsers();
    sendResponse(res, HttpStatusCodes.OK, users);
  }

  async getUser(id: string, res: http.ServerResponse) {
    const user = await this.db.getUser(id);
    if (user) {
      sendResponse(res, HttpStatusCodes.OK, user);
    } else {
      sendResponse(res, HttpStatusCodes.NOT_FOUND, {
        error: `User with id ${id} not found`,
      });
    }
  }

  async postReqHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    let data: string = '';

    req.on('data', (dataChunk) => {
      data += dataChunk;
    });

    req.on('end', async () => {
      const body = JSON.parse(data);
      const isValidUser = validateUserData(body);

      if (isValidUser) {
        const newUser = await this.db.createUser(body);
        sendResponse(res, HttpStatusCodes.CREATED, newUser);
      } else {
        sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
          error: ErrorMessages.INVALID_DATA,
        });
      }
    });
  }

  async putReqHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = req.url ? this.parseRequest(req.url) : null;

    if (id) {
      const isValidId = validateUuid(id);

      if (isValidId) {
        await this.updateUser(req, res, id);
      } else {
        sendResponse(res, HttpStatusCodes.BAD_REQUEST, {
          error: ErrorMessages.INVALID_ID,
        });
      }
    } else {
      sendResponse(res, HttpStatusCodes.NOT_FOUND, { error: `User id is not provided` });
    }
  }

  async updateUser(req: http.IncomingMessage, res: http.ServerResponse, id: string) {
    let data: string = '';

    req.on('data', (dataChunk) => {
      data += dataChunk;
    });

    req.on('end', async () => {
      const body = JSON.parse(data);
      const updatedUser = await this.db.updateUser(id, body);

      if (updatedUser) {
        sendResponse(res, HttpStatusCodes.OK, updatedUser);
      } else {
        sendResponse(res, HttpStatusCodes.NOT_FOUND, {
          error: `User with id ${id} not found`,
        });
      }
    });
  }

  parseRequest(url: string) {
    const userId = url.replace('/api/users', '');
    return userId.length > 1 ? userId.slice(1) : null;
  };
}

export default App;
