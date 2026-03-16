const PHONE = '3076993743';
const FORMSPREE_ID = 'REPLACE_WITH_FORMSPREE_ID'; // REPLACE: Your Formspree form ID
const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_ID}`;
const NEED_MAP = {
    'looking': 'Looking for a vehicle',
    'payment': 'Payment/financing help',
    'trade': 'Trade-in value',
    'espanol': 'Ayuda en español',
    'refer': 'Referring someone'
};

function formatPrice(num) {
    return '$' + num.toLocaleString('en-US');
}

function loadInventory() {
    fetch('data/inventory.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (vehicles) {
            var scroll = document.querySelector('.inventory-scroll');
            vehicles.forEach(function (vehicle) {
                var card = document.createElement('a');
                card.className = 'inv-card';
                card.href = 'sms:' + PHONE + '?body=' + encodeURIComponent(vehicle.smsBody);
                card.innerHTML =
                    '<div class="inv-img">' +
                    '<img src="' + vehicle.image + '" alt="' + vehicle.title + '" onerror="this.parentElement.innerHTML=\'🚗\';this.parentElement.classList.add(\'inv-img--fallback\')">' +
                    '</div>' +
                    '<div class="inv-info">' +
                    '<div class="inv-title">' + vehicle.title + '</div>' +
                    '<div class="inv-price">' + formatPrice(vehicle.price) + '</div>' +
                    '</div>';
                scroll.appendChild(card);
            });
        })
        .catch(function () {
            var section = document.querySelector('.inventory-section');
            if (section) {
                section.style.display = 'none';
            }
        });
}

function handleFormSubmit(event) {
    event.preventDefault();

    var name = document.getElementById('fname').value;
    var phone = document.getElementById('fphone').value;
    var need = document.getElementById('fneed').value;
    var details = document.getElementById('fdetails').value;

    fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            phone: phone,
            need: NEED_MAP[need] || 'Not specified',
            details: details,
            _subject: 'YENES Lead: ' + name + ' - ' + (NEED_MAP[need] || 'Vehicle inquiry')
        })
    })
        .then(function (response) {
            if (response.ok) {
                document.getElementById('contactForm').style.display = 'none';
                document.getElementById('formSuccess').classList.add('active');
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(function () {
            var body = 'YENES Lead:\nName: ' + name + '\nPhone: ' + phone + '\nNeed: ' + (NEED_MAP[need] || 'Not specified') + '\nDetails: ' + details;
            window.location.href = 'sms:' + PHONE + '?body=' + encodeURIComponent(body);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    loadInventory();
    document.getElementById('contactForm').addEventListener('submit', handleFormSubmit);
});
