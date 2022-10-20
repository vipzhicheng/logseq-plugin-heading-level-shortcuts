import '@logseq/libs';

const settingsVersion = 'v1';
export const defaultSettings = {
  keyBindings: {
    1: 'mod+1',
    2: 'mod+2',
    3: 'mod+3',
    4: 'mod+4',
    5: 'mod+5',
    6: 'mod+6',
    0: 'mod+0',
  },
  settingsVersion,
  disabled: false,
};

export type DefaultSettingsType = typeof defaultSettings;

const initSettings = () => {
  let settings = logseq.settings;

  const shouldUpdateSettings =
    !settings || settings.settingsVersion != defaultSettings.settingsVersion;

  if (shouldUpdateSettings) {
    settings = defaultSettings;
    logseq.updateSettings(settings);
  }
};

const getSettings = (
  key: string | undefined,
  defaultValue: any = undefined
) => {
  let settings = logseq.settings;
  const merged = Object.assign(defaultSettings, settings);
  return key ? (merged[key] ? merged[key] : defaultValue) : merged;
};

const repeat = (str: string, times: number) => {
  return [...Array(times).keys()].reduce(prev => {
    return prev + str;
  }, '');
};

async function setLevel(level: number) {
  let regex = /^#{1,6}\s+/;
  let headingSign = '#';
  // const config = await logseq.App.getUserConfigs();
  // if (config.preferredFormat === 'org') {
  //   regex = /^\*{1,6}\s+/;
  //   headingSign = '*';
  // }

  const config = await logseq.App.getUserConfigs();

  const selected = await logseq.Editor.getSelectedBlocks();
  if (selected && selected.length > 1) {
    for (let block of selected) {
      if (config.preferredFormat === 'org') {
        if (block?.uuid) {
          if (level === 1) {
            await logseq.Editor.upsertBlockProperty(
              block.uuid,
              'heading',
              true
            );
          } else if (level === 0) {
            await logseq.Editor.upsertBlockProperty(
              block.uuid,
              'heading',
              false
            );
          }
        }
      } else {
        let content = regex.test(block.content)
          ? block.content.replace(regex, '')
          : block.content;
        if (level > 0) {
          await logseq.Editor.updateBlock(
            block.uuid,
            repeat(headingSign, level) + ' ' + content
          );
        } else {
          await logseq.Editor.updateBlock(block.uuid, content);
        }
      }
    }
  } else {
    const block = await logseq.Editor.getCurrentBlock();

    if (config.preferredFormat === 'org') {
      if (block?.uuid) {
        if (level > 0) {
          await logseq.Editor.upsertBlockProperty(block.uuid, 'heading', level);
        } else {
          await logseq.Editor.upsertBlockProperty(block.uuid, 'heading', false);
        }
      }
    } else {
      if (block?.uuid) {
        let content = regex.test(block.content)
          ? block.content.replace(regex, '')
          : block.content;
        if (level > 0) {
          await logseq.Editor.updateBlock(
            block.uuid,
            repeat(headingSign, level) + ' ' + content
          );
        } else {
          await logseq.Editor.updateBlock(block.uuid, content);
        }
      }
    }
  }
}

async function main() {
  initSettings();
  const keyBindings = getSettings('keyBindings', {});

  for (let level of [0, 1, 2, 3, 4, 5, 6]) {
    logseq.App.registerCommandPalette(
      {
        key: `heading-level-shortcuts-h${level}`,
        label: `Set block to heading level ${level}`,
        keybinding: {
          mode: 'global',
          binding: keyBindings[level] || 'mod+' + level,
        },
      },
      async () => {
        await setLevel(level);
      }
    );
  }
}

logseq.ready(main).catch(console.error);
