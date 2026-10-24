import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api';
import MoodRatingInput from './MoodRatingInput';
import { Moon, MessageSquare, Tag, Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

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
      setSuccessMsg('Your check-in has been logged successfully!');
      reset({
        mood: 4,
        sleep_hours: 7.5,
        reflection: '',
        feelings: [],
        entry_date: todayDate || new Date().toISOString().split('T')[0],
      });
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#EFEAE2]">
      {apiError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Unable to save check-in</p>
            <p className="text-xs sm:text-sm mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* Mood Interactive Selector matching Image 1 */}
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

        {/* Feelings Multi-select */}
        <div className="pt-4 border-t border-[#F4EFE8]">
          <label className="block text-xs font-bold text-espresso-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-terracotta" />
            Emotions & Feelings <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {feelingsList.map((feeling) => {
              const active = selectedFeelings.includes(feeling.id);
              return (
                <button
                  type="button"
                  key={feeling.id}
                  onClick={() => toggleFeeling(feeling.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-terracotta text-white shadow-xs'
                      : 'bg-cream-100 text-espresso-700 hover:bg-cream-200 border border-[#EAE2D7]'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {feeling.label}
                </button>
              );
            })}
          </div>
          {errors.feelings && (
            <p className="mt-1.5 text-xs text-rose-600 font-semibold">{errors.feelings.message}</p>
          )}
        </div>

        {/* Sleep Hours Slider */}
        <div className="pt-4 border-t border-[#F4EFE8]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-espresso-700 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-terracotta" />
              Hours of Sleep <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs font-extrabold text-espresso-800 bg-cream-100 px-3 py-1 rounded-full border border-[#EAE2D7]">
              {Number(sleepValue || 0).toFixed(1)} hrs
            </span>
          </div>

          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              {...register('sleep_hours', { valueAsNumber: true })}
              className="w-full h-2.5 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-terracotta"
            />
            <div className="flex justify-between text-[11px] font-semibold text-espresso-500">
              <span>0h</span>
              <span>4h</span>
              <span>8h (Ideal)</span>
              <span>12h</span>
              <span>16h+</span>
            </div>
          </div>
          {errors.sleep_hours && (
            <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.sleep_hours.message}</p>
          )}
        </div>

        {/* Reflection Textarea */}
        <div className="pt-4 border-t border-[#F4EFE8]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-espresso-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-terracotta" />
              Daily Reflection <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs font-semibold text-espresso-500">
              {reflectionText.length}/500 chars
            </span>
          </div>
          <textarea
            rows={3}
            placeholder="What shaped your day? Notice any thoughts, challenges, or moments of peace..."
            {...register('reflection')}
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-terracotta/20 transition-all ${
              errors.reflection
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-[#EAE2D7] bg-cream-50 focus:border-terracotta'
            }`}
          />
          {errors.reflection && (
            <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.reflection.message}</p>
          )}
        </div>

        {/* Date override & Terracotta Continue Button (Matching Image 1) */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-espresso-600">
            <Calendar className="w-4 h-4 text-terracotta" />
            <span>Date:</span>
            <input
              type="date"
              {...register('entry_date')}
              className="px-2.5 py-1 rounded-xl border border-[#EAE2D7] bg-cream-50 text-espresso-800 text-xs font-bold focus:outline-none focus:border-terracotta"
            />
          </div>

          {/* Wide Rounded Terracotta Button from Image 1 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 rounded-full bg-terracotta hover:bg-terracotta-hover active:scale-98 text-white font-display font-bold text-sm shadow-md shadow-terracotta/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{submitting ? 'Saving...' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
