import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import moment from 'moment';
import {Dimensions, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const heightPercentageToDP = (
  heightPercent: string | number,
): number => {
  const percent =
    typeof heightPercent === 'string'
      ? parseFloat(heightPercent)
      : heightPercent;
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percent) / 100);
};

export const widthPercentageToDP = (widthPercent: string | number): number => {
  const percent =
    typeof widthPercent === 'string' ? parseFloat(widthPercent) : widthPercent;
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percent) / 100);
};

export const responsiveFontSize = (fontSize: number): number => {
  const scaleFactor = SCREEN_WIDTH / 375;
  return PixelRatio.roundToNearestPixel(fontSize * scaleFactor);
};

export const screenWidth = (): number => SCREEN_WIDTH;

export const screenHeight = (): number => SCREEN_HEIGHT;

// common regex patterns
export const phoneRegex = /^[0-9]{10}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const panRegex = /^[A-Z]{3}[ABCFGHLJPT][A-Z][0-9]{4}[A-Z]$/;
export const gstinRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/i;
export const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;

export const formatDateToYearToDate = (date: Date | null): string | null => {
  if (!date) return null;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const checkNetInfo = (
  callback?: (isConnected: boolean) => void,
): void => {
  NetInfo.fetch().then((state: NetInfoState) => {
    if (callback) {
      callback(state.isConnected ?? false);
    }
  });
};

export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  const visible = localPart.slice(0, 2);
  const hidden = '*'.repeat(Math.max(localPart.length - 2, 2));
  return `${visible}${hidden}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length < 4) return phone;
  const visible = phone.slice(-3);
  const hidden = '*'.repeat(phone.length - 3);
  return `${phone.slice(0, 2)}${hidden}${visible}`;
};

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatPublicationDates = (dates?: string[] | any): string => {
  if (!Array.isArray(dates) || dates.length === 0) return '';
  const sortedDates = [...dates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  if (sortedDates.length === 1) {
    return moment(sortedDates[0]).format('MMMM D, YYYY');
  }

  if (sortedDates.length === 2) {
    return `${moment(sortedDates[0]).format('MMMM D, YYYY')} & ${moment(
      sortedDates[1],
    ).format('MMMM D, YYYY')}`;
  }
  return `${moment(sortedDates[0]).format('MMMM D, YYYY')} to ${moment(
    sortedDates[sortedDates.length - 1],
  ).format('MMMM D, YYYY')}`;
};

export const getStatusColor = (status?: string) => {
  if (!status) return {bg: '#EAEAEA', text: '#777777'};

  switch (status.toLowerCase()) {
    // Success / Completed / Approved
    case 'success':
    case 'successful':
    case 'successfully':
    case 'approved':
    case 'completed':
    case 'confirmed':
    case 'order placed':
      return {bg: '#C4F8E2', text: '#06A561'};

    // Failed / Failure
    case 'failed':
    case 'failure':
      return {bg: '#FFF1DC', text: '#E2A33F'};

    // Rejected
    case 'rejected':
      return {bg: '#FFE7EA', text: '#F0142F'};

    // Cancelled
    // Pending / Draft / Awaiting Approval / Order Placed

    case 'pending':
    case 'draft':
    case 'cancelled':
      return {bg: '#FFF4CC90', text: '#FFC107'};

    case 'awaiting approval':
    case 'order placed - awaiting for approval':
      return {bg: '#E6F7FF', text: '#1890FF'};

    // Default fallback
    default:
      return {bg: '#EAEAEA', text: '#6B7280'};
  }
};

export const countBoldWordsFromTemplate = (template: any): number => {
  if (!template || !Array.isArray(template.elements)) return 0;

  let totalBoldWords = 0;
  const strongRegex = /<strong>(.*?)<\/strong>/gi;
  template.elements.forEach((element: any) => {
    const htmlContent =
      typeof element?.updatedText === 'string'
        ? element.updatedText
        : element?.defaultValue;

    if (!htmlContent) return;

    const matches = htmlContent.match(strongRegex);
    if (!matches) return;

    matches.forEach((match: string) => {
      const innerText = match.replace(/<\/?strong>/gi, '').trim();
      const wordCount = innerText.split(/\s+/).filter(Boolean).length;

      totalBoldWords += wordCount;
    });
  });

  return totalBoldWords;
};
