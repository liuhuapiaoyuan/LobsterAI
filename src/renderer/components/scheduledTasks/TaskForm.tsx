import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { scheduledTaskService } from '../../services/scheduledTask';
import { i18nService } from '../../services/i18n';
import { imService } from '../../services/im';
import { getVisibleIMPlatforms } from '../../utils/regionFilter';
import type { ScheduledTask, Schedule, ScheduledTaskInput, NotifyPlatform } from '../../types/scheduledTask';
import type { IMGatewayConfig } from '../../types/im';

// OpenClaw-supported notification platforms (excludes direct gateways like nim, xiaomifeng)
const OPENCLAW_NOTIFY_PLATFORMS: ReadonlySet<string> = new Set(['dingtalk', 'feishu', 'wecom', 'qq', 'telegram', 'discord']);

// Delivery target format builders per platform (must match PLATFORM_TO_CHANNEL in cronJobService)
const PLATFORM_DELIVERY_FORMAT: Record<NotifyPlatform, {
  dmFormat: (id: string) => string;
  groupFormat?: (id: string) => string;
}> = {
  qq:       { dmFormat: id => `qqbot:c2c:${id}`,                  groupFormat: id => `qqbot:group:${id}` },
  telegram: { dmFormat: id => `telegram:${id}`,                   groupFormat: id => `telegram:group:${id}` },
  discord:  { dmFormat: id => `discord:${id}`,                    groupFormat: id => `discord:channel:${id}` },
  feishu:   { dmFormat: id => `feishu:${id}`,     groupFormat: id => `feishu:group:${id}` },
  wecom:    { dmFormat: id => `wecom:${id}`,      groupFormat: id => `wecom:group:${id}` },
  dingtalk: { dmFormat: id => `dingtalk-connector:${id}` },
};

interface DeliveryTargetOption {
  value: string;
  label: string;
  source?: string;
}

function getDeliveryTargetOptions(platform: NotifyPlatform, imConfig: IMGatewayConfig): DeliveryTargetOption[] {
  const config = imConfig[platform];
  if (!config || !('enabled' in config)) return [];

  const fmt = PLATFORM_DELIVERY_FORMAT[platform];
  if (!fmt) return [];

  const options: DeliveryTargetOption[] = [];
  const dmLabel = i18nService.t('scheduledTasksFormDeliveryToDm');
  const groupLabel = i18nService.t('scheduledTasksFormDeliveryToGroup');

  if ('allowFrom' in config && Array.isArray(config.allowFrom)) {
    for (const id of config.allowFrom) {
      if (id) options.push({ value: fmt.dmFormat(id), label: `${dmLabel} ${id}` });
    }
  }

  if (fmt.groupFormat && 'groupAllowFrom' in config && Array.isArray((config as unknown as Record<string, unknown>).groupAllowFrom)) {
    for (const id of (config as unknown as { groupAllowFrom: string[] }).groupAllowFrom) {
      if (id) options.push({ value: fmt.groupFormat!(id), label: `${groupLabel} ${id}` });
    }
  }

  return options;
}

interface TaskFormProps {
  mode: 'create' | 'edit';
  task?: ScheduledTask;
  onCancel: () => void;
  onSaved: () => void;
}

type ScheduleMode = 'once' | 'daily' | 'weekly' | 'monthly';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const; // 0=Sunday

// Parse existing schedule into UI state
function parseScheduleToUI(schedule: Schedule): {
  mode: ScheduleMode;
  date: string;
  time: string;
  weekday: number;
  monthDay: number;
} {
  const defaults = { mode: 'once' as ScheduleMode, date: '', time: '09:00', weekday: 1, monthDay: 1 };

  if (schedule.type === 'at') {
    const dt = schedule.datetime ?? '';
    // datetime-local format: "YYYY-MM-DDTHH:MM"
    if (dt.includes('T')) {
      return { ...defaults, mode: 'once', date: dt.slice(0, 10), time: dt.slice(11, 16) };
    }
    return { ...defaults, mode: 'once', date: dt.slice(0, 10) };
  }

  if (schedule.type === 'cron' && schedule.expression) {
    const parts = schedule.expression.trim().split(/\s+/);
    if (parts.length >= 5) {
      const [min, hour, dom, , dow] = parts;
      const timeStr = `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;

      if (dow !== '*' && dom === '*') {
        // Weekly: M H * * DOW
        return { ...defaults, mode: 'weekly', time: timeStr, weekday: parseInt(dow) || 0 };
      }
      if (dom !== '*' && dow === '*') {
        // Monthly: M H DOM * *
        return { ...defaults, mode: 'monthly', time: timeStr, monthDay: parseInt(dom) || 1 };
      }
      // Daily: M H * * *
      return { ...defaults, mode: 'daily', time: timeStr };
    }
  }

  // Fallback for interval type - treat as daily
  if (schedule.type === 'interval') {
    return { ...defaults, mode: 'daily' };
  }

  return defaults;
}

const TaskForm: React.FC<TaskFormProps> = ({ mode, task, onCancel, onSaved }) => {
  const coworkConfig = useSelector((state: RootState) => state.cowork.config);
  const imConfig = useSelector((state: RootState) => state.im.config);
  const defaultWorkingDirectory = coworkConfig?.workingDirectory ?? '';

  // Language tracking for region-based platform filtering
  const [language, setLanguage] = useState<'zh' | 'en'>(i18nService.getLanguage());

  const visiblePlatforms = useMemo<NotifyPlatform[]>(() => {
    return (getVisibleIMPlatforms(language) as unknown as string[])
      .filter((p) => OPENCLAW_NOTIFY_PLATFORMS.has(p)) as NotifyPlatform[];
  }, [language]);

  // Parse existing schedule for edit mode
  const parsed = task ? parseScheduleToUI(task.schedule) : null;

  // Form state
  const [name, setName] = useState(task?.name ?? '');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>(parsed?.mode ?? 'once');
  const [scheduleDate, setScheduleDate] = useState(parsed?.date ?? '');
  const [scheduleTime, setScheduleTime] = useState(parsed?.time ?? '09:00');
  const [weekday, setWeekday] = useState(parsed?.weekday ?? 1);
  const [monthDay, setMonthDay] = useState(parsed?.monthDay ?? 1);
  const [prompt, setPrompt] = useState(task?.prompt ?? '');
  const [workingDirectory, setWorkingDirectory] = useState(task?.workingDirectory ?? '');
  const [expiresAt, setExpiresAt] = useState(task?.expiresAt ?? '');
  const [notifyPlatforms, setNotifyPlatforms] = useState<NotifyPlatform[]>(task?.notifyPlatforms ?? []);
  const [notifyDropdownOpen, setNotifyDropdownOpen] = useState(false);
  const notifyDropdownRef = useRef<HTMLDivElement>(null);
  const [deliveryTo, setDeliveryTo] = useState(task?.deliveryTo ?? '');
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const deliveryDropdownRef = useRef<HTMLDivElement>(null);
  const [dynamicTargets, setDynamicTargets] = useState<DeliveryTargetOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifyDropdownRef.current && !notifyDropdownRef.current.contains(e.target as Node)) {
        setNotifyDropdownOpen(false);
      }
      if (deliveryDropdownRef.current && !deliveryDropdownRef.current.contains(e.target as Node)) {
        setDeliveryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subscribe to language changes
  useEffect(() => {
    const unsubscribe = i18nService.subscribe(() => {
      setLanguage(i18nService.getLanguage());
    });
    return unsubscribe;
  }, []);

  // Load IM config on mount
  useEffect(() => {
    void imService.init();
  }, []);

  // Load dynamic delivery targets when platform changes
  useEffect(() => {
    const platform = notifyPlatforms[0];
    if (!platform) {
      setDynamicTargets([]);
      return;
    }
    const api = window.electron?.scheduledTasks;
    if (!api?.listDeliveryTargets) return;
    let cancelled = false;
    api.listDeliveryTargets(platform).then((result) => {
      if (cancelled) return;
      if (result.success && result.targets) {
        const targets = result.targets.map(t => ({ value: t.value, label: t.label, source: t.source }));
        setDynamicTargets(targets);
        // Auto-fill with first extracted target if deliveryTo is empty
        if (!deliveryTo) {
          const firstExtracted = targets.find(t => t.source === 'extracted');
          if (firstExtracted) {
            setDeliveryTo(firstExtracted.value);
          }
        }
      }
    }).catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, [notifyPlatforms]);

  // Clean up selected platforms when visible list changes
  useEffect(() => {
    setNotifyPlatforms(prev => prev.filter(p => visiblePlatforms.includes(p)));
  }, [visiblePlatforms]);

  const isPlatformConfigured = (platform: NotifyPlatform): boolean => {
    const platformConfig = imConfig[platform];
    return platformConfig?.enabled ?? false;
  };

  const buildSchedule = (): Schedule => {
    const [hour, min] = scheduleTime.split(':').map(Number);
    switch (scheduleMode) {
      case 'once':
        return { type: 'at', datetime: `${scheduleDate}T${scheduleTime}` };
      case 'daily':
        return { type: 'cron', expression: `${min} ${hour} * * *` };
      case 'weekly':
        return { type: 'cron', expression: `${min} ${hour} * * ${weekday}` };
      case 'monthly':
        return { type: 'cron', expression: `${min} ${hour} ${monthDay} * *` };
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = i18nService.t('scheduledTasksFormValidationNameRequired');
    if (!prompt.trim()) newErrors.prompt = i18nService.t('scheduledTasksFormValidationPromptRequired');
    if (!(workingDirectory.trim() || defaultWorkingDirectory.trim())) {
      newErrors.workingDirectory = i18nService.t('scheduledTasksFormValidationWorkingDirectoryRequired');
    }
    if (scheduleMode === 'once') {
      if (!scheduleDate || !scheduleTime) {
        newErrors.schedule = i18nService.t('scheduledTasksFormValidationDatetimeFuture');
      } else if (new Date(`${scheduleDate}T${scheduleTime}`).getTime() <= Date.now()) {
        newErrors.schedule = i18nService.t('scheduledTasksFormValidationDatetimeFuture');
      }
    }
    if (!scheduleTime) {
      newErrors.schedule = i18nService.t('scheduledTasksFormValidationTimeRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const input: ScheduledTaskInput = {
        name: name.trim(),
        description: '',
        schedule: buildSchedule(),
        prompt: prompt.trim(),
        workingDirectory: workingDirectory.trim() || defaultWorkingDirectory,
        systemPrompt: '',
        executionMode: task?.executionMode ?? 'auto',
        expiresAt: expiresAt || null,
        notifyPlatforms,
        deliveryTo,
        enabled: task?.enabled ?? true,
      };
      if (mode === 'create') {
        await scheduledTaskService.createTask(input);
      } else if (task) {
        await scheduledTaskService.updateTaskById(task.id, input);
      }
      onSaved();
    } catch {
      // Error handled by service
    } finally {
      setSubmitting(false);
    }
  };

  const handleBrowseDirectory = async () => {
    try {
      const result = await window.electron?.dialog?.selectDirectory();
      if (result?.success && result.path) {
        setWorkingDirectory(result.path);
      }
    } catch {
      // ignore
    }
  };

  const weekdayKeys: Record<number, string> = {
    0: 'scheduledTasksFormWeekSun',
    1: 'scheduledTasksFormWeekMon',
    2: 'scheduledTasksFormWeekTue',
    3: 'scheduledTasksFormWeekWed',
    4: 'scheduledTasksFormWeekThu',
    5: 'scheduledTasksFormWeekFri',
    6: 'scheduledTasksFormWeekSat',
  };

  const inputClass = 'w-full rounded-lg border dark:border-claude-darkBorder border-claude-border dark:bg-claude-darkSurface bg-white px-3 py-2 text-sm dark:text-claude-darkText text-claude-text focus:outline-none focus:ring-2 focus:ring-claude-accent/50';
  const labelClass = 'block text-sm font-medium dark:text-claude-darkText text-claude-text mb-1';
  const errorClass = 'text-xs text-red-500 mt-1';

  const scheduleModes: ScheduleMode[] = ['once', 'daily', 'weekly', 'monthly'];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold dark:text-claude-darkText text-claude-text">
        {mode === 'create' ? i18nService.t('scheduledTasksFormCreate') : i18nService.t('scheduledTasksFormUpdate')}
      </h2>

      {/* Name */}
      <div>
        <label className={labelClass}>{i18nService.t('scheduledTasksFormName')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder={i18nService.t('scheduledTasksFormNamePlaceholder')}
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      {/* Prompt */}
      <div>
        <label className={labelClass}>{i18nService.t('scheduledTasksPrompt')}</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={inputClass + ' h-28 resize-none'}
          placeholder={i18nService.t('scheduledTasksFormPromptPlaceholder')}
        />
        {errors.prompt && <p className={errorClass}>{errors.prompt}</p>}
      </div>

      {/* Schedule */}
      <div>
        <label className={labelClass}>{i18nService.t('scheduledTasksFormScheduleType')}</label>
        <div className="grid grid-cols-3 gap-2">
          {/* Schedule Mode Dropdown */}
          <select
            value={scheduleMode}
            onChange={(e) => setScheduleMode(e.target.value as ScheduleMode)}
            className={inputClass}
          >
            {scheduleModes.map((m) => (
              <option key={m} value={m}>
                {i18nService.t(`scheduledTasksFormScheduleMode${m.charAt(0).toUpperCase() + m.slice(1)}`)}
              </option>
            ))}
          </select>

          {/* Second column: date/weekday/monthday or time (for daily) */}
          {scheduleMode === 'once' ? (
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              className={inputClass}
              min={new Date().toISOString().slice(0, 10)}
            />
          ) : scheduleMode === 'weekly' ? (
            <select
              value={weekday}
              onChange={(e) => setWeekday(parseInt(e.target.value))}
              className={inputClass}
            >
              {WEEKDAYS.map((d) => (
                <option key={d} value={d}>
                  {i18nService.t(weekdayKeys[d])}
                </option>
              ))}
            </select>
          ) : scheduleMode === 'monthly' ? (
            <select
              value={monthDay}
              onChange={(e) => setMonthDay(parseInt(e.target.value))}
              className={inputClass}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}{i18nService.t('scheduledTasksFormMonthDaySuffix')}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              className={inputClass}
            />
          )}

          {/* Third column: time picker (or empty for daily) */}
          {scheduleMode === 'daily' ? (
            <div />
          ) : (
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
              className={inputClass}
            />
          )}
        </div>
        {errors.schedule && <p className={errorClass}>{errors.schedule}</p>}
      </div>

      {/* Working Directory */}
      <div>
        <label className={labelClass}>{i18nService.t('scheduledTasksFormWorkingDirectory')}</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={workingDirectory}
            onChange={(e) => setWorkingDirectory(e.target.value)}
            className={inputClass + ' flex-1'}
            placeholder={defaultWorkingDirectory || i18nService.t('scheduledTasksFormWorkingDirectoryPlaceholder')}
          />
          <button
            type="button"
            onClick={handleBrowseDirectory}
            className="px-3 py-2 text-sm rounded-lg border dark:border-claude-darkBorder border-claude-border dark:text-claude-darkTextSecondary text-claude-textSecondary hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors"
          >
            {i18nService.t('browse')}
          </button>
        </div>
      </div>
      {errors.workingDirectory && <p className={errorClass}>{errors.workingDirectory}</p>}

      {/* Expires At */}
      <div>
        <label className={labelClass}>
          {i18nService.t('scheduledTasksFormExpiresAt')}
          <span className="text-xs font-normal dark:text-claude-darkTextSecondary text-claude-textSecondary ml-1">
            {i18nService.t('scheduledTasksFormOptional')}
          </span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
            className={inputClass + ' flex-1'}
            min={new Date().toISOString().slice(0, 10)}
          />
          {expiresAt && (
            <button
              type="button"
              onClick={() => setExpiresAt('')}
              className="px-3 py-2 text-sm rounded-lg border dark:border-claude-darkBorder border-claude-border dark:text-claude-darkTextSecondary text-claude-textSecondary hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors"
            >
              {i18nService.t('scheduledTasksFormExpiresAtClear')}
            </button>
          )}
        </div>
      </div>

      {/* Notification */}
      <div>
        <label className={labelClass}>
          {i18nService.t('scheduledTasksFormNotify')}
          <span className="text-xs font-normal dark:text-claude-darkTextSecondary text-claude-textSecondary ml-1">
            {i18nService.t('scheduledTasksFormOptional')}
          </span>
        </label>
        <div className="relative" ref={notifyDropdownRef}>
          <button
            type="button"
            onClick={() => setNotifyDropdownOpen(!notifyDropdownOpen)}
            className={inputClass + ' flex items-center justify-between cursor-pointer text-left'}
          >
            <span className={notifyPlatforms.length === 0 ? 'dark:text-claude-darkTextSecondary text-claude-textSecondary' : ''}>
              {notifyPlatforms.length === 0
                ? i18nService.t('scheduledTasksFormNotifyNone')
                : i18nService.t(`scheduledTasksFormNotify${notifyPlatforms[0].charAt(0).toUpperCase() + notifyPlatforms[0].slice(1)}`)}
            </span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${notifyDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {notifyDropdownOpen && (
            <div className="absolute z-10 bottom-full mb-1 w-full rounded-lg border dark:border-claude-darkBorder border-claude-border dark:bg-claude-darkSurface bg-white shadow-lg py-1">
              {/* None option */}
              <label
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors"
              >
                <input
                  type="radio"
                  name="notifyPlatform"
                  checked={notifyPlatforms.length === 0}
                  onChange={() => {
                    setNotifyPlatforms([]);
                    setDeliveryTo('');
                    setNotifyDropdownOpen(false);
                  }}
                  className="text-claude-accent focus:ring-claude-accent"
                />
                <span className="text-sm dark:text-claude-darkText text-claude-text">
                  {i18nService.t('scheduledTasksFormNotifyNone')}
                </span>
              </label>
              {visiblePlatforms.map((platform) => {
                const selected = notifyPlatforms.length > 0 && notifyPlatforms[0] === platform;
                const configured = isPlatformConfigured(platform);
                return (
                  <label
                    key={platform}
                    className={`flex items-center gap-2 px-3 py-2 transition-colors ${
                      configured ? 'cursor-pointer hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover' : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="radio"
                      name="notifyPlatform"
                      checked={selected}
                      disabled={!configured}
                      onChange={() => {
                        if (!configured) return;
                        setNotifyPlatforms([platform]);
                        setDeliveryTo('');
                        setNotifyDropdownOpen(false);
                      }}
                      className="text-claude-accent focus:ring-claude-accent disabled:cursor-not-allowed"
                    />
                    <span className="text-sm dark:text-claude-darkText text-claude-text">
                      {i18nService.t(`scheduledTasksFormNotify${platform.charAt(0).toUpperCase() + platform.slice(1)}`)}
                    </span>
                    {!configured && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-auto">
                        {i18nService.t('scheduledTasksFormNotifyNotConfigured')}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delivery Target (shown when a notify platform is selected) */}
      {notifyPlatforms.length > 0 && (() => {
        const selectedPlatform = notifyPlatforms[0];
        const configOptions = getDeliveryTargetOptions(selectedPlatform, imConfig);
        // Separate extracted targets (rule-based) from other dynamic targets
        const extractedTargets = dynamicTargets.filter(t => t.source === 'extracted');
        const otherDynamicTargets = dynamicTargets.filter(t => t.source !== 'extracted');
        // Merge: extracted first, then config options, then other dynamic targets; deduplicate by value
        const seen = new Set<string>();
        const targetOptions: DeliveryTargetOption[] = [];
        for (const list of [extractedTargets, configOptions, otherDynamicTargets]) {
          for (const opt of list) {
            if (!seen.has(opt.value)) {
              seen.add(opt.value);
              targetOptions.push(opt);
            }
          }
        }
        return (
          <div>
            <label className={labelClass}>
              {i18nService.t('scheduledTasksFormDeliveryTo')}
              <span className="text-xs font-normal dark:text-claude-darkTextSecondary text-claude-textSecondary ml-1">
                {i18nService.t('scheduledTasksFormOptional')}
              </span>
            </label>
            <div className="relative" ref={deliveryDropdownRef}>
              <div className="flex items-center gap-0">
                <input
                  type="text"
                  value={deliveryTo}
                  onChange={(e) => setDeliveryTo(e.target.value)}
                  onFocus={() => { if (targetOptions.length > 0) setDeliveryDropdownOpen(true); }}
                  className={inputClass + ' flex-1 rounded-r-none'}
                  placeholder={i18nService.t('scheduledTasksFormDeliveryToPlaceholder')}
                />
                {targetOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDeliveryDropdownOpen(!deliveryDropdownOpen)}
                    className="px-2 py-2 border dark:border-claude-darkBorder border-claude-border border-l-0 rounded-r-lg dark:bg-claude-darkSurface bg-white hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors"
                  >
                    <svg className={`w-4 h-4 dark:text-claude-darkTextSecondary text-claude-textSecondary transition-transform ${deliveryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              {deliveryDropdownOpen && targetOptions.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full rounded-lg border dark:border-claude-darkBorder border-claude-border dark:bg-claude-darkSurface bg-white shadow-lg py-1 max-h-48 overflow-y-auto">
                  {/* Auto-detect option */}
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryTo('');
                      setDeliveryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors ${
                      !deliveryTo ? 'dark:text-claude-accent text-claude-accent font-medium' : 'dark:text-claude-darkTextSecondary text-claude-textSecondary'
                    }`}
                  >
                    {i18nService.t('scheduledTasksFormDeliveryToAuto')}
                  </button>
                  {targetOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setDeliveryTo(opt.value);
                        setDeliveryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors ${
                        deliveryTo === opt.value ? 'dark:text-claude-accent text-claude-accent font-medium' : 'dark:text-claude-darkText text-claude-text'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg dark:text-claude-darkTextSecondary text-claude-textSecondary hover:bg-claude-surfaceHover dark:hover:bg-claude-darkSurfaceHover transition-colors"
        >
          {i18nService.t('cancel')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium bg-claude-accent text-white rounded-lg hover:bg-claude-accentHover transition-colors disabled:opacity-50"
        >
          {submitting
            ? i18nService.t('saving')
            : mode === 'create'
              ? i18nService.t('scheduledTasksFormCreate')
              : i18nService.t('scheduledTasksFormUpdate')}
        </button>
      </div>
    </div>
  );
};

export default TaskForm;
