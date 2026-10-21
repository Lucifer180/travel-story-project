import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// "Do" (1st, 2nd...) needs advancedFormat; typed dates need customParseFormat.
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

export default dayjs;
