/**
 * 集中管理所有业务 API 端点。
 * 后续新增的业务接口也应在此文件中配置。
 */

import { configService } from './config';

const isTestMode = () => {
  return configService.getConfig().app?.testMode === true;
};

// 自动更新
export const getUpdateCheckUrl = () => isTestMode()
  ? 'https://api-overmind.qzsyzn.com/openapi/get/luna/hardware/lobsterai/test/update'
  : 'https://api-overmind.qzsyzn.com/openapi/get/luna/hardware/lobsterai/prod/update';

// 手动检查更新
export const getManualUpdateCheckUrl = () => isTestMode()
  ? 'https://api-overmind.qzsyzn.com/openapi/get/luna/hardware/lobsterai/test/update-manual'
  : 'https://api-overmind.qzsyzn.com/openapi/get/luna/hardware/lobsterai/prod/update-manual';

export const getFallbackDownloadUrl = () => isTestMode()
  ? 'https://lobsterai.inner.qzsyzn.com/#/download-list'
  : 'https://lobsterai.qzsyzn.com/#/download-list';

// Skill 商店
export const getSkillStoreUrl = () => isTestMode()
  ? 'https://api-overmind.qzsyzn.com/openapi/get/luna/hardware/lobsterai/test/skill-store'
  : 'https://api-overmind.qzsyzn.com/openapi/get/luna/hardware/lobsterai/prod/skill-store';

// 登录地址
export const getLoginOvermindUrl = () => isTestMode()
  ? 'https://api-overmind.qzsyzn.com/openapi/get/luna/hardware/lobsterai/test/login-url'
  : 'https://api-overmind.qzsyzn.com/openapi/get/luna/hardware/lobsterai/prod/login-url';

// Portal 页面
const PORTAL_BASE_TEST = 'https://c.qzsyzn.com/dict/hardware/cowork/lobsterai-portal.html#';
const PORTAL_BASE_PROD = 'https://c.qzsyzn.com/dict/hardware/octopus/lobsterai-portal.html#';

const getPortalBase = () => isTestMode() ? PORTAL_BASE_TEST : PORTAL_BASE_PROD;

export const getPortalPricingUrl = () => `${getPortalBase()}/pricing`;
export const getPortalProfileUrl = () => `${getPortalBase()}/profile`;
