"use client";

import DatePicker, {
  DateObject,
} from "react-multi-date-picker";

import TimePicker from "react-multi-date-picker/plugins/time_picker";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type PersianDatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function PersianDatePicker({
  value = "",
  onChange,
  placeholder = "انتخاب تاریخ و ساعت",
  disabled = false,
}: PersianDatePickerProps) {
  function handleChange(date: DateObject | null) {
    if (!date) {
      onChange("");
      return;
    }

    onChange(date.toDate().toISOString());
  }

  return (
    <DatePicker
      value={value || undefined}
      onChange={handleChange}
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      format="YYYY/MM/DD HH:mm"
      placeholder={placeholder}
      disabled={disabled}
      plugins={[
        <TimePicker
          key="time-picker"
          position="bottom"
        />,
      ]}
      className="persian-date-picker"
      containerClassName="persian-date-picker-container"
      inputClass="
        h-11
        w-full
        rounded-lg
        border border-input
        bg-background
        px-3
        text-sm
        text-foreground
        outline-none
        transition-all
        placeholder:text-muted-foreground
        hover:border-ring/50
        focus:border-ring
        focus:ring-2
        focus:ring-ring/20
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    />
  );
}