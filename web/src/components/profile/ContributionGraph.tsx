'use client'

import React from 'react'
import { clsx } from 'clsx'
import { Appointment, SalesReport } from '@/data/mock'

interface ContributionGraphProps {
  data: SalesReport[] | Appointment[];
  isBusiness: boolean;
  onDateClick: (date: string) => void;
}

export function ContributionGraph({ data, isBusiness, onDateClick }: ContributionGraphProps) {
  // Generate last 60 days
  const today = new Date();
  const days = [];
  for (let i = -30; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const getColor = (dateStr: string) => {
    let count = 0;
    if (isBusiness) {
        // Data is sales report array [{ date: 'YYYY-MM-DD', count: N, total: M }]
        const dayData = (data as SalesReport[]).find((d) => d.date.split('T')[0] === dateStr);
        count = dayData ? dayData.count : 0;
    } else {
        // Data is appointments array
        count = (data as Appointment[]).filter((a) => {
            if (!a.appointment_date) return false;
            const apptDate = a.appointment_date.replace(' ', 'T').split('T')[0];
            return apptDate === dateStr;
        }).length;
    }

    if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (count === 1) return 'bg-[#9BE9A8]';
    if (count === 2) return 'bg-[#40C463]';
    if (count === 3) return 'bg-[#30A14E]';
    return 'bg-[#216E39]';
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-bold mb-4 text-center">
        {isBusiness ? 'Sales Activity' : 'Appointment Activity'}
      </h3>
      <div className="flex flex-wrap gap-1 justify-center">
        {days.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const isToday = dateStr === today.toISOString().split('T')[0];
          return (
            <div
              key={index}
              onClick={() => onDateClick(dateStr)}
              title={dateStr}
              className={clsx(
                "w-3 h-3 sm:w-4 sm:h-4 rounded-sm cursor-pointer transition-colors hover:border-black/20 hover:border",
                getColor(dateStr),
                isToday && "ring-2 ring-junr-blue ring-offset-1 dark:ring-offset-gray-800"
              )}
            />
          );
        })}
      </div>
    </div>
  )
}
