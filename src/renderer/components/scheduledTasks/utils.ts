import { i18nService } from '../../services/i18n';
import type { Schedule } from '../../types/scheduledTask';

const weekdayKeys: Record<number, string> = {
  0: 'scheduledTasksFormWeekSun',
  1: 'scheduledTasksFormWeekMon',
  2: 'scheduledTasksFormWeekTue',
  3: 'scheduledTasksFormWeekWed',
  4: 'scheduledTasksFormWeekThu',
  5: 'scheduledTasksFormWeekFri',
  6: 'scheduledTasksFormWeekSat',
};

export function formatScheduleLabel(schedule: Schedule): string {
  if (schedule.type === 'at') {
    const dt = schedule.datetime ?? '';
    if (dt.includes('T')) {
      const date = new Date(dt);
      return `${i18nService.t('scheduledTasksFormScheduleModeOnce')} · ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return i18nService.t('scheduledTasksFormScheduleModeOnce');
  }

  if (schedule.type === 'cron' && schedule.expression) {
    const parts = schedule.expression.trim().split(/\s+/);
    if (parts.length >= 5) {
      const [min, hour, dom, , dow] = parts;
      const timeStr = `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;

      if (dow !== '*' && dom === '*') {
        const dayNum = parseInt(dow) || 0;
        return `${i18nService.t('scheduledTasksFormScheduleModeWeekly')} · ${i18nService.t(weekdayKeys[dayNum] ?? 'scheduledTasksFormWeekSun')} ${timeStr}`;
      }
      if (dom !== '*' && dow === '*') {
        return `${i18nService.t('scheduledTasksFormScheduleModeMonthly')} · ${dom}${i18nService.t('scheduledTasksFormMonthDaySuffix')} ${timeStr}`;
      }
      return `${i18nService.t('scheduledTasksFormScheduleModeDaily')} · ${timeStr}`;
    }
  }

  if (schedule.type === 'interval') {
    const unitKey = schedule.unit === 'minutes' ? 'scheduledTasksFormIntervalMinutes' :
      schedule.unit === 'hours' ? 'scheduledTasksFormIntervalHours' : 'scheduledTasksFormIntervalDays';
    return `${i18nService.t('scheduledTasksScheduleEvery')} ${schedule.value ?? 0} ${i18nService.t(unitKey)}`;
  }

  return '';
}

export function formatDuration(ms: number | null): string {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60000)}m`;
}
