// Request Notification permission
if (Notification.permission === 'default') {
	Notification.requestPermission().then((permission) => {
		console.log('Notification permission:', permission);
	});
}

// Load reminders from localStorage on page load
document.addEventListener('DOMContentLoaded', loadReminders);

// Function to add a new reminder
function addReminder() {
	const timeInput = document.getElementById('reminder-time').value;
	const messageInput = document.getElementById('reminder-message').value;

	if (!timeInput || !messageInput) {
		alert('Please fill in both the date/time and message fields.');
		return;
	}

	const reminder = {
		id: Date.now(),
		time: timeInput,
		message: messageInput,
		notified: false,
	};

	// Save reminder to localStorage
	saveReminder(reminder);

	// Display reminder
	displayReminder(reminder);

	// Schedule notification
	scheduleNotification(reminder);

	// Clear input fields
	document.getElementById('reminder-time').value = '';
	document.getElementById('reminder-message').value = '';
}

// Save reminder to localStorage
function saveReminder(reminder) {
	const reminders = getReminders();
	reminders.push(reminder);
	localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Get reminders from localStorage
function getReminders() {
	const reminders = localStorage.getItem('reminders');
	return reminders ? JSON.parse(reminders) : [];
}

// Load reminders from localStorage and display them
function loadReminders() {
	const reminders = getReminders();
	reminders.forEach((reminder) => {
		displayReminder(reminder);
		// Schedule notification if not yet notified
		if (!reminder.notified) {
			scheduleNotification(reminder);
		}
	});
}

// Display a reminder card
function displayReminder(reminder) {
	const remindersList = document.getElementById('reminders-list');

	// Create reminder card
	const reminderCard = document.createElement('div');
	reminderCard.classList.add('reminder-card');
	reminderCard.setAttribute('id', `reminder-${reminder.id}`);

	// Date and time formatting
	const date = new Date(reminder.time);
	const formattedDate = date.toISOString().split('T')[0];
	const formattedTime = date.toTimeString().split(' ')[0].substring(0, 5);

	// Card content
	reminderCard.innerHTML = `
    <span>${formattedDate} ${formattedTime} - ${reminder.message}</span>
    <button class="delete-btn" onclick="deleteReminder(${reminder.id})">X</button>
  `;

	remindersList.appendChild(reminderCard);
}

// Delete reminder by ID
function deleteReminder(id) {
	const reminders = getReminders().filter((reminder) => reminder.id !== id);
	localStorage.setItem('reminders', JSON.stringify(reminders));

	const reminderCard = document.getElementById(`reminder-${id}`);
	if (reminderCard) {
		reminderCard.remove();
	}
}

// Schedule a notification
function scheduleNotification(reminder) {
	const reminderTime = new Date(reminder.time).getTime();
	const currentTime = new Date().getTime();
	const timeDifference = reminderTime - currentTime;

	if (timeDifference > 0) {
		document
			.getElementById(`reminder-${reminder.id}`)
			.classList.add('done');
		setTimeout(() => {
			showNotification(reminder);
			markNotified(reminder.id);
		}, timeDifference);
	}
}

// Show browser notification
function showNotification(reminder) {
	if (Notification.permission === 'granted') {
		new Notification('Reminder', {
			body: reminder.message,
			icon: './image.png',
		});
	} else {
		alert(reminder.message);
	}
}

// Mark a reminder as notified in localStorage
function markNotified(id) {
	const reminders = getReminders();
	const updatedReminders = reminders.map((reminder) => {
		if (reminder.id === id) {
			return { ...reminder, notified: true };
		}
		return reminder;
	});
	localStorage.setItem('reminders', JSON.stringify(updatedReminders));
}
