import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, Symbols } from '../app.types';
import { Inject, Injectable, Optional } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PortainerService {
  // @TODO make this private
  public token: string | undefined = undefined;

  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(
    @Optional() @Inject(Symbols.Axios) private readonly axiosLib: typeof axios,
    private readonly configService: ConfigService,
  ) {
    if (!this.axiosLib) {
      this.axiosLib = axios;
    }

    this.baseUrl = this.configService.get<string>(
      EnvironmentVariables.PORTAINER_URL,
    );
    this.username = this.configService.get<string>(
      EnvironmentVariables.PORTAINER_USER,
    );
    this.password = this.configService.get<string>(
      EnvironmentVariables.PORTAINER_PASSWORD,
    );
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

  private getUrl(path: string): string {
    const url = new URL(path, this.baseUrl);
    return url.toString();
  }

  public async getAuthToken(): Promise<void> {
    const response = await this.axiosLib({
      method: 'post',
      url: this.getUrl('/api/auth'),
      data: { username: this.username, password: this.password },
    });
    this.token = response?.data?.jwt;
  }

  public async listMinecraftStacks(): Promise<any[]> {
    if (!this.token) {
      await this.getAuthToken();
    }
    let count = 0;
    let status = 0;
    let data: any;
    while (status !== 200) {
      count++;
      if (count > 4) {
        throw new Error('unable to authenticate against portainer api');
      }
      try {
        const response = await this.axiosLib({
          method: 'get',
          url: this.getUrl('/api/stacks'),
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        status = response.status;
        data = response.data;
      } catch (err) {
        if (/status code 401/i.test(err.message)) {
          status = 401;
        } else {
          throw err;
        }
      }
      if (status === 401) {
        await this.getAuthToken();
      }
    }
    // @TODO get additional information for the stacks
    return (
      (data || [])
        // @TODO find a better way to tag these stacks
        .filter(({ Name }) => /minecraft/i.test(Name))
        .map((stack) => ({
          id: stack.Id,
          name: stack.Name,
          status: stack.Status,
        }))
    );
  }
}
