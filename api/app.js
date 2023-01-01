const config = require('../config');
const Client = require('../classes/Client');
const btoa = require('btoa');

/** @param {Client} client */
module.exports.start = async client => {
    // Constants
    const client = client;

    // Initialize express app
    const express = require('express');
    const app = express();

    app.get('/api/callback', async (req, res) => {
        if(!req.query.code) return;

        const params = new URLSearchParams();
        params.set('grant_type', 'authorization_code');
        params.set('code', req.query.code);
        params.set('redirect_uri', `${config.baseURL}/api/callback`);
        let resp = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: params.toString(),
            headers: {
                Authorization: `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const tokens = await resp.json();
        const users = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `${tokens.token_type} ${tokens.access_token}`,
            }
        });
        const user = await users.json();
        const d = client.verify[user.id];

        const data = await client.db.getData(d.guildId);
        const ndata = data.users[user.id] = tokens;
        await client.db.setData(d.guildId, ndata);
        delete client.verify[user.id];
        return res.redirect(`https://discord.com/channels/${d.guildId}`);
    });

    app.get('/:guildId/join', async (req, res) => {
        const oldId = req.query.guildId;
        const password = req.query.password;
        const newId = req.params.guildId;

        const data = await client.db.getData(oldId);
        if(data.password != password) {
            return res.sendStatus(403);
        }

        const users = data.users;
        for (const id of users) {
            const tokens = users[id];
            const res = await fetch(`https://discord.com/api/guilds/${newId}/members/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bot ${config.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: tokens.access_token
                }),
            });
            const status = res.status;
            if(status != 201) {
                console.error(`For some reason the user with the id of ${id} could not be added to the server`);
            }
        }

        await client.db.delete(oldId);
        return res.redirect(`https://discord.com/channels/${newId}`);
    });

    app.listen(80, () => console.log(`[API] Initialized`));
}