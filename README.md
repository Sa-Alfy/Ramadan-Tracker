# Ramadan Tracker

This is a small Flask app to show Ramadan prayer times and a countdown to Iftar.

Deploying to Replit via GitHub

1. Push this repository to GitHub (already done).
2. On Replit, choose "Create" → "Import from GitHub" and paste:

   https://github.com/Sa-Alfy/Ramadan-Tracker.git

3. Replit should detect a Python project. If it doesn't, set the run command to:

```
python app.py
```

4. Start the repl. The app listens on port provided by Replit automatically (`PORT`) and binds to `0.0.0.0`.

Local run

```
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```
