const { Client, IntentsBitField: { Flags }, Collection, Snowflake } = require('discord.js');
const Database = require('../db/Database');

module.exports = class extends Client {
    constructor() {
        super({ intents: [Flags.Guilds], ws: { properties: { browser: 'Discord iOS' } } });

        this.verify = {};
        this.commands = {};
        this.db = new Database();
        this.config = require('../config');
    }
}