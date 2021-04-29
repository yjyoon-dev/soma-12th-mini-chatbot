import { Router } from 'express';
import ChatbotController from '../controllers/chatbot.controller';
import IndexController from '../controllers/index.controller';
import Route from '../interfaces/routes.interface';

class IndexRoute implements Route {
  public path = '/';
  public router = Router();
  public indexController = new IndexController();
  public chatbotController = new ChatbotController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.indexController.index);
    this.router.post(`${this.path}/request`, this.chatbotController.requestController);
    this.router.post(`${this.path}/callback`, this.chatbotController.callbackController);
  }
}

export default IndexRoute;
