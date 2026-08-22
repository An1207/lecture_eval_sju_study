import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';


//asdf
//qwerty
// git rebase main -> 코드 수정 -> git add . -> git rebase --continue 
// -> git log --oneline -> git push origin feature/각자브랜치 --force

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {//니니게그런사람이나힐순없는지니곁에있는니친구가아니라 //머지??
    return this.appService.getHealth();
  }

  @Get('db-check')
  checkDatabase() {
    return this.appService.checkDatabase();
  }

  // stash 후 server-info add comment
  @Get('server-info') ///asdf wasd //git stash111111 // wow wonderful
  getServerInfo() {
      return this.appService.getServerInfo();
  } // TESTTESTESTs
    
}
