import React from 'react';
import { i18nService } from '../../../services/i18n';
import IMSettings from '../../im/IMSettings';
import EmailSkillConfig from '../../skills/EmailSkillConfig';
import SettingsCard from '../shared/SettingsCard';

const IntegrationsPanel: React.FC = () => (
  <div className="space-y-8">
    <SettingsCard
      title={i18nService.t('integrationsImSectionTitle')}
      description={i18nService.t('integrationsImSectionDescription')}
    >
      <IMSettings />
    </SettingsCard>
    <SettingsCard
      title={i18nService.t('integrationsEmailSectionTitle')}
      description={i18nService.t('integrationsEmailSectionDescription')}
    >
      <EmailSkillConfig />
    </SettingsCard>
  </div>
);

export default IntegrationsPanel;
