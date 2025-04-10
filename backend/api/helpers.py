import os
import subprocess
import re
import time
import requests
from bs4 import BeautifulSoup
import re


def get_result(moss_url):
    if not moss_url:
        return []
    codes = []
    response = requests.get(moss_url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")

        for link in soup.find_all("a"):
            text = link.get_text()
            match = re.findall(r'(.+?) \((\d+%)\)', text)
            if match:
                codes.append(match[0])
    else:
        print("Failed to fetch MOSS results.")
    return codes


def check_plagiarism():
    moss_url = ""
    codes = []
    files = [os.path.join("codes", f) for f in os.listdir("codes")]
    if (len(files) < 10):
        print(os.listdir())
        command = [
            "perl", "api/moss.pl"] + files
        process = subprocess.Popen(
            command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        while process.poll() is None:
            print("Still waiting...")
            time.sleep(5)
        stdout, stderr = process.communicate()
        if stderr:
            print(f"Error: {stderr}")

        print(stdout)
        match = re.search(
            r'(http://moss\.stanford\.edu/results/\d+/\d+)', stdout)
        if match:
            moss_url = match.group(1)
            codes += get_result(moss_url)
        # print(moss_url)
        main = {}
        for i in codes:
            if i not in main:
                main[i[0]] = i[1].replace("%", "")
            else:
                for k in main:
                    if k == i:
                        main[k] = (int(main[k]) +
                                   int(i[0][1].replace("%", ""))) / 2
        with open("plagiarism.txt", "w") as f:
            f.write(moss_url)
        for i in files:
            if i not in main:
                main[i] = 0
        print(main)
        return main
    command = ["perl", "api/moss.pl"] + \
        files[:len(files)//2]
    process = subprocess.run(command, capture_output=True, text=True)

    if process.stderr:
        print(f"Error: {process.stderr}")

    match = re.search(
        r'(http://moss\.stanford\.edu/results/\d+/\d+)', process.stdout)
    if match:
        moss_url = match.group(1)
        codes += get_result(moss_url)
    # print(moss_url)
    command = ["perl", "api/moss.pl"] + \
        files[len(files)//2:]
    process = subprocess.run(command, capture_output=True, text=True)
    if process.stderr:
        print(f"Error: {process.stderr}")
    match = re.search(
        r'(http://moss\.stanford\.edu/results/\d+/\d+)', process.stdout)
    if match:
        moss_url = match.group(1)
        codes += get_result(moss_url)
    # print(moss_url)

    main = {}
    for i in codes:
        if i not in main:
            main[i[0]] = i[1].replace("%", "")
        else:
            for k in main:
                if k == i:
                    main[k] = (int(main[k]) +
                               int(i[0][1].replace("%", ""))) / 2
    for i in files:
        if i not in main:
            main[i] = 0
    return main
