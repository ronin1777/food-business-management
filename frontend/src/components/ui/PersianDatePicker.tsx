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
  function handleChange(
    date: DateObject | null,
  ) {
    if (!date) {
      onChange("");
      return;
    }

    onChange(
      date.toDate().toISOString(),
    );
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
      calendarContainerStyle={{
        backgroundColor: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        fontFamily: "inherit",
        direction: "rtl",
      }}
      calendarStyle={{
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        borderRadius: "12px",
        padding: "12px",
      }}
      headerStyle={{
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        borderBottom: "1px solid hsl(var(--border))",
        padding: "8px 12px",
      }}
      weekDaysStyle={{
        color: "hsl(var(--muted-foreground))",
        fontWeight: "600",
        fontSize: "12px",
        padding: "8px 0",
        backgroundColor: "hsl(var(--muted))",
        borderRadius: "8px",
        marginBottom: "4px",
      }}
      daysStyle={{
        color: "hsl(var(--foreground))",
        fontSize: "14px",
        fontWeight: "500",
        padding: "6px 2px",
        borderRadius: "8px",
        transition: "all 0.15s",
      }}
      monthYearStyle={{
        color: "hsl(var(--foreground))",
        fontSize: "16px",
        fontWeight: "600",
      }}
      monthsStyle={{
        backgroundColor: "hsl(var(--background))",
        padding: "4px",
      }}
      selectedStyle={{
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
        borderRadius: "8px",
        fontWeight: "600",
      }}
      todayStyle={{
        border: "2px solid hsl(var(--primary))",
        borderRadius: "8px",
        fontWeight: "600",
      }}
      disabledDaysStyle={{
        color: "hsl(var(--muted-foreground))",
        opacity: "0.5",
      }}
      onMonthChangeStyle={{
        backgroundColor: "hsl(var(--muted))",
        borderRadius: "8px",
      }}
      yearPickerStyle={{
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "8px",
        padding: "8px",
      }}
      yearPickerSelectedStyle={{
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
        borderRadius: "6px",
      }}
      yearPickerItemStyle={{
        color: "hsl(var(--foreground))",
        padding: "4px 8px",
        borderRadius: "6px",
        transition: "all 0.15s",
        "&:hover": {
          backgroundColor: "hsl(var(--accent))",
        },
      }}
      monthPickerStyle={{
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "8px",
        padding: "8px",
      }}
      monthPickerSelectedStyle={{
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
        borderRadius: "6px",
      }}
      monthPickerItemStyle={{
        color: "hsl(var(--foreground))",
        padding: "4px 8px",
        borderRadius: "6px",
        transition: "all 0.15s",
        "&:hover": {
          backgroundColor: "hsl(var(--accent))",
        },
      }}
    />
  );
}