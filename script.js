const AFTER_HOURS_LINK = 'https://ocls.indwes.edu/tutorials/ocls-answers';
const ONE_HOUR = 3600000;

const getEstDate = (date = new Date()) => {
    return new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
};

const holidayNotices = [
    {
        startDate: getEstDate(new Date(2024, 11, 17, 0)), // December 17, 2024
        endDate: getEstDate(new Date(2024, 11, 23, 17)), // December 23, 2024
        message: "🎄 OCLS will close for Christmas and the New Year starting Monday, December 23, at 5 pm (ET). 🎄<br />We reopen Thursday, January 2, at 8 am (ET)<br>The databases and tutorials are available 24/7."
    },
    {
        startDate: getEstDate(new Date(2024, 11, 23, 17)), // December 23, 2024 
        endDate: getEstDate(new Date(2025, 0, 1, 23)), // January 1, 2025
        message: "We are closed for Christmas and the New Year. We reopen Thursday, January 2, at 8 am (ET).<br />The databases and tutorials are available 24/7."
    }
];

const regularHours = [
    { day: 0, isOpen: false, hours: null },              // Sunday
    { day: 1, isOpen: true, startHour: 8, endHour: 20 }, // Monday
    { day: 2, isOpen: true, startHour: 8, endHour: 20 }, // Tuesday
    { day: 3, isOpen: true, startHour: 8, endHour: 20 }, // Wednesday
    { day: 4, isOpen: true, startHour: 8, endHour: 20 }, // Thursday
    { day: 5, isOpen: true, startHour: 8, endHour: 17 }, // Friday
    { day: 6, isOpen: false, hours: null }               // Saturday
];

const overrideHours = [
    {
        isOpen: true,
        date: "2024-12-23",
        startHour: 8,
        endHour: 17
    },
    {
        isOpen: false,
        date: "2024-12-24",
    },
    {
        isOpen: false,
        date: "2024-12-25",
    },
    {
        isOpen: false,
        date: "2024-12-26",
    },
    {
        isOpen: false,
        date: "2024-12-27",
    },
    {
        isOpen: false,
        date: "2024-12-28",
    },
    {
        isOpen: false,
        date: "2024-12-29",
    },
    {
        isOpen: false,
        date: "2024-12-30",
    },
    {
        isOpen: false,
        date: "2024-12-31",
    },
    {
        isOpen: false,
        date: "2025-01-01",
    },
];

const checkHolidayNotice = (today, holidayNotices) => {
    const estToday = getEstDate(today);
    const currentNotice = holidayNotices.find(notice =>
        estToday >= notice.startDate &&
        estToday <= notice.endDate
    );
    if (currentNotice) {
        const messageContainer = `<div class="alert alert-danger" role="alert">
            <center>
                <p style="font-size:16px"><strong>${currentNotice.message}</strong></p>
            </center>
        </div>`;
        return messageContainer;
    }
    return null;
};

const checkOverrides = (today, overrides) => {
    const estToday = getEstDate(today);
    const todayString = `${estToday.getFullYear()}-${String(estToday.getMonth() + 1).padStart(2, '0')}-${String(estToday.getDate()).padStart(2, '0')}`;

    const override = overrides.find(override => todayString === override.date);

    if (!override) return { isOverride: false };

    if (override.isOpen) {
        return {
            isOverride: true,
            isOpen: override.isOpen,
            startHour: override.startHour,
            endHour: override.endHour
        };
    };

    return {
        isOverride: true,
        isOpen: override.isOpen,
    };
};

const timeFormatter = (startHour, endHour) => {
    const start = new Date().setHours(startHour, 0, 0);
    const end = new Date().setHours(endHour, 0, 0);

    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: true,
        timeZone: 'America/New_York'
    });

    return `${formatter.format(start)} - ${formatter.format(end)} (ET)`;
}

const updateHoursAndNotices = () => {
    const today = new Date();
    const notice = checkHolidayNotice(today, holidayNotices)
    const alertContainer = document.getElementById("holiday-alert-container");

    if (notice) {
        if (!alertContainer) {
            const newAlertContainer = document.createElement("div");
            newAlertContainer.id = "holiday-alert-container";
            const firstElement = document.body.firstChild;
            document.body.insertBefore(newAlertContainer, firstElement);
            newAlertContainer.innerHTML = notice;
        } else {
            alertContainer.innerHTML = notice;
        }
    } else if (alertContainer) {
        alertContainer.remove();
    }

    const override = checkOverrides(today, overrideHours);

    let message = "";
    let isAfterHours = false

    if (!override.isOverride) {
        const day = regularHours[getEstDate(today).getDay()];
        console.log(day)
        if (day.isOpen &&
            day.startHour <= getEstDate(today).getHours() &&
            day.endHour > getEstDate(today).getHours()
        ) {
            message = `Open today: ${timeFormatter(day.startHour, day.endHour)}`
        } else {
            message = `Closed`;
            isAfterHours = true;
        }
    }

    if (override.isOverride) {
        if (override.isOpen &&
            override.startHour <= getEstDate(today).getHours() &&
            override.endHour > getEstDate(today).getHours()
        ) {
            message = `Open today: ${timeFormatter(override.startHour, override.endHour)}`
        } else {
            message = `Closed`;
            isAfterHours = true;
        }
    }

    if (override.isOverride && (!override.isOpen)) {
        message = `Closed`;
        isAfterHours = true;
    }

    const hoursString = `<strong><span style="color:#a6192e;"><span aria-hidden="true" class="fas fa-clock"></span> ${message}</span></strong>`

    const messageText = isAfterHours ?
        `<p><strong><a href="${AFTER_HOURS_LINK}" target="_blank"><span style="color:#002e44;">After Hours & Weekend Help</span></a></strong></p>` :
        `<p style="margin:0"><span style="font-size:14px;">Librarians may not be available during all open hours but will answer ASAP.</span></p>`;

    const hoursContainer = document.getElementById("todaysHours");

    if (hoursContainer) {
        hoursContainer.innerHTML = `${hoursString} ${messageText}`;
    }
};

updateHoursAndNotices();

setInterval(updateHoursAndNotices, ONE_HOUR);