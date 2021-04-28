import { NextFunction, Request, Response } from 'express';
import { KakaoWorkCallbackInfo, KakaoWorkConversation, KakaoWorkRequestInfo, KakaoWorkUserInfo } from '../dtos/kakaowork.dto';
import * as kakaoWork from '../utils/kakaowork';
import { broadcastMessage, calendarRequestModal, mentoringSearchRequestModal, userSearchRequestModal } from '../utils/kakaowork.message';

class ChatbotController {
  public sendMessageToAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await kakaoWork.getUserList();

      const conversations: KakaoWorkConversation[] = await Promise.all(
        users.map((user: KakaoWorkUserInfo) => kakaoWork.openConversations({ userId: user.id })),
      );

      const messages = await Promise.all([conversations.map(conversation => kakaoWork.sendMessage(broadcastMessage(conversation.id)))]);

      res.status(200).json({ users, conversations, messages });
    } catch (error) {
      next(error);
    }
  };

  public requestController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // {
      //   action_time: '2021-04-28T15:59:35.573528Z',
      //   message: {
      //     blocks: [ [Object], [Object], [Object], [Object], [Object], [Object] ],
      //     conversation_id: 1150461,
      //     id: 307546334010425340,
      //     text: null,
      //     user_id: 2632878
      //   },
      //   react_user_id: 2632844,
      //   type: 'request_modal',
      //   value: 'noti_on_off'
      // }
      const requestInfo: KakaoWorkRequestInfo = req.body;
      let responseModal;

      switch (requestInfo.value) {
        case 'user_search':
          responseModal = userSearchRequestModal();
          break;
        case 'mentoring_search':
          responseModal = mentoringSearchRequestModal();
          break;
        case 'calendar':
          responseModal = calendarRequestModal();
          break;
        case 'noti_on_off':
          console.log('on and off pressed');
        default:
          break;
      }

      res.status(200).json(responseModal);
    } catch (error) {
      next(error);
    }
  };

  public callbackController = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userInput: KakaoWorkCallbackInfo = req.body;

      // 추가 로직에서 데이터를 요청했을 때 처리(대표적으로 크롤링) 해서 보내기
      // 1. 유저 검색(멘토/멘티 선택 및 이름 기반 검색)
      // 2. 일정 검색(선택한 월로 검색)
      // 3. 멘토링 검색(제목, 작성자, 내용 기반 검색)
      // 4. 신규 멘토링 On/Off 기능 (유저 allowNotification만 반전)

      res.status(200).json({ message: userInput.message, value: userInput.value });
    } catch (error) {
      next(error);
    }
  };
}

export default ChatbotController;
