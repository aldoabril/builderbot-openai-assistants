import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz';

const TIME_ZONE = process.env.TZ

const getFullCurrentDate = (): string => {
    const currentD = new Date();
    const formatDate = format(utcToZonedTime(currentD, TIME_ZONE), 'yyyy/MM/dd HH:mm');
    const day = format(utcToZonedTime(currentD, TIME_ZONE), 'EEEE');

    return [
        formatDate,
        day,
    ].join(' ')

}

function calculateDateRange(fecha: Date) {
    const lastDayOfMonth = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    const oneWeekBefore = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);

    return { startDate: oneWeekBefore, endDate: lastDayOfMonth };
}


export { getFullCurrentDate }