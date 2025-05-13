import { DateTimeStyle } from '../enums';

// Options for localized formatting
export type TFormatLocalizedOptions = {
  dateStyle: DateTimeStyle;
  timeStyle: DateTimeStyle;
  hour12: boolean;
};
