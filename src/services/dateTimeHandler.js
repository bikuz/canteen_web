
export function secondsToTime24(time_in_seconds) {
    if (time_in_seconds == null || isNaN(time_in_seconds)) {
        return '00:00';
    }

    const hours = Math.floor(time_in_seconds / 3600);
    const minutes = Math.floor((time_in_seconds - (hours * 3600)) / 60);
    const seconds = time_in_seconds - (hours * 3600) - (minutes * 60);

    // const timeString = hours.toString().padStart(2, '0') + ':' 
    //   + minutes.toString().padStart(2, '0') + ':' 
    //   + seconds.toString().padStart(2, '0');
    return hours.toString().padStart(2, '0') + ':' 
      + minutes.toString().padStart(2, '0');
}

export function secondsToTime12(time_in_seconds) {
    if (time_in_seconds == null || isNaN(time_in_seconds)) {
        return '12:00 AM'; // Default to 12:00 AM if the input is invalid
    }

    const totalMinutes = Math.floor(time_in_seconds / 60);
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Convert 24-hour format to 12-hour format
    const hours12 = hours24 % 12 || 12; // Convert 0 to 12 for midnight
    const period = hours24 >= 12 ? 'PM' : 'AM';

    // Construct the time string
    return (
        hours12.toString().padStart(2, '0') +
        ':' +
        minutes.toString().padStart(2, '0') +
        ' ' +
        period
    );
}

export function timeToSeconds(time) {
    if (!time) {
        return 0;
    }
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60;
}

  

 
