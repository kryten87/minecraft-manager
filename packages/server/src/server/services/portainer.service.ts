import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, Symbols } from '../app.types';
import axios from 'axios';

@Injectable()
export class PortainerService {
  constructor(
    @Optional() @Inject(Symbols.Axios) private readonly axiosLib: typeof axios,
    private readonly configService: ConfigService,
  ) {
    if (!this.axiosLib) {
      this.axiosLib = axios;
    }
  }

  /*
  authentication
  response=$(curl -s -d "{\"username\":\"${PORTAINER_USER}\",\"password\":\"${PORTAINER_PASSWORD}\"}" -H 'Content-Type: application/json' http://servers.thomas.home/api/auth)

  list stacks
  response=$(curl -s 'http://servers.thomas.home/api/stacks?filter=%7B%22Name%22%3A%22recipes%22%7D' -H "Authorization: Bearer $token")

  start stack
  response=$(curl -s -X POST "http://servers.thomas.home/api/stacks/$id/start" -H "Authorization: Bearer $token")

  stop stack
  response=$(curl -s -X POST "http://servers.thomas.home/api/stacks/$id/stop" -H "Authorization: Bearer $token")

  */

  public async getAuthToken(
    host: string,
    username: string,
    password: string,
  ): Promise<string> {
    const url = new URL('/api/auth', host);
    const response = await this.axiosLib({
      method: 'post',
      url: url.toString(),
      data: { username, password },
    });
    return response?.data?.token;
  }
}
