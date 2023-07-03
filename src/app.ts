import DB from './database/db';
import { configDB } from './database/dbHelpers';
import http from 'http';
import sendResponse from './utils/sendResponse';
import { BASE_URL, ErrorMessages, HttpStatusCodes } from './utils/constants';

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

  parseRequest (url: string) {
    const userId = url.replace('/api/users', '');
    return userId.length > 1 ? userId.slice(1) : null;
  };
}

export default App;
