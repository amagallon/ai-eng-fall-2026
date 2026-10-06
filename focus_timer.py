from datetime import date
import time


import json
from datetime import date
from pathlib import Path
import time


LOG_FILE = Path(__file__).with_name("focus_log.json")


def load_sessions(path=LOG_FILE):
    if not path.exists():
        return []

    with path.open(encoding="utf-8") as log_file:
        return json.load(log_file)


def save_sessions(sessions, path=LOG_FILE):
    with path.open("w", encoding="utf-8") as log_file:
        json.dump(sessions, log_file, indent=2)


def record_session():
    name = input("Session name: ")
    start_time = time.monotonic()
    input("Press Enter when you're done.")
    elapsed_seconds = time.monotonic() - start_time

    return {
        "name": name,
        "date": date.today().isoformat(),
        "minutes": round(elapsed_seconds / 60, 1),
    }


def print_summary(sessions):
    if not sessions:
        print("No focus sessions logged today.")
        return

    totals = {}
    for session in sessions:
        name = session["name"]
        totals[name] = totals.get(name, 0) + session["minutes"]

    for name, minutes in totals.items():
        print(f"{name}: {minutes:.1f} min")

    grand_total = sum(totals.values())
    print(f"Total: {grand_total:.1f} min")


def main():
    sessions = load_sessions()

    while True:
        print("1. Start a focus session")
        print("2. Show today's summary")
        print("3. Quit")

        choice = input("Choose an option: ").strip()

        if choice == "1":
            sessions.append(record_session())
            save_sessions(sessions)
        elif choice == "2":
            today = date.today().isoformat()
            todays_sessions = [
                session for session in sessions if session["date"] == today
            ]
            print_summary(todays_sessions)
        elif choice == "3":
            print("Quit: placeholder")
            break
        else:
            print("Not a valid choice")


if __name__ == "__main__":
    main()