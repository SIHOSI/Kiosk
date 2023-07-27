const NodeCache = require('node-cache');
const optionsCache = new NodeCache();
const { Options } = require('../../models');

const cacheOptionsData = async () => {
  try {
    const options = await Options.findAll();

    optionsCache.set('options', options);
  } catch (error) {
    console.error('캐시 저장 오류.', error);
  }
};

module.exports = {
  cacheOptionsData,
  optionsCache,
};
