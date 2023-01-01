const { mkdirSync, writeFileSync, readFileSync, rmSync } = require('fs');
const { Snowflake } = require('discord.js');
const { sep } = require('path');

module.exports = class Database {
    constructor() {
        this.dirname = `${process.cwd()}${sep}db`;
    }

    /**
     * Add a guild to the database
     * @param {Snowflake} guildId The id of the guild
     * @returns {Promise<false | string>} false if a success otherwise it returns the error
     */
    async add(guildId) {
        try {   
            // create the guild folder
            var guildDir = `${this.dirname}${sep}${guildId}`
            await mkdirSync(guildDir);

            // create the guild data file
            let data = {
                enabled: false,
                password: null,
                verifiedRoleId: null,
                verifyChannel: null,
                users: {}
            }
            await writeFileSync(`${guildDir}${sep}data.json`, JSON.stringify(data, null, 4));

            return false;
        } catch (err) {
            await rmSync(guildDir, { recursive: true, force: true });
            return err;
        }
    }

    /**
     * The options for a guild
     * @typedef {object} data
     * @property {boolean} enabled Weather or not the bot is enabled in this guild (will be false if verifiedRoleId is null)
     * @property {string | null} password The password for this data
     * @property {Snowflake | null} verifiedRoleId The id of the verified role
     * @property {Snowflake | null} verifyChannel The id of the verify channel
     * @property {object} users The access tokens for each verified user
     */

    /**
     * @param {Snowflake} guildId The id of the guild
     * @returns {Promise<data>} The options for the guild
     */
    async getData(guildId) {
        try {
            var dataFile = `${this.dirname}${sep}${guildId}${sep}data.json`;
            const data = await readFileSync(dataFile, { encoding: 'utf8' });
            const json = await JSON.parse(data);
            return json;
        } catch (err) {
            console.error(new Error(err));
        }
    }

    /**
     * @param {Snowflake} guildId The id of the guild
     * @param {object} data The data
     */
    async setData(guildId, data) {
        try {
            var dataFile = `${this.dirname}${sep}${guildId}${sep}data.json`;
            writeFileSync(dataFile, JSON.stringify(data, null, 4));
        } catch (err) {
            console.error(new Error(err));
        }
    }

    /**
     * @param {Snowflake} guildId The id of the guild
     */
    async delete(guildId) {
        try {
            var guildDir = `${this.dirname}${sep}${guildId}`;
            await rmSync(guildDir, { recursive: true, force: true });
        } catch (err) {
            console.error(new Error(err));
        }
    }
}