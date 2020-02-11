import * as config from '../common/config';
import db from '../common/db';
import * as lib from '../lib';
import axios from 'axios';

export interface GithubAccessToken {
    access_token: string;
    scope: string; // repo,gist
    token_type: string;
}

export interface GithubAccessTokenError {
    error: string;
    error_description: string;
    error_uri: string;
}

export interface GithubUser {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string;
    company: null;
    blog: string;
    location: string;
    email: string;
    hireable: null;
    bio: string;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}



export async function github(req: ExpressRequest, res: ExpressResponse) {
    let body: apar.Oauth2GithubBody = req.body
    let param = Object.assign({
        code: body.code,
    }, config.github);
    let data: GithubAccessToken | GithubAccessTokenError = await axios.post('https://github.com/login/oauth/access_token', param, {
        timeout: 30e3,
        headers: {
            'Accept': 'application/json',
        },
    }).then(({ data }) => data);
    if (!('access_token' in data)) {
        console.log(`oauth2/github({code: ${body.code})} => ${JSON.stringify(data)}`)
        return { no: 500, msg: data.error_description };
    }
    let github_user: GithubUser = await axios.get('https://api.github.com/user', {
        headers: {
            Authorization: 'token ' + data.access_token,
        }
    }).then(({ data }) => data);
    if (!github_user.id && !github_user.login) {
        console.log(`oauth2/github({code: ${body.code}, token: ${data.access_token})} => ${JSON.stringify(github_user)}`)
        return 500;
    }
    let newuser: de.User = {
        create_at: Date.now(),
        account: github_user.login,
        avatar: github_user.avatar_url,
        email: github_user.email,
        name: github_user.name,
        profile: github_user.bio,
        github_id: github_user.id,
    }
    let user: db.User | number = await db.select('user').where({ github_id: newuser.github_id }).first()
    if (!user) {
        user = await db.insert('user', newuser).id();
    }
    await lib.getUserInfo(req, user)
    let redirect_url = body.from
    if (/#/.test(redirect_url)) {
        res.end(`<script>location.href='${redirect_url}'</script>`)
    } else {
        res.writeHead(302, {
            Location: redirect_url,
        })
        res.end()
    }
    res._sent = true;
}