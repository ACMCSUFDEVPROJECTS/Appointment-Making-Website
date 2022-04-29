import { Post, Query, Route } from 'tsoa';
import axios from 'axios';
import logging from '../utils/logging';
require('dotenv').config();

const NAMESPACE = 'NotionAuth';

interface AccessTokenRequest {
    authorization_code: string;
}

interface AccessTokenResponse {
    access_token: string;
    workspace_id: string;
    workspace_name: string;
    workspace_icon: string;
    bot_id: string;
    owner: object;
}

@Route('notion')
export default class Assignments {
    @Post('/')
    public async exchangeAuthToken(@Query() params: AccessTokenRequest): Promise<AccessTokenResponse | undefined> {
        const auth_header = 'Basic ' + Buffer.from(process.env.NOTION_CLIENT_ID + ':' + process.env.NOTION_CLIENT_SECRET).toString('base64');

        let access_token_response: AccessTokenResponse;

        try {
            access_token_response = await axios.post(
                'https://api.notion.com/v1/oauth/token',
                {
                    grant_type: 'authorization_code',
                    code: params.authorization_code,
                    redirect_uri: process.env.NOTION_REDIRECT_URI
                },
                {
                    headers: {
                        Authorization: auth_header,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return access_token_response;
        } catch (error) {
            logging.error(NAMESPACE, 'Could not get courses', error);
        }
    }
}
