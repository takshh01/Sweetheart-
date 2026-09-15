import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Heart, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerPageProps {
  onSaveDate: (formattedDate: string) => void;
  isSaving?: boolean;
}

export function DatePickerPage({ onSaveDate, isSaving }: DatePickerPageProps) {
  // Start around the current date or tomorrow
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + 3);
    return nextDate;
  });

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate calendar grid days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const picked = new Date(year, month, day);
    setSelectedDate(picked);
    setErrorMsg(null);
  };

  const formatDisplayDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = () => {
    if (!selectedDate) {
      setErrorMsg('Please choose a special date for us.');
      return;
    }
    const formatted = formatDisplayDate(selectedDate);
    onSaveDate(formatted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-8 select-none"
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FCE7EB] text-[#8C1D30] mb-1">
          <Heart className="w-6 h-6 fill-[#8C1D30]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
          You said YES ❤️
        </h1>
        <p className="text-[#8C1D30] font-medium text-sm sm:text-base">
          Now let's make it real.
        </p>
      </div>

      {/* Date Picker Card */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-[#F3D8DC] shadow-[0_16px_45px_rgba(107,29,47,0.08)] flex flex-col items-center">
        <div className="flex items-center gap-2 mb-5">
          <CalendarIcon className="w-5 h-5 text-[#8C1D30]" />
          <h2 className="font-serif text-2xl text-[#1C1917]">
            Pick a date
          </h2>
        </div>

        {/* Month Navigation */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#57534E] active:scale-95 transition-all cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg text-[#1C1917] font-medium">
            {months[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#57534E] active:scale-95 transition-all cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="w-full grid grid-cols-7 text-center mb-2 text-xs font-semibold text-[#A8A29E]">
          {daysOfWeek.map(d => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="w-full grid grid-cols-7 gap-1 text-center text-sm">
          {/* Empty prefix slots */}
          {[...Array(firstDayIndex)].map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}

          {/* Month days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const isSelected =
              selectedDate &&
              selectedDate.getDate() === dayNum &&
              selectedDate.getMonth() === month &&
              selectedDate.getFullYear() === year;

            return (
              <button
                key={dayNum}
                onClick={() => handleSelectDay(dayNum)}
                className={`w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center font-sans transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#8C1D30] text-white font-semibold shadow-md scale-105'
                    : 'text-[#292524] hover:bg-[#FAF6F0] active:scale-95'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Selected Date Summary Display */}
        <div className="mt-6 w-full p-3.5 rounded-2xl bg-[#FFF5F6] border border-[#F3D8DC] text-center">
          <p className="text-xs uppercase tracking-widest text-[#78716C] mb-0.5">
            Our Chosen Date
          </p>
          <p className="font-serif text-lg text-[#8C1D30] font-medium">
            {formatDisplayDate(selectedDate)}
          </p>
        </div>

        {errorMsg && (
          <p className="text-xs text-[#8C1D30] mt-3 font-medium">
            {errorMsg}
          </p>
        )}

        {/* Save Our Date Button */}
        <button
          id="save-our-date-button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="mt-6 w-full py-4 rounded-full font-serif text-base sm:text-lg font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] shadow-[0_10px_30px_rgba(140,29,48,0.25)] hover:shadow-[0_14px_35px_rgba(140,29,48,0.35)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <span>Saving Our Special Date...</span>
          ) : (
            <>
              <span>Save Our Date</span>
              <span>❤️</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
