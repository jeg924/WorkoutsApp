import { min } from "react-native-reanimated";

export function DisplayTimeSegment(exercises, order, duration) {
  var startingTime = 0;
  for (let i = 0; i < order; i++) {
    startingTime += exercises[i].duration; // add up all the time before the exercise;
  }
  var startingSecond = Math.floor((startingTime / 1000) % 60),
    startingMinute = Math.floor((startingTime / (1000 * 60)) % 60),
    startingHour = Math.floor((startingTime / (1000 * 60 * 60)) % 24);

  var endingSecond = Math.floor(((startingTime + duration) / 1000) % 60),
    endingMinute = Math.floor(((startingTime + duration) / (1000 * 60)) % 60),
    endingHour = Math.floor(
      ((startingTime + duration) / (1000 * 60 * 60)) % 24
    );

  if (startingHour === 0) {
    startingHour = "";
  } else {
    startingHour = startingHour + ":";
  }
  if (startingHour > 0 && startingMinute < 10) {
    startingMinute = "0" + startingMinute + ":";
  } else {
    startingMinute = startingMinute + ":";
  }
  if (startingSecond < 10) {
    startingSecond = "0" + startingSecond;
  }

  if (endingHour === 0) {
    endingHour = "";
  } else {
    endingHour = endingHour + ":";
  }
  if (endingHour > 0 && endingMinute < 10) {
    endingMinute = "0" + endingMinute + ":";
  } else {
    endingMinute = endingMinute + ":";
  }
  if (endingSecond < 10) {
    endingSecond = "0" + endingSecond;
  }

  return (
    startingHour +
    startingMinute +
    startingSecond +
    "-" +
    endingHour +
    endingMinute +
    endingSecond
  );
}

export function DisplayMaxTime(timeInMinutes) {
  timeInMinutes *= 90;

  var hours = Math.floor(timeInMinutes / 60),
    minutes = Math.floor(timeInMinutes % 60);

  if (hours > 0) {
    if (minutes > 10) {
      return hours + ":" + minutes + ":00";
    } else {
      return hours + ":0" + minutes + ":00";
    }
  } else {
    if (minutes > 10) {
      return minutes + ":00";
    } else {
      return "0" + minutes + ":00";
    }
  }
}

export function DisplayTime(timeInMicroSeconds) {
  var second = Math.floor((timeInMicroSeconds / 1000) % 60),
    minute = Math.floor((timeInMicroSeconds / (1000 * 60)) % 60),
    hour = Math.floor((timeInMicroSeconds / (1000 * 60 * 60)) % 24);

  if (hour === 0) {
    hour = "";
  } else {
    hour = hour + ":";
  }
  if (hour > 0 && minute < 10) {
    minute = "0" + minute + ":";
  } else {
    minute = minute + ":";
  }
  if (second < 10) {
    second = "0" + second;
  }

  return hour + minute + second;
}
