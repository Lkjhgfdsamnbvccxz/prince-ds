import { WAMessageStubType } from '@whiskeysockets/baileys';
import PhoneNumber from 'awesome-phonenumber';
import chalk from 'chalk';
import { watchFile } from 'fs';

const terminalImage = global.opts['img'] ? require('terminal-image') : '';
const urlRegex = (await import('url-regex-safe')).default({ strict: false });

export default async function (m, conn = { user: {} }) {
  try {
    let senderMasked = 'MASKED'; // Masked sender
    let chatMasked = 'MASKED'; // Masked chat
    let img;
    try {
      if (global.opts['img']) {
        img = /sticker|image/gi.test(m.mtype)
          ? await terminalImage.buffer(await m.download())
          : false;
      }
    } catch (e) {
      console.error('Error loading image:', e);
    }

    let filesize =
      (m.msg
        ? m.msg.vcard
          ? m.msg.vcard.length
          : m.msg.fileLength
          ? m.msg.fileLength.low || m.msg.fileLength
          : m.msg.axolotlSenderKeyDistributionMessage
          ? m.msg.axolotlSenderKeyDistributionMessage.length
          : m.text
          ? m.text.length
          : 0
        : m.text
        ? m.text.length
        : 0) || 0;

    // Log sanitized output
    console.log(
      `
${chalk.hex('#FE0041').bold('┎━─━─━─━─━─━─━━──━━──━')}
🤖 ${chalk.cyan('Bot')} ⏰ ${chalk.black(
        chalk.bgGreen(
          new Date()
            .toLocaleTimeString('es-ES', { timeZone: 'Asia/Karachi' })
            .toString()
        )
      )} 📁 ${chalk.black(chalk.bgGreen('MASKED'))} ${chalk.magenta(
        `${filesize}B`
      )} 
👤 ${chalk.redBright(senderMasked)} 🪙 ${chalk.yellow('MASKED')}
👥 ${chalk.green(chatMasked)} ${chalk.black(chalk.bgYellow(m.mtype || ''))}
${chalk.hex('#FE0041').bold('┕━─━─━─━─━─━─━━──━━──━')}
      `.trim()
    );

    if (img) console.log('Image received:', img.trimEnd());
    if (typeof m.text === 'string' && m.text) {
      let log = m.text.replace(/\u200e+/g, 'MASKED');
      let mdRegex =
        /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g;
      let mdFormat = (depth = 4) => (_, type, text, monospace) => {
        let types = {
          _: 'italic',
          '*': 'bold',
          '~': 'strikethrough',
        };
        text = text || monospace;
        let formatted =
          !types[type] || depth < 1
            ? text
            : chalk[types[type]](
                text.replace(mdRegex, mdFormat(depth - 1))
              );
        return formatted;
      };
      if (log.length < 1024)
        log = log.replace(urlRegex, (url) => chalk.blueBright('MASKED URL'));
      log = log.replace(mdRegex, mdFormat(4));
      console.log(
        m.error != null
          ? chalk.red(log)
          : m.isCommand
          ? chalk.yellow('MASKED COMMAND')
          : 'MASKED LOG'
      );
    }
    if (m.messageStubParameters)
      console.log(
        m.messageStubParameters
          .map(() => chalk.gray('MASKED MESSAGE STUB'))
          .join(', ')
      );
    if (/document/i.test(m.mtype)) console.log('📄 Document received');
    else if (/ContactsArray/i.test(m.mtype)) console.log('👥 Contacts received');
    else if (/contact/i.test(m.mtype)) console.log('👤 Contact received');
    else if (/audio/i.test(m.mtype)) {
      const duration = m.msg.seconds || 0;
      console.log(
        `${m.msg.ptt ? '🎤 (PTT ' : '🎶 ('}AUDIO) ${Math.floor(
          duration / 60
        )
          .toString()
          .padStart(2, 0)}:${(duration % 60)
          .toString()
          .padStart(2, 0)}`
      );
    }
  } catch (err) {
    console.error('An error occurred:', err);
  }

  console.log();

  let file = global.__filename(import.meta.url);
  watchFile(file, () => {
    console.log(chalk.redBright("Update 'lib/print.js'"));
  });
}
