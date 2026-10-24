import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api';
import MoodRatingInput from './MoodRatingInput';
import { Moon, MessageSquare, Tag, Calendar, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const checkInSchema = z.object({
  mood: z.number({ required_error: 'Please pick your mood' }).int().min(1).max(5),
  sleep_hours: z
    .number({ invalid_type_error: 'Enter a valid number of sleep hours' })
    .min(0, 'Sleep cannot be negative')
    .max(24, 'Sleep hours cannot exceed 24'),
  reflection: z
    .string()
    .trim()
    .min(1, 'Please write at least a few words for your reflection')
    .max(500, 'Reflection cannot exceed 500 characters'),
  feelings: z.array(z.number()).min(1, 'Select at least one feeling that describes your day'),
  entry_date: z.string().optional(),
});

export default function CheckInForm({ onEntryCreated, todayDate }) {
  const [feelingsList, setFeelingsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      mood: 4,
      sleep_hours: 7.5,
      reflection: '',
      feelings: [],
      entry_date: todayDate || new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    async function fetchFeelings() {
      try {
        const data = await api.getFeelings();
        setFeelingsList(data);
      } catch (err) {
        console.error('Failed to load feelings', err);
      }
    }
    fetchFeelings();
  }, []);

  const selectedFeelings = watch('feelings') || [];
  const reflectionText = watch('reflection') || '';
  const sleepValue = watch('sleep_hours');

  const toggleFeeling = (id) => {
    if (selectedFeelings.includes(id)) {
      setValue(
        'feelings',
        selectedFeelings.filter((f) => f !== id),
        { shouldValidate: true }
      );
    } else {
      setValue('feelings', [...selectedFeelings, id], { shouldValidate: true });
    }
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    setApiError(null);
    setSuccessMsg(null);

    try {
      const created = await api.createEntry(formData);
      setSuccessMsg('Your check-in has been recorded successfully!');
      reset();
      if (onEntryCreated) {
        onEntryCreated(created);
      }
    } catch (err) {
      if (err.code === 'DUPLICATE_ENTRY_TODAY' || err.status === 409) {
        setApiError('You have already logged an entry for this day! Check-ins are limited to once per calendar day.');
      } else {
        setApiError(err.message || 'Failed to submit check-in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daily Mood Check-in</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Reflect on your mood, rest, and emotions to build your personal time-series data.
          </p>
        </div>
      </div>

      {apiError && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to save check-in</p>
            <p className="text-xs sm:text-sm mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {/* Mood 1-5 selector */}
        <Controller
          name="mood"
          control={control}
          render={({ field }) => (
            <MoodRatingInput
              value={field.value}
              onChange={field.onChange}
              error={errors.mood?.message}
            />
          )}
        />

        {/* Sleep Hours */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-500" />
              Hours of Sleep <span className="text-rose-500">*</span>
            </label>
            <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
              {Number(sleepValue || 0).toFixed(1)} hrs
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              {...register('sleep_hours', { valueAsNumber: true })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>0h</span>
              <span>4h</span>
              <span>8h (Ideal)</span>
              <span>12h</span>
              <span>16h+</span>
            </div>
          </div>
          {errors.sleep_hours && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.sleep_hours.message}</p>
          )}
        </div>

        {/* Feelings Multi-select */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-indigo-500" />
            How would you describe your feelings? <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {feelingsList.map((feeling) => {
              const active = selectedFeelings.includes(feeling.id);
              return (
                <button
                  type="button"
                  key={feeling.id}
                  onClick={() => toggleFeeling(feeling.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {feeling.label}
                </button>
              );
            })}
          </div>
          {errors.feelings && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.feelings.message}</p>
          )}
        </div>

        {/* Reflection Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Daily Reflection <span className="text-rose-500">*</span>
            </label>
            <span
              className={`text-xs font-mono ${
                reflectionText.length > 450 ? 'text-amber-600 font-bold' : 'text-slate-400'
              }`}
            >
              {reflectionText.length}/500 chars
            </span>
          </div>
          <textarea
            rows={3}
            placeholder="What went well today? What challenges did you face? Any thoughts or feelings to note?"
            {...register('reflection')}
            className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
              errors.reflection ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-600'
            }`}
          />
          {errors.reflection && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.reflection.message}</p>
          )}
        </div>

        {/* Date Selector (optional override for missed days) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Check-in Date:</span>
            <input
              type="date"
              {...register('entry_date')}
              className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-sm shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Log Check-in</span>
          </button>
        </div>
      </form>
    </div>
  );
}
