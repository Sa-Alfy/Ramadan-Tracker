from flask import Flask, render_template, request
from datetime import datetime
import requests
import random
import os

app = Flask(__name__)

RAMADAN_START = datetime(2026, 2, 19)

def format_12hr(time_str):
    # This takes "18:30" and returns "06:30 PM"
    # Some API timings include extra text like "05:00 (BDT)" - take first token
    try:
        core = time_str.split()[0]
        # Ensure format is HH:MM
        if ':' in core:
            return datetime.strptime(core, "%H:%M").strftime("%I:%M %p")
    except Exception:
        pass
    # Fallback: return original string
    return time_str

def get_ramadan_day():
    today = datetime.now()
    delta = today - RAMADAN_START
    day = delta.days + 1

    if 1 <= day <= 30:
        return f"Today is day {day} of Ramadan."
    elif day < 1:
        return "Ramadan has not started yet."
    else:
        return "Ramadan has ended."
    
# FIX 1: Pass 'city' into this function
def get_prayer_times(city):
    url = f"http://api.aladhan.com/v1/timingsByCity?city={city}&country=&method=1"
    try:
        response = requests.get(url).json()
        
        # Check if the API returned a 200 (Success) code
        if response['code'] == 200:
            raw_timings = response['data']['timings']
            formatted_timings = {k: format_12hr(v) for k, v in raw_timings.items() if ":" in v}
            return formatted_timings, True # City found!
        else:
            return {}, False # City not found
            
    except Exception as e:
        print(f"Error: {e}")
        return {}, False
    

def get_quran_verse():
    random_verse = random.randint(1, 6236)
    url = f"https://api.alquran.cloud/v1/ayah/{random_verse}/en.asad"
    try:
        response = requests.get(url).json()
        return response['data']
    except Exception as e:
        print(f"Error fetching Quran verse: {e}")
        return {"text": "Indeed, with hardship comes ease.", "surah": {"englishName": "Al-Inshirah"}, "numberInSurah": 5}

@app.route('/')
def home():
    city = request.args.get('city', 'Dhaka')
    day = get_ramadan_day()
    
    # We now get two things: the times AND a 'success' boolean
    prayer_times, success = get_prayer_times(city)
    
    # If city failed, default to Dhaka so the app doesn't crash
    error_msg = None
    if not success:
        error_msg = f"City '{city}' not found. Showing Dhaka instead."
        city = "Dhaka"
        prayer_times, _ = get_prayer_times(city)

    quran_verse = get_quran_verse()

    return render_template('index.html',
                           day=day,
                           prayer_times=prayer_times,
                           quran_verse=quran_verse,
                           CITY=city,
                           error_msg=error_msg)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host=host, port=port, debug=debug)