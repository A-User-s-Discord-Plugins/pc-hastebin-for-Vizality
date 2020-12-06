const { Plugin } = require('@vizality/entities');
const { get, post } = require('@vizality/http');
const { clipboard } = require('electron');

const Settings = require('./Settings.jsx');

module.exports = class Hastebin extends Plugin {
  onStart () {
    const domain = this.settings.get('domain', 'https://paste.vizality.com/');

    vizality.api.settings.registerAddonSettings({
      id: this.entityID,
      heading: 'Hastebin',
      render: Settings
    })

    vizality.api.commands.registerCommand({
      command: 'hastebin',
      description: 'Lets you paste content to Hastebin',
      usage: '{c} [--send] <--clipboard | FILE_URL>',
      executor: async (args) => {
        const send = args.includes('--send')
          ? !!args.splice(args.indexOf('--send'), 1)
          : this.settings.get('send', false);

        const data = args.includes('--clipboard')
          ? clipboard.readText()
          : await this.parseArguments(args);

        /* Check if there is any data*/
        if (!data) {
          return {
            send: false,
            result: `Invalid arguments. Run \`${powercord.api.commands.prefix}help hastebin\` for more information.`
          };
        }

        try {
          /* Uploading */

          const { body } = await post(`${domain}/documents`).send(data)

          /* Outputing */
          return {send, result: `${domain}/${body.key}`};
        } catch (e) {
          return {
            send: false,
            result: `Upload to the specified domain ${domain} failed. Please check that the server is setup properly.`
          };
        }
      }
    });
  }

  onStop () {
    vizality.api.settings.unregisterSettings(this.entityID);
    vizality.api.commands.unregisterCommand('hastebin');
  }

  parseArguments (args) {
    const input = args.join(' ');
    if (input.startsWith('https://cdn.discordapp.com/attachments')) {
      return get(input).then(res => res.raw);
    }

    return false;
  }
};
