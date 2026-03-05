/**
 * Web build için stub. Native reklam modülü web'de çalışmaz; bu dosya Metro ile
 * web platformunda bu paketen yerine çözümlenir.
 */
const noop = () => {};

module.exports = {
  default: () => ({
    initialize: () => Promise.resolve(),
  }),
  TestIds: { REWARDED: 'test' },
  useRewardedAd: () => ({
    isLoaded: false,
    isEarnedReward: false,
    show: noop,
    load: noop,
    isClosed: false,
  }),
};
