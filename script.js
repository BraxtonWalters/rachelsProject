// HOLIDAY NOTICES AND TODAY'S HOURS CODE
var AFTER_HOURS_LINK = "https://ocls.indwes.edu/tutorials/ocls-answers";
var ONE_HOUR = 3600000;
var TIMEZONE = "America/New_York";
var TIMEZONE_ABBR = "ET";

function getLocalDate(date = new Date()) {
  return new Date(date.toLocaleString("en-US", { timeZone: TIMEZONE }));
}

//HOLIDAY NOTICE BANNER - MONTHS ARE ZERO BASED Jan is 0 - TIME IS MILITARY TIME
var holidayNotices = [
  {
    startDate: getLocalDate(new Date(2026, 0, 13, 9)), // January 13, 2026 @ 9 am
    endDate: getLocalDate(new Date(2026, 0, 16, 17)), // January 16, 2025 @ 5 pm
    message:
      "<strong><center><p style='font-size:16px'> OCLS will be closed for MLK Jr. Day starting Friday, January 16, at 5 pm (ET).<br /> We reopen Tuesday, January 20, at 8 am (ET). <br /> The databases and tutorials are available 24/7.</center></strong></p>",
  },
  {
    startDate: getLocalDate(new Date(2026, 0, 16, 17)), // January 16, 2025 @ 5 pm
    endDate: getLocalDate(new Date(2026, 0, 20, 7)), // January 20, 2026 @ 7 am
    message:
      "<strong><center><p style='font-size:16px'> OCLS is closed for MLK Jr. Day. <br /> We reopen Tuesday, January 20, at 8 am (ET). <br /> The databases and tutorials are available 24/7.</center></strong></p>",
  },
];

//REGULAR HOURS DO NOT CHANGE HOLIDAY HOURS ARE LISTED BELOW
var regularHours = [
  { day: 0, isOpen: false },                                                   // Sunday
  { day: 1, isOpen: true, startHour: 8, startMin: 0, endHour: 20, endMin: 0 }, // Monday
  { day: 2, isOpen: true, startHour: 8, startMin: 0, endHour: 20, endMin: 0 }, // Tuesday
  { day: 3, isOpen: true, startHour: 8, startMin: 0, endHour: 20, endMin: 0 }, // Wednesday
  { day: 4, isOpen: true, startHour: 8, startMin: 0, endHour: 20, endMin: 0 }, // Thursday
  { day: 5, isOpen: true, startHour: 8, startMin: 0, endHour: 17, endMin: 0 }, // Friday
  { day: 6, isOpen: false },                                                   // Saturday
];

//SPECIAL TODAY'S HOURS - PUT DAYS WHERE HOURS ARE DIFF THAN NORMAL OR WE ARE CLOSED - JAN NOT 0 BASED HERE - NORMAL DATE NUMBERS YYYY-MM-DD -->
var overrideHours = [
  {
    isOpen: true,
    date: "2026-01-16", // January 16
    startHour: 8, // Open at 8 am
    endHour: 17, // Close at 5 pm
  },
  {
    isOpen: false,
    date: "2026-01-19", // CLOSED January 19
  },
];

//CODE BELOW IS THE BACKEND CODE
function checkHolidayNotice(today, holidayNotices) {
  var estToday = getLocalDate(today);
  var currentNotice = null;

  for (var i = 0; i < holidayNotices.length; i++) {
    var notice = holidayNotices[i];
    if (estToday >= notice.startDate && estToday <= notice.endDate) {
      currentNotice = notice;
      break;
    }
  }

  if (currentNotice) {
    var messageContainer =
      '<div class="alert alert-danger" role="alert">' +
      "<center>" +
      '<p style="font-size:16px"><strong>' +
      currentNotice.message +
      "</strong></p>" +
      "</center>" +
      "</div>";
    return messageContainer;
  }
  return null;
}

function checkOverrides(today, overrides) {
  var estToday = getLocalDate(today);

  function padNumber(num) {
    return num < 10 ? "0" + num : num;
  }

  var todayString =
    estToday.getFullYear() +
    "-" +
    padNumber(estToday.getMonth() + 1) +
    "-" +
    padNumber(estToday.getDate());

  var override = null;
  for (var i = 0; i < overrides.length; i++) {
    if (todayString === overrides[i].date) {
      override = overrides[i];
      break;
    }
  }

  if (!override) {
    return { isOverride: false };
  }

  if (override.isOpen) {
    return {
      isOverride: true,
      isOpen: override.isOpen,
      startHour: override.startHour,
      startMin: override.startMin || 0,
      endHour: override.endHour,
      endMin: override.endMin || 0,
    };
  }

  return {
    isOverride: true,
    isOpen: override.isOpen,
  };
}

function timeFormatter(startHour, startMin, endHour, endMin) {
  function formatTime(hour, min) {
    var suffix = hour >= 12 ? "pm" : "am";
    var displayHour = hour % 12;
    if (displayHour === 0) {
      displayHour = 12;
    }
    if (min === 0) {
      return displayHour + " " + suffix;
    }
    return displayHour + ":" + (min < 10 ? "0" : "") + min + " " + suffix;
  }

  var start = new Date();
  start.setHours(startHour, startMin, 0);

  var end = new Date();
  end.setHours(endHour, endMin, 0);

  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    var formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: TIMEZONE,
    });
    var startStr = formatter.format(start);
    var endStr = formatter.format(end);
    // Remove :00 for times on the hour for cleaner display
    startStr = startStr.replace(/:00/, "");
    endStr = endStr.replace(/:00/, "");
    return startStr + " - " + endStr + " (" + TIMEZONE_ABBR + ")";
  }

  return (
    formatTime(startHour, startMin) +
    " - " +
    formatTime(endHour, endMin) +
    " (" +
    TIMEZONE_ABBR +
    ")"
  );
}

function updateHoursAndNotices() {
  var today = new Date();
  var notice = checkHolidayNotice(today, holidayNotices);
  var alertContainer = document.getElementById("holiday-alert-container");

  if (notice) {
    if (!alertContainer) {
      if (document && document.body) {
        var newAlertContainer = document.createElement("div");
        newAlertContainer.id = "holiday-alert-container";
        document.body.insertBefore(
          newAlertContainer,
          document.body.firstChild || null
        );
        newAlertContainer.innerHTML = notice;
      }
    } else {
      alertContainer.innerHTML = notice;
    }
  } else if (alertContainer) {
    alertContainer.remove();
  }

  var override = checkOverrides(today, overrideHours);
  var message = "";
  var isAfterHours = false;

  function isCurrentlyOpen(startHour, startMin, endHour, endMin) {
    var now = getLocalDate(today);
    var currentMinutes = now.getHours() * 60 + now.getMinutes();
    var openMinutes = startHour * 60 + startMin;
    var closeMinutes = endHour * 60 + endMin;
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  if (!override.isOverride) {
    var day = regularHours[getLocalDate(today).getDay()];
    console.log(day);
    if (
      day.isOpen &&
      isCurrentlyOpen(day.startHour, day.startMin, day.endHour, day.endMin)
    ) {
      message =
        "Open today: " +
        timeFormatter(day.startHour, day.startMin, day.endHour, day.endMin);
    } else {
      message = "Closed";
      isAfterHours = true;
    }
  }

  if (override.isOverride) {
    if (
      override.isOpen &&
      isCurrentlyOpen(
        override.startHour,
        override.startMin,
        override.endHour,
        override.endMin,
      )
    ) {
      message =
        "Open today: " +
        timeFormatter(
          override.startHour,
          override.startMin,
          override.endHour,
          override.endMin,
        );
    } else {
      message = "Closed";
      isAfterHours = true;
    }
  }

  if (override.isOverride && !override.isOpen) {
    message = "Closed";
    isAfterHours = true;
  }

  // TODAY'S HOURS AND AFTER HOURS
  var hoursString =
    '<strong><span style="color:#a6192e;"><span aria-hidden="true" class="fas fa-clock"></span> ' +
    message +
    "</span></strong>";

  var messageText = isAfterHours
    ? '<p><strong><a href="' +
      AFTER_HOURS_LINK +
      '" target="_blank"><span style="color:#002e44;">After Hours & Weekend Help</span></a></strong></p>'
    : '<p style="margin:0"><span style="font-size:14px;">Librarians may not be available during all open hours but will answer ASAP.</span></p>';

  var hoursContainer = document.getElementById("todaysHours");
  if (hoursContainer) {
    hoursContainer.innerHTML = hoursString + " " + messageText;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateHoursAndNotices();
  setInterval(updateHoursAndNotices, ONE_HOUR);
});
