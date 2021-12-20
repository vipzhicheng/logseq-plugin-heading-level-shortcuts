import '@logseq/libs';

const repeat = (str: string, times: number) => {
  return [...Array(times).keys()].reduce(prev => { return prev + str; }, '');
};

async function setLevel(level: number) {
  const block = await logseq.Editor.getCurrentBlock();
    if (block?.uuid) {
      let content = /^#{1,6}\s+/.test(block.content) ? block.content.replace(/^#{1,6}\s+/, '') : block.content;
      if (level > 0) {
        await logseq.Editor.updateBlock(block.uuid, repeat('#', level) + ' ' + content);
      } else {
        await logseq.Editor.updateBlock(block.uuid, content);
      }
    }
}

async function main() {
  for (let level of [0, 1, 2, 3, 4, 5, 6]) {
    logseq.App.registerCommandPalette({
      key: `heading-level-shortcuts-h${level}`,
      label: `Set block to heading level ${level}`,
      keybinding: {
        mode: 'global',
        binding: 'mod+' + level
      }
    }, async () => {
      await setLevel(level);
    });
  }
}

logseq.ready(main).catch(console.error);
